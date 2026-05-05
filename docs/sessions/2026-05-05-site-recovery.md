# Site Recovery — 2026-05-05

Outage report and fix log for the production site outage on 2026-05-05.

## Symptom

User reported "die Seite funktioniert nicht". Live site at `lhconsulting.services/de` showed only the header bar and the H1 ("Wir machen KI nutzbar.") with a stuck typewriter cursor. About, Services, References, Pricing, Contact, Footer — all blank below the fold.

## Investigation

- All Vercel deployments were Ready. No build failures.
- Apex `lhconsulting.services` resolved correctly via Cloudflare → `76.76.21.21`. HTTP 307 → `/de` → 200 OK with 55 KB of HTML.
- All sections were present in the SSR HTML (`<section id="about">`, `services`, `references`, `pricing`, `contact`).
- Inline styles in the HTML showed every section element starting with `style="opacity:0;transform:translateY(...)"`.
- SRI integrity hashes matched (computed hash of live `_next/static/chunks/*.js` equalled the `integrity` attribute in HTML).
- Header was visible — its `motion.header` used `initial={{ y: 0 }}`, no `opacity:0`.
- Every other section's content was wrapped in `motion.div` with `initial={{ opacity: 0, ... }}` and a clientside `animate` or `whileInView` reveal.

## Root cause

framer-motion v12 + React 19.2 + Next.js 16.2 with `experimental.sri` enabled: on this stack, the clientside reveal animation does not consistently fire in production. The SSR-rendered `style="opacity:0"` then sticks, so any content that depended on framer-motion to fade in stays invisible.

A second, contributing problem in the hero: long animation delays of 2.5 s / 3.2 s / 4 s for subline, CTA, and scroll indicator. Even when JS works, a slow tab or interrupted hydration leaves those elements invisible for several seconds.

## Fix

Two commits on `main`:

1. **`28e2403` — fix(sections): keep content visible if framer-motion fails to hydrate**
   Switched every section's `motion.*` wrapper from `initial={{ opacity: 0, y: ... }}` to `initial={false}`. Framer-motion now treats the `animate`/`whileInView` state as the starting state, so SSR emits no `opacity:0` and the page is fully readable on first paint regardless of whether the reveal animations ever run. Hero delays shortened from 2.5 / 3.2 / 4 s to 0.4 / 0.6 / 1.0 s. Touched: `Hero`, `About`, `Services`, `References`, `Pricing`, `Contact`. Variants with `hidden: { opacity: 0, ... }` were changed to `hidden: {}`.

2. **`d8a73a2` — fix(about): force eager-load founder photo + bust image cache**
   `next/image` for `public/hagen.jpg` had `priority={false}`, emitting `loading="lazy"`. Combined with the `clipPath` container, Safari's aggressive lazy-load heuristic occasionally never resolved the image. Switched to `priority`. Replacing the asset bumped the mtime, forcing the Vercel image optimizer to regenerate cached variants.

## Verification

- `curl -s https://lhconsulting.services/de | grep -c 'opacity:0'` — was ~10, now 0.
- All sections visible on first paint, hard reload confirmed.
- Founder photo loads eagerly inside the hexagonal frame.

## Outstanding

- `www.lhconsulting.services` has no DNS record. Vercel project alias is attached, but Cloudflare needs a CNAME `www → cname.vercel-dns.com` (DNS only / grey cloud — not proxied, otherwise Cloudflare's edge breaks Vercel SSL).

## Lessons

Never gate content visibility on a clientside-only animation. Use `initial={false}` (or omit `initial` and rely on static styles) for all reveal-on-scroll patterns on this stack until framer-motion / React / Next versions move forward.
