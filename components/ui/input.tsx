/**
 * Vitalis AI | Health & Performance Hub
 * File: input.tsx
 * Description: Text input component with default and ghost variants.
 */

"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "ghost";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full text-white placeholder:text-zinc-500 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          variant === "default" &&
            "h-11 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-white/20 focus:bg-white/[0.07]",
          variant === "ghost" && "ghost-input",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

