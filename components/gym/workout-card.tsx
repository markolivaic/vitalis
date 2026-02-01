/**
 * File: workout-card.tsx
 * Description: Workout summary card for history and overview displays.
 */

"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn, formatDate } from "@/lib/utils";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import type { Workout } from "@/lib/types";

interface WorkoutCardProps {
  workout: Workout;
  onClick?: () => void;
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  // Guard clause for null/undefined workout
  if (!workout) {
    return (
      <GlassCard padding="md" className="text-center py-8">
        <div className="text-zinc-600 mb-2 font-mono text-xs">[ NO DATA ]</div>
        <p className="text-sm text-zinc-500">
          No active training data detected.
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          Initialize session to begin.
        </p>
      </GlassCard>
    );
  }

  const durationMinutes = workout.duration
    ? Math.floor(workout.duration / 60)
    : 0;

  return (
    <GlassCard
      variant="interactive"
      padding="md"
      className={cn(
        "cursor-pointer",
        workout.routineId?.includes("push") && "border-violet-500/20 hover:border-violet-500/40",
        workout.routineId?.includes("pull") && "border-emerald-500/20 hover:border-emerald-500/40",
        workout.routineId?.includes("legs") && "border-amber-500/20 hover:border-amber-500/40"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-white">{workout.name}</h4>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {formatDate(workout.date)}
          </p>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded-md text-xs font-medium",
            workout.status === "completed"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-violet-500/20 text-violet-400"
          )}
        >
          {workout.status === "completed" ? "Done" : "In Progress"}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{durationMinutes} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{workout.totalVolume.toLocaleString()} kg</span>
        </div>
      </div>

      {workout.exercises && workout.exercises.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-zinc-500">
            {workout.exercises.map((e) => e.exerciseName).join(" • ")}
          </p>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-zinc-600">
            No exercises logged in this session.
          </p>
        </div>
      )}

      {/* Workout Notes Preview */}
      {workout.notes && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-zinc-400 italic line-clamp-2">
            {workout.notes}
          </p>
        </div>
      )}
    </GlassCard>
  );
}

