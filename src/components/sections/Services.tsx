"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const services = [
  {
    key: "strategy" as const,
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="text-cyber-cyan"
      >
        <path
          d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 4V36"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.4"
        />
        <path
          d="M4 12L36 28M36 12L4 28"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.4"
        />
        <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "implementation" as const,
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
          d="M12 18L16 22L12 26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 26H28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "training" as const,
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="text-cyber-cyan"
      >
        <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 34C8 28 13 24 20 24C27 24 32 28 32 34"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M26 10L34 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {},
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function Services() {
  const t = useTranslations("services");

  return (
    <section id="services" className="relative py-32 px-6">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
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
            {"// " + t("title")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-glow-cyan">
            {t("title")}
          </h2>
        </motion.div>

        {/* Service cards */}
        <motion.div
          variants={containerVariants}
          initial="visible"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.key}
              variants={cardVariants}
              className="hud-border p-8 group transition-all duration-300 hover:bg-cyber-dark/80"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {/* Icon */}
              <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-display font-semibold text-white mb-4 group-hover:text-cyber-cyan transition-colors duration-300">
                {t(`${service.key}.title`)}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-white/50 font-mono group-hover:text-white/70 transition-colors duration-300">
                {t(`${service.key}.description`)}
              </p>

              {/* Bottom accent line */}
              <div className="mt-6 h-px bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/30 to-cyber-cyan/0 group-hover:via-cyber-cyan/60 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
