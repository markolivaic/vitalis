/**
 * Vitalis AI | Health & Performance Hub
 * File: workout-summary-modal.tsx
 * Description: Modal dialog displaying detailed workout session summary.
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import type { Workout } from "@/lib/types";
import { formatDateWithTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Clock } from "lucide-react";

interface WorkoutSummaryModalProps {
  workout: Workout | null;
  open: boolean;
  onClose: () => void;
}

export function WorkoutSummaryModal({
  workout,
  open,
  onClose,
}: WorkoutSummaryModalProps) {
  if (!workout) return null;

  const durationMinutes = workout.duration
    ? Math.floor(workout.duration / 60)
    : 0;
  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed && s.type !== "warmup").length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-900 border-white/10 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{workout.name}</DialogTitle>
          <p className="text-sm text-zinc-500 mt-1">
            {formatDateWithTime(workout.date, workout.startTime)}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500">Duration</p>
              </div>
              <p className="font-medium text-white text-lg">{durationMinutes} min</p>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500">Volume</p>
              </div>
              <p className="font-medium text-white text-lg">
                {workout.totalVolume.toLocaleString()} kg
              </p>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500">Sets</p>
              </div>
              <p className="font-medium text-white text-lg">{completedSets}</p>
            </GlassCard>
          </div>

          {/* Workout Notes */}
          {workout.notes && (
            <GlassCard className="p-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                Workout Notes
              </p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {workout.notes}
              </p>
            </GlassCard>
          )}

          {/* Exercises */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              Exercises
            </p>
            {workout.exercises.map((ex) => (
              <GlassCard key={ex.id} className="p-3 space-y-2">
                <div>
                  <p className="font-medium text-white text-sm">{ex.exerciseName}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {ex.sets
                      .filter((s) => s.completed && s.type !== "warmup")
                      .map((s) => {
                        const typeLabel =
                          s.type === "drop" ? "D" : s.type === "failure" ? "F" : "";
                        return typeLabel
                          ? `${s.weight}×${s.reps} (${typeLabel})`
                          : `${s.weight}×${s.reps}`;
                      })
                      .join(" | ")}
                  </p>
                </div>
                {/* Exercise Notes */}
                {ex.notes && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-zinc-400 italic">{ex.notes}</p>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}









