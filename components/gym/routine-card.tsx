"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { WorkoutRoutine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoutineCardProps {
  routine: WorkoutRoutine;
  onStart: (routineId: string) => void;
}

const colorMap = {
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    button: "violet" as const,
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    button: "emerald" as const,
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    button: "default" as const,
  },
  rose: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    button: "default" as const,
  },
};

export function RoutineCard({ routine, onStart }: RoutineCardProps) {
  const colors = colorMap[routine.color] || colorMap.violet;

  return (
    <GlassCard
      padding="md"
      className={cn("border", colors.border)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("px-2 py-1 rounded-md text-xs font-medium", colors.bg, colors.text)}>
          {routine.name}
        </div>
        <span className="text-xs text-zinc-500">
          {routine.exercises.length} exercises
        </span>
      </div>

      <ul className="space-y-1.5 mb-4">
        {routine.exercises.slice(0, 4).map((ex) => (
          <li key={ex.exerciseId} className="text-sm text-zinc-400 flex items-center justify-between">
            <span className="truncate">{ex.exerciseName}</span>
            <span className="text-xs text-zinc-600 ml-2">
              {ex.targetSets} × {ex.targetReps}
            </span>
          </li>
        ))}
        {routine.exercises.length > 4 && (
          <li className="text-xs text-zinc-600">
            +{routine.exercises.length - 4} more
          </li>
        )}
      </ul>

      <Button
        variant={colors.button}
        size="sm"
        className="w-full gap-2"
        onClick={() => onStart(routine.id)}
      >
        <Play className="w-4 h-4" />
        Start Routine
      </Button>
    </GlassCard>
  );
}

