"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

type Project = {
  key: "cvschmiede" | "liiposter";
  url: string;
  // SVG glyph rendered at 40x40 inside the card.
  icon: React.ReactNode;
};

const projects: Project[] = [
  {
    key: "cvschmiede",
    url: "https://cvschmiede.com",
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="text-cyber-cyan"
      >
        <rect
          x="8"
          y="4"
          width="24"
          height="32"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14 12H26M14 18H26M14 24H22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="30" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M18 30H26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "liiposter",
    url: "https://liiposter.de",
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="text-cyber-cyan"
      >
        <rect
          x="4"
          y="8"
          width="32"
          height="24"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 16H14V26H10V16Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M18 16V26M18 19C18 17 19.5 16 21.5 16C23.5 16 25 17 25 19V26M30 26V20C30 18.5 29 17.5 27.5 17.5C26 17.5 25 18.5 25 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const cardVariants = {
  hidden: {},
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function References() {
  const t = useTranslations("references");

  return (
    <section id="references" className="relative py-32 px-6">
      {/* Subtle grid backdrop, mirrors Services for visual coherence */}
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
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-cyber-cyan/50 font-mono block mb-4">
            {"// " + t("tagline")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-glow-cyan mb-4">
            {t("title")}
          </h2>
          <p className="text-sm text-white/50 font-mono max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Project cards */}
        <motion.div
          variants={containerVariants}
          initial="visible"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {projects.map((project) => {
            const tags = [
              t(`${project.key}.tag1`),
              t(`${project.key}.tag2`),
              t(`${project.key}.tag3`),
            ];

            return (
              <motion.a
                key={project.key}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={cardVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="hud-border p-8 group flex flex-col transition-all duration-300 hover:bg-cyber-dark/80"
              >
                {/* Icon + visit hint row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {project.icon}
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-cyber-cyan/50 font-mono">
                    {t("visit")} ↗
                  </span>
                </div>

                {/* Title + tagline */}
                <h3 className="text-2xl font-display font-semibold text-white mb-2 group-hover:text-cyber-cyan transition-colors duration-300">
                  {t(`${project.key}.title`)}
                </h3>
                <p className="text-sm text-cyber-cyan/70 font-mono mb-5">
                  {t(`${project.key}.tagline`)}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-white/60 font-mono mb-6 grow">
                  {t(`${project.key}.description`)}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-[0.15em] uppercase text-cyber-cyan/70 font-mono border border-cyber-cyan/20 px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 h-px bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/30 to-cyber-cyan/0 group-hover:via-cyber-cyan/60 transition-all duration-500" />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
