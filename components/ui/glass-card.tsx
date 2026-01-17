"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "highlight-emerald" | "highlight-violet";
  padding?: "none" | "sm" | "md" | "lg";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card",
          // Padding variants
          padding === "none" && "p-0",
          padding === "sm" && "p-3",
          padding === "md" && "p-5",
          padding === "lg" && "p-8",
          // Style variants
          variant === "interactive" && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          variant === "highlight-emerald" && "border-emerald-500/30 hover:border-emerald-500/50",
          variant === "highlight-violet" && "border-violet-500/30 hover:border-violet-500/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };

