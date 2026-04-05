"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "de" ? "en" : "de";

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${nextLocale === "de" ? "Deutsch" : "English"}`}
      className="relative px-3 py-1.5 text-xs font-display tracking-wider uppercase
        border border-cyber-cyan/20 bg-cyber-dark/60 text-cyber-cyan
        hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer"
    >
      {/* HUD corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-cyan" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-cyan" />

      <span className="relative z-10">
        {isPending ? "..." : nextLocale.toUpperCase()}
      </span>
    </button>
  );
}
