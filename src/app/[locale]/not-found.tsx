import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import { routing } from "@/i18n/routing";

// Pulls the locale from the request URL when not-found fires inside
// [locale]/. Falls back to the routing default if the URL is unrecognisable.
async function resolveLocale(): Promise<"de" | "en"> {
  const h = await headers();
  const pathname =
    h.get("x-invoke-path") ??
    h.get("x-next-pathname") ??
    h.get("referer")?.replace(/^https?:\/\/[^/]+/, "") ??
    "";
  const seg = pathname.split("/")[1];
  if (seg === "de" || seg === "en") return seg;
  return routing.defaultLocale as "de" | "en";
}

export default async function NotFound() {
  const locale = await resolveLocale();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Subtle grid backdrop, matches Services / References */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial cyan glow centered on viewport */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,200,255,0.10) 0%, rgba(0,200,255,0) 50%)",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-14 h-14 border-l-2 border-t-2 border-cyber-cyan" />
      <div className="absolute top-8 right-8 w-14 h-14 border-r-2 border-t-2 border-cyber-cyan" />
      <div className="absolute bottom-8 left-8 w-14 h-14 border-l-2 border-b-2 border-cyber-cyan" />
      <div className="absolute bottom-8 right-8 w-14 h-14 border-r-2 border-b-2 border-cyber-cyan" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-cyber-cyan/60 font-mono block mb-6">
          {"// " + t("tag")}
        </span>

        <h1
          aria-label="404"
          className="font-display font-bold text-cyber-cyan text-glow-cyan text-[120px] sm:text-[160px] md:text-[200px] leading-none tracking-tight mb-2 select-none"
        >
          404
        </h1>

        <div
          aria-hidden="true"
          className="mx-auto mb-10 h-px w-40 bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/60 to-cyber-cyan/0"
        />

        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-sm sm:text-base text-white/60 font-mono mb-12 leading-relaxed">
          {t("body")}
        </p>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-3 px-6 py-3 font-display text-sm tracking-wider uppercase text-cyber-black bg-cyber-cyan hover:bg-cyber-cyan/90 transition-colors duration-300 glow-cyan font-semibold"
        >
          <span>← {t("cta")}</span>
        </Link>
      </div>
    </main>
  );
}
