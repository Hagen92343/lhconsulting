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
  // - script-src: 'unsafe-eval' is needed in DEV only (React surfaces server
  //   stack traces by reconstructing them via eval). Production drops it
  //   entirely. 'unsafe-inline' has to stay because the homepage statically
  //   pre-renders, so Next.js bakes its inline hydration scripts into the
  //   HTML at build time without per-request nonces. (A nonce-based CSP
  //   would force every page to dynamic rendering — see Next.js 16 CSP docs.)
  // - style-src: Tailwind + framer-motion produce computed inline styles
  //   that we cannot pre-hash, so 'unsafe-inline' stays.
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
