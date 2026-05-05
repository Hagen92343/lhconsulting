"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import CyberGrid from "@/components/effects/CyberGrid";
import ParticleField from "@/components/effects/ParticleField";
import TypingText from "@/components/effects/TypingText";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("hero");

  const handleCTA = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <CyberGrid className="absolute inset-0" />
        <ParticleField className="absolute inset-0" particleCount={60} />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-cyber-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Small label */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 text-xs tracking-[0.3em] uppercase text-cyber-cyan/70 border border-cyber-cyan/20 font-mono">
            L&H Consulting
          </span>
        </motion.div>

        {/* Main headline with typing effect — h1 wraps TypingText so the
            page exposes a real heading to screen readers and search engines.
            The inner span carries the styling and aria-label of the full text. */}
        <h1 className="mb-6">
          <TypingText
            text={t("headline")}
            speed={60}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white text-glow-cyan leading-tight"
          />
        </h1>

        {/* Subline with staggered fade-in */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-10"
        >
          <p className="text-lg sm:text-xl md:text-2xl font-mono text-cyber-muted tracking-wide">
            {t("subline")}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button variant="primary" pulse onClick={handleCTA}>
            {t("cta")}
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-cyber-cyan/40 font-mono">
            Scroll
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-cyber-cyan/40"
          >
            <path
              d="M10 4L10 16M10 16L4 10M10 16L16 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
