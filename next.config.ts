import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Trim env values defensively: Vercel UI input occasionally captures trailing
// newlines, which then leak into headers as %0A and break browser CSP parsing.
const supabaseOrigin = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // Prevent browsers from MIME-sniffing the content-type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Deny framing entirely — prevents clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Force HTTPS for 2 years, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Restrict referrer information sent to third parties
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable access to sensitive browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy
  // - script-src: external script tags are pinned by the SRI integrity
  //   attribute (see experimental.sri below) — any chunk tampered with on
  //   the CDN / network is refused by the browser. Inline scripts still
  //   need 'unsafe-inline': Next.js bakes ~10 RSC streaming-payload
  //   <script> blocks into the static HTML at build time and they cannot
  //   be hashed in advance (the hash set differs per page). 'unsafe-eval'
  //   is dev-only — React reconstructs server stack traces via eval there.
  //   Tightening further would require switching every page to dynamic
  //   rendering for a nonce-based CSP, which would undo the LCP / CDN
  //   wins from earlier.
  // - style-src: Tailwind + framer-motion produce computed inline styles
  //   that we cannot pre-hash, so 'unsafe-inline' stays here too.
  // - default-src locks the rest down, frame-ancestors blocks embedding,
  //   form-action restricts where forms can submit.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      `connect-src 'self' ${supabaseOrigin}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ]
      .filter(Boolean)
      .join("; "),
  },
];

const nextConfig: NextConfig = {
  // Subresource Integrity — Next 16 build emits integrity="sha256-…" on every
  // script tag it generates. The browser refuses to execute any script whose
  // hash doesn't match, which is exactly what 'unsafe-inline' was guarding
  // against. Lets us tighten script-src below without forcing the page off
  // its static prerender path (the alternative was nonce + dynamic rendering).
  experimental: {
    sri: { algorithm: "sha256" },
  },
  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
