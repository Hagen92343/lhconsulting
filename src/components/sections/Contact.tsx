"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import DataStream from "@/components/effects/DataStream";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import GlitchText from "@/components/effects/GlitchText";

interface ContactForm {
  name: string;
  email: string;
  message: string;
  // Honeypot — must stay empty for the request to reach the database.
  website?: string;
}

export function Contact() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden">
      {/* Background DataStream */}
      <div className="absolute inset-0 opacity-20">
        <DataStream density="low" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-black via-transparent to-cyber-black pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Section title */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-cyber-cyan/50 font-mono block mb-4">
            {"// " + t("title")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-glow-cyan mb-4">
            {t("title")}
          </h2>
          <p className="text-sm text-white/50 font-mono">{t("subtitle")}</p>
        </motion.div>

        {/* Contact form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Honeypot field — moved off-screen instead of display:none, since
              naïve bots fill display:none too. tabIndex={-1} keeps it out of
              keyboard order; aria-hidden + label/text hide it from screen
              readers. Real users never see or interact with it. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor="lh-website-trap">Website</label>
            <input
              id="lh-website-trap"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          <Input
            label={t("name")}
            placeholder={t("name")}
            {...register("name", { required: t("validation.nameRequired") })}
            error={errors.name?.message}
          />

          <Input
            label={t("email")}
            type="email"
            placeholder={t("email")}
            {...register("email", {
              required: t("validation.emailRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("validation.emailInvalid"),
              },
            })}
            error={errors.email?.message}
          />

          <Input
            as="textarea"
            label={t("message")}
            placeholder={t("message")}
            rows={5}
            {...register("message", {
              required: t("validation.messageRequired"),
              minLength: {
                value: 10,
                message: t("validation.messageMin"),
              },
            })}
            error={errors.message?.message}
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              pulse={status === "idle"}
              disabled={status === "sending"}
              className="w-full sm:w-auto"
            >
              {status === "sending" ? t("sending") : t("send")}
            </Button>
          </div>

          {/* Status messages */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-cyber-cyan/30 bg-cyber-cyan/5"
            >
              <GlitchText continuous className="text-sm text-cyber-cyan font-mono">
                {t("success")}
              </GlitchText>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-cyber-pink/30 bg-cyber-pink/5"
            >
              <p className="text-sm text-cyber-pink font-mono">{t("error")}</p>
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  );
}
