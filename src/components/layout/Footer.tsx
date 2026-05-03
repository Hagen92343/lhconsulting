import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cyber-cyan/10 bg-cyber-black">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="font-mono text-xs text-cyber-muted">
            &copy; {year} L&H Consulting. {t("rights")}
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/impressum"
              className="font-mono text-xs text-cyber-muted hover:text-cyber-cyan transition-colors duration-300"
            >
              {t("imprint")}
            </Link>
            <Link
              href="/datenschutz"
              className="font-mono text-xs text-cyber-muted hover:text-cyber-cyan transition-colors duration-300"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
