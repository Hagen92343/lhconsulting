import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
  // - default-src 'self': only load resources from own origin by default
  // - script-src: allow own scripts + Next.js inline eval in dev
  // - style-src: allow own styles + inline styles (Tailwind/framer-motion)
  // - img-src: own origin + data URIs (for blur placeholders)
  // - font-src: own origin
  // - connect-src: own origin + Supabase API
  // - frame-ancestors: deny all (belt-and-suspenders with X-Frame-Options)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
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
