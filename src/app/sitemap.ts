import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const PATHS = ["", "/impressum", "/datenschutz"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => {
      const url = `${siteUrl}/${locale}${path}`;
      return {
        url,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1.0 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])
          ),
        },
      };
    })
  );
}
