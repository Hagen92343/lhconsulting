"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const principles = [
  {
    key: "handsOn" as const,
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-cyber-cyan"
      >
        <path
          d="M6 18L13 25L26 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "dach" as const,
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-cyber-cyan"
      >
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 16H27M16 5C19 9 19 23 16 27M16 5C13 9 13 23 16 27"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "endToEnd" as const,
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-cyber-cyan"
      >
        <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="26" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 16H23"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
        <path
          d="M14 11L19 16L14 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="relative py-32 px-6">
      {/* Subtle grid backdrop, mirrors Services / References */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-cyber-cyan/50 font-mono block mb-4">
            {"// " + t("tagline")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-glow-cyan">
            {t("title")}
          </h2>
        </motion.div>

        {/* Avatar + bio row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 md:gap-14 items-center mb-20"
        >
          {/* Hexagonal avatar placeholder — swap for a real photo later */}
          <div className="mx-auto md:mx-0">
            <div
              aria-hidden="true"
              className="relative w-[180px] h-[180px] flex items-center justify-center"
            >
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                fill="none"
                className="absolute inset-0"
              >
                <path
                  d="M90 6L161 47V133L90 174L19 133V47L90 6Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-cyber-cyan/40"
                  fill="rgba(0,200,255,0.04)"
                />
                <path
                  d="M90 18L150 53V127L90 162L30 127V53L90 18Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-cyber-cyan/20"
                  strokeDasharray="3 3"
                />
                <text
                  x="90"
                  y="98"
                  textAnchor="middle"
                  className="fill-cyber-cyan/60 font-display font-bold"
                  style={{ fontSize: "44px", letterSpacing: "4px" }}
                >
                  L&amp;H
                </text>
              </svg>
            </div>
          </div>

          {/* Bio text */}
          <div>
            <p className="text-lg leading-relaxed text-white/80 font-mono mb-4">
              {t("lead")}
            </p>
            <p className="text-sm leading-relaxed text-white/60 font-mono">
              {t("body")}
            </p>
          </div>
        </motion.div>

        {/* Principles row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {principles.map((principle) => (
            <motion.div
              key={principle.key}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" as const },
                },
              }}
              className="hud-border p-6 group transition-all duration-300 hover:bg-cyber-dark/80"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {principle.icon}
                </div>
                <div>
                  <h3 className="text-base font-display font-semibold text-white mb-1 group-hover:text-cyber-cyan transition-colors duration-300">
                    {t(`principles.${principle.key}.title`)}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/60 font-mono">
                    {t(`principles.${principle.key}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
