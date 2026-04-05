"use client";

import { useEffect, useRef, useState } from "react";
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
          className="font-display text-2xl font-bold text-cyber-cyan text-glow-cyan tracking-widest select-none"
        >
          L&H
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
