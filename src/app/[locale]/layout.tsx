import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";

// metadataBase makes OpenGraph/Twitter image URLs resolve correctly without
// requiring callers to spell out absolute URLs in every page's metadata.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Limit font payload to the weights actually used on the homepage:
//  - Orbitron: 400 (default body), 600 (font-semibold), 700 (font-bold)
//  - JetBrains Mono: 400 (default), 600 (font-semibold for emphasised mono)
// Earlier the bundle pulled every weight Google Fonts ships — ~6× the bytes.
const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-cyber-black text-white font-mono antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="scanline-overlay" />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
