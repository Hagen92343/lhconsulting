"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type InputAsInput = {
  as?: "input";
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

type InputAsTextarea = {
  as: "textarea";
  label?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

type InputProps = InputAsInput | InputAsTextarea;

const inputStyles =
  "w-full bg-cyber-dark/80 border border-white/10 px-4 py-3 font-mono text-sm text-white placeholder:text-cyber-muted/50 transition-all duration-300 focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,200,255,0.3),inset_0_0_10px_rgba(0,200,255,0.05)]";

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { as = "input", label, error, ...rest } = props;
    const id = rest.id || rest.name || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-display tracking-wider uppercase text-cyber-muted"
          >
            {label}
          </label>
        )}

        {as === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            className={`${inputStyles} min-h-[120px] resize-y ${error ? "border-cyber-pink" : ""}`}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            className={`${inputStyles} ${error ? "border-cyber-pink" : ""}`}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && (
          <p className="text-xs text-cyber-pink font-mono mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
