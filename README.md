# L&H Consulting — homepage

Marketing site for L&H Consulting (KI-Beratung & Implementierung), live at
[lhconsulting.services](https://lhconsulting.services).

```
Next.js 16 · React 19 · TypeScript · Tailwind 4
next-intl (de/en) · Supabase (Postgres) · Framer Motion · Zod
Vitest (unit) · Playwright (e2e) · GitHub Actions
Hosted on Vercel — auto-deploy on push to main
```

---

## Site structure

The single homepage scrolls through five sections, plus two legal pages:

| Section | Anchor | Purpose |
|---|---|---|
| Hero | `#hero` | Cyber-styled headline with `TypingText` + CTA |
| Services | `#services` | Three service cards: Strategy / Implementation / Training |
| References | `#references` | Live in-house projects as proof points |
| Pricing | `#pricing` | "Pakete auf Anfrage" → routes to contact form |
| Contact | `#contact` | RHF + Zod form, posts to `/api/contact` |

Legal: `/[locale]/impressum`, `/[locale]/datenschutz`.

Locales: `de` (default), `en`. Locale switcher in the header.

### Reference projects

Linked from the References section as evidence behind the "we make AI work" claim:

- **[CV-Schmiede](https://cvschmiede.com)** — AI-powered CV formatting for recruiters (Document AI · B2B SaaS · DSGVO).
- **[LiiPoster](https://liiposter.de)** — AI ghostwriter for LinkedIn (LLM Fine-Tuning · Image Generation · Automation).

---

## Architecture

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # fonts, metadataBase, viewport
│   │   ├── page.tsx            # composes all sections
│   │   ├── opengraph-image.tsx # 1200x630 PNG per locale (next/og)
│   │   ├── impressum/page.tsx
│   │   └── datenschutz/page.tsx
│   ├── api/contact/
│   │   ├── route.ts            # POST handler — Zod, sanitize, rate-limit
│   │   └── route.test.ts       # 17 vitest cases
│   ├── robots.ts               # /robots.txt
│   └── sitemap.ts              # /sitemap.xml with hreflang alternates
├── components/
│   ├── effects/                # CyberGrid, ParticleField, TypingText, …
│   ├── layout/                 # Header, Footer
│   ├── sections/               # Hero, Services, References, Pricing, Contact
│   └── ui/                     # Button, Input, LanguageToggle
├── i18n/                       # next-intl routing + de.json + en.json
├── lib/hooks/useReducedMotion.ts
└── proxy.ts                    # next-intl middleware (Next 16 file convention)

supabase/migrations/             # contacts table + RLS + ip_address column
e2e/homepage.spec.ts             # 6 playwright smoke tests
.github/workflows/ci.yml         # lint + unit + build + e2e on push/PR
```

The middleware file is `proxy.ts`, not `middleware.ts` — Next.js 16 renamed
the file convention. Functionality is identical.

---

## Security posture

**HTTP headers** (`next.config.ts`):

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy` with `default-src 'self'`, `connect-src` limited
  to the Supabase project URL, `base-uri 'self'`, `form-action 'self'`.
  The Supabase URL is `.trim()`'d before injection so a stray newline in the
  Vercel env never breaks browser CSP parsing.

**Contact API** (`src/app/api/contact/route.ts`):

- Content-type guard (415 on non-JSON), 100 KB body cap (413), JSON parse
  guard (400), strict Zod schema (400 with a generic message — Zod issue
  details are never leaked to clients).
- Hard-fails with **500** if Supabase env is missing — never returns a
  fake "success" to the user.
- Dual-key rate limit (email AND IP) with a 5-minute window, enforced by
  reading the `contacts` table directly.
- Sanitises the validated strings (control chars stripped, email lowercased,
  IP read from `x-real-ip` / first hop of `x-forwarded-for`).
- Server-only Supabase client uses the service-role key. The public anon
  client is not used by the homepage.

**Database** (`supabase/migrations/`):

- `public.contacts` enforces field-level CHECK constraints (length, locale
  enum, email regex).
- RLS enabled. Anonymous role has `INSERT`-only with a `WITH CHECK` clause
  that rejects locales other than `de`/`en`. No `SELECT`/`UPDATE`/`DELETE`
  policies for anon — service role bypasses RLS by design.
- `ip_address` is populated server-side via the service role; anon callers
  cannot set it.

---

## SEO / sharing

- `metadataBase` resolves OG/Twitter image URLs to the production host
  (`NEXT_PUBLIC_SITE_URL`, falling back to `VERCEL_PROJECT_PRODUCTION_URL`).
- `/robots.txt` disallows `/api/`, points crawlers to `/sitemap.xml`.
- `/sitemap.xml` lists `/`, `/impressum`, `/datenschutz` for both locales
  with `xhtml:link rel="alternate" hreflang=…"` cross-references.
- `app/[locale]/opengraph-image.tsx` builds a localized 1200×630 PNG at
  build time using the cyber-look brand (hex logo, cyan corner brackets,
  grid backdrop, headline pulled from the i18n messages). The same asset
  is auto-wired as the Twitter card image.

---

## Testing

```bash
npm test               # vitest run            — 17 unit tests, ~0.3s
npm run test:watch     # vitest                — watch mode
npm run test:coverage  # vitest run --coverage — v8 coverage HTML report
npm run test:e2e       # playwright test       —  6 e2e tests, ~12s
npm run test:e2e:ui    # playwright test --ui  — debugger UI
```

**Unit (`src/app/api/contact/route.test.ts`)** — covers all branches of
the contact handler:
- Guards: 415 wrong content-type, 413 oversized, 400 bad JSON.
- Schema validation: empty body, bad email, short message, long name,
  no Zod-issue leak in client errors.
- **Silent-failure prevention**: 500 when Supabase env is missing.
- Rate limiting: 429 by email, 429 by IP, no IP lookup when client IP
  is unknown.
- Happy path: 200 with sanitized name (NUL stripped), lowercased email,
  derived locale, `x-real-ip` and `x-forwarded-for` first-hop extraction,
  generic 500 + server log on insert error.

**E2E (`e2e/homepage.spec.ts`)** — Chromium, against `next dev` locally
and `next start` after a build in CI:
1. `/de` loads, brand title + hero h1 + services h2 visible.
2. `/` redirects into a supported locale (de or en, browser-driven).
3. References section renders both project cards with `target=_blank` and
   `rel=noopener…` on the outbound links.
4. Pricing CTA scrolls the contact heading into the viewport.
5. Contact form rejects an empty submit with three localized inline errors.
6. Contact form happy path: `page.route` mocks `/api/contact`, asserts
   the success copy becomes visible.

---

## CI/CD

`.github/workflows/ci.yml` runs on push to `main` and on PRs targeting
`main`, with in-flight cancellation per ref:

```
Checkout → Setup Node 24 (npm cache) → npm ci → Lint
       → Vitest → Cache Playwright browsers → Install (or install-deps)
       → Build → E2E → Upload report on failure
```

Vercel auto-deploys on push to `main`. CI is independent — a failing
build does not gate the Vercel deploy by default; treat green CI as the
quality signal you trust before merging.

---

## Local development

```bash
npm install
npm run dev              # Next dev server (Turbopack)
```

Required `.env.local` for the contact form to actually persist messages:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # optional; sitemap/OG host
```

If the URL or service-role env are missing, `POST /api/contact` returns
500 with a server log. This is intentional — see "Silent-failure prevention"
above.

### Database migrations

```bash
supabase db push    # apply migrations to the linked Supabase project
```

The `supabase` CLI is already linked (`supabase/config.toml`).

---

## Deployment

Hosted on Vercel (`hagen-marggrafs-projects/lhconsulting`). Auto-deploy
fires on push to `main`. Production domain: `lhconsulting.services`.

**Vercel environment variables** (Production + Preview + Development):

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Used in CSP `connect-src` and by the contact API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reserved for any future client-side Supabase usage. |
| `SUPABASE_SERVICE_ROLE_KEY` | Used server-side by `/api/contact` to bypass RLS for inserts. Never exposed to the client. |
| `NEXT_PUBLIC_SITE_URL` | Drives sitemap, robots, and OG image absolute URLs. Set to `https://lhconsulting.services`. |

When pasting values, avoid trailing whitespace — it ends up URL-encoded
as `%0A` in HTTP headers and breaks browser parsing of CSP source URLs.
The build defensively `.trim()`s the Supabase URL before composing the
CSP, so this can't recur.

---

## Roadmap

Open items, in rough priority order:

- **"Über mich/uns" section** — short bio + photo, builds trust on a small
  agency site.
- **Lighthouse pass** — measure and tighten LCP/CLS, evaluate moving
  framer-motion-heavy effects to lower-priority loads.
- **CSP hardening** — replace `unsafe-eval` / `unsafe-inline` for
  `script-src` / `style-src` with a nonce-based policy. Larger refactor
  because the Next.js inline runtime currently relies on those.
- **Custom OG illustrations / preview image variants** — currently a
  text-driven Satori render; could pull from a hand-crafted asset for
  warmer LinkedIn previews.

---

## Conventions

- All user-facing copy lives in `src/i18n/messages/{de,en}.json`. Never
  inline strings in components.
- Section components own their own `id` for hash-anchored navigation.
- Server boundaries (API routes, env validation) sanitise and constrain
  inputs explicitly. Trust nothing from headers or bodies.
- Tests are colocated with code (`*.test.ts` next to `*.ts`) for unit
  layers, and live under `e2e/` for browser-driven flows. The vitest
  `include` glob excludes the e2e folder.
