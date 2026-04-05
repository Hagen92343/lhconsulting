"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  pulse?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", pulse = false, className = "", ...props }, ref) => {
    const base =
      "relative inline-flex items-center justify-center px-6 py-3 font-display text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-cyber-cyan text-cyber-black hover:bg-cyber-cyan/90 glow-cyan font-semibold",
      outline:
        "bg-transparent border border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan hover:bg-cyber-cyan/10 hover:glow-cyan",
    };

    const pulseClass = pulse ? "pulse-glow" : "";

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${pulseClass} ${className}`}
        {...props}
      >
        {/* HUD corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-60" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-60" />

        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
