/**
 * File: quick-command-bar.tsx
 * Description: Quick action bar for common dashboard operations.
 */

"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Apple, Dumbbell, RefreshCw } from "lucide-react";
import Link from "next/link";

interface QuickCommandBarProps {
  onSync?: () => void;
}

export function QuickCommandBar({ onSync }: QuickCommandBarProps) {
  return (
    <GlassCard padding="sm" className="flex items-center justify-center gap-3">
      <Link href="/nutrition">
        <Button variant="ghost-glow" size="default" className="gap-2">
          <Apple className="w-4 h-4" />
          <span className="hidden sm:inline">Log Meal</span>
        </Button>
      </Link>

      <div className="w-px h-8 bg-white/10" />

      <Link href="/gym">
        <Button variant="ghost-glow" size="default" className="gap-2">
          <Dumbbell className="w-4 h-4" />
          <span className="hidden sm:inline">Start Workout</span>
        </Button>
      </Link>

      <div className="w-px h-8 bg-white/10" />

      <Button
        variant="ghost-glow"
        size="default"
        className="gap-2"
        onClick={onSync}
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Sync</span>
      </Button>
    </GlassCard>
  );
}

