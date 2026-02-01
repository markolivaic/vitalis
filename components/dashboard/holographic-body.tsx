/**
 * File: holographic-body.tsx
 * Description: Legacy 2D SVG body status visualization component.
 */

"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import type { BodyStatus } from "@/lib/types";
import { Activity, Zap } from "lucide-react";

interface HolographicBodyProps {
  status: BodyStatus;
  aiMessage: string;
}

export function HolographicBody({ status, aiMessage }: HolographicBodyProps) {
  const getStatusLabel = (muscleStatus: BodyStatus[keyof BodyStatus]) => {
    switch (muscleStatus) {
      case "fatigued":
        return { label: "Fatigued", color: "text-amber-400" };
      case "recovering":
        return { label: "Recovering", color: "text-blue-400" };
      case "target":
        return { label: "Target", color: "text-violet-400" };
      default:
        return { label: "Fresh", color: "text-emerald-400" };
    }
  };

  return (
    <GlassCard className="h-full flex flex-col" padding="md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          Body Status
        </span>
      </div>

      {/* Holographic Body SVG */}
      <div className="relative w-full h-[400px] flex items-center justify-center my-4 transition-all duration-500">
        {/* Glow Effect Background */}
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-50 animate-pulse" />

        <svg viewBox="0 0 200 400" className="h-full w-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* HEAD & NECK (General Status) */}
          <path
            d="M100 20 C 85 20, 75 35, 75 55 C 75 70, 85 85, 100 85 C 115 85, 125 70, 125 55 C 125 35, 115 20, 100 20 Z"
            className="fill-white/5 stroke-emerald-500/50 stroke-2"
          />

          {/* UPPER BODY (Chest/Arms/Shoulders) */}
          <path
            d="M 65 90 Q 30 100, 30 160 L 45 230 L 60 230 L 55 160 Q 60 130, 70 130 L 70 200 L 130 200 L 130 130 Q 140 130, 145 160 L 140 230 L 155 230 L 170 160 Q 170 100, 135 90 Z"
            className={cn(
              "stroke-2 transition-colors duration-500",
              status.upperBody === "fatigued" ? "fill-amber-500/20 stroke-amber-500" :
                status.upperBody === "recovering" ? "fill-blue-500/20 stroke-blue-500" :
                  status.upperBody === "target" ? "fill-violet-500/20 stroke-violet-500 animate-pulse" :
                    "fill-white/5 stroke-emerald-500/30"
            )}
          />

          {/* CORE (Abs/Lower Back) */}
          <path
            d="M 70 205 L 70 260 Q 70 280, 100 280 Q 130 280, 130 260 L 130 205 Z"
            className={cn(
              "stroke-2 transition-colors duration-500",
              status.core === "fatigued" ? "fill-amber-500/20 stroke-amber-500" :
                status.core === "recovering" ? "fill-blue-500/20 stroke-blue-500" :
                  status.core === "target" ? "fill-violet-500/20 stroke-violet-500 animate-pulse" :
                    "fill-white/5 stroke-emerald-500/30"
            )}
          />

          {/* LOWER BODY (Legs) */}
          <path
            d="M 70 285 L 60 380 L 85 380 L 90 320 L 95 320 L 100 285 L 105 320 L 110 320 L 115 380 L 140 380 L 130 285 Z"
            className={cn(
              "stroke-2 transition-colors duration-500",
              status.lowerBody === "fatigued" ? "fill-amber-500/20 stroke-amber-500" :
                status.lowerBody === "recovering" ? "fill-blue-500/20 stroke-blue-500" :
                  status.lowerBody === "target" ? "fill-violet-500/20 stroke-violet-500 animate-pulse" :
                    "fill-white/5 stroke-emerald-500/30"
            )}
          />
        </svg>

        {/* Scanline Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-4 w-full animate-scan pointer-events-none"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Status Legend */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span className={getStatusLabel(status.upperBody).color}>
            Upper: {getStatusLabel(status.upperBody).label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span className={getStatusLabel(status.core).color}>
            Core: {getStatusLabel(status.core).label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span className={getStatusLabel(status.lowerBody).color}>
            Lower: {getStatusLabel(status.lowerBody).label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span className={getStatusLabel(status.cardio).color}>
            Cardio: {getStatusLabel(status.cardio).label}
          </span>
        </div>
      </div>

      {/* AI Message */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Recommendation</span>
        </div>
        <p className="text-sm font-mono-ai text-zinc-300">
          <span className="text-emerald-400">&gt;</span> {aiMessage}
        </p>
      </div>
    </GlassCard>
  );
}

