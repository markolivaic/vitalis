"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "emerald" | "violet" | "amber";
}

const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300 ease-out rounded-full",
        variant === "default" && "bg-white",
        variant === "emerald" && "bg-gradient-to-r from-emerald-500 to-emerald-400",
        variant === "violet" && "bg-gradient-to-r from-violet-500 to-violet-400",
        variant === "amber" && "bg-gradient-to-r from-amber-500 to-amber-400"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

