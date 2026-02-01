/**
 * File: textarea.tsx
 * Description: Multi-line text input component with styling variants.
 */

"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "ghost";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full text-white placeholder:text-zinc-500 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          variant === "default" &&
            "min-h-[100px] rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:border-white/20 focus:bg-white/[0.07]",
          variant === "ghost" &&
            "bg-transparent border-b border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 px-0 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };









