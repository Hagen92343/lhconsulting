"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Pricing() {
  const t = useTranslations("pricing");

  const handleCTA = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="relative py-24 px-6">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="hud-border p-10 md:p-12 text-center"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-cyber-cyan/50 font-mono block mb-3">
            {"// " + t("tagline")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white text-glow-cyan mb-3">
            {t("title")}
          </h2>
          <p className="text-sm text-cyber-cyan/70 font-mono mb-5">
            {t("subtitle")}
          </p>
          <p className="text-sm leading-relaxed text-white/60 font-mono max-w-xl mx-auto mb-8">
            {t("body")}
          </p>
          <Button variant="primary" onClick={handleCTA}>
            {t("cta")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
