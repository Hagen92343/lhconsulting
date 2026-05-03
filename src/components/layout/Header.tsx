"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function Header() {
  const t = useTranslations("nav");
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    lastScrollY.current = latest;

    // Show header when scrolling up, hide when scrolling down
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Add extra background opacity when scrolled
    setScrolled(latest > 20);
  });

  function handleSmoothScroll(
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3, ease: "easeInOut" }
      }
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "bg-cyber-black/80 backdrop-blur-xl border-b border-cyber-cyan/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3 select-none group"
        >
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="shrink-0">
            <path d="M24 2L44 14V34L24 46L4 34V14L24 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-cyber-cyan" />
            <path d="M16 14V34H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyber-cyan" />
            <path d="M26 14V34M26 24H34M34 14V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyber-cyan" />
            <circle cx="24" cy="2" r="2" fill="currentColor" className="text-cyber-cyan opacity-60" />
            <circle cx="44" cy="14" r="2" fill="currentColor" className="text-cyber-cyan opacity-40" />
            <circle cx="4" cy="14" r="2" fill="currentColor" className="text-cyber-cyan opacity-40" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-white tracking-[3px] group-hover:text-cyber-cyan transition-colors duration-300">L&H</span>
            <span className="text-[8px] tracking-[3px] uppercase text-cyber-cyan/50">Consulting</span>
          </div>
        </a>

        {/* Nav Links + Language Toggle */}
        <div className="flex items-center gap-8">
          <NavLink
            href="#services"
            onClick={(e) => handleSmoothScroll(e, "services")}
          >
            {t("services")}
          </NavLink>
          <NavLink
            href="#references"
            onClick={(e) => handleSmoothScroll(e, "references")}
          >
            {t("references")}
          </NavLink>
          <NavLink
            href="#contact"
            onClick={(e) => handleSmoothScroll(e, "contact")}
          >
            {t("contact")}
          </NavLink>

          <div className="ml-2">
            <LanguageToggle />
          </div>
        </div>
      </nav>
    </motion.header>
  );
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="relative font-mono text-sm text-cyber-muted hover:text-cyber-cyan transition-colors duration-300 group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
    </a>
  );
}
