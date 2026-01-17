"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SetTable } from "./set-table";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkoutExercise, WorkoutSet } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  onRemoveSet: (setId: string) => void;
}

export function ExerciseCard({
  exercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: ExerciseCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const totalVolume = exercise.sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);

  return (
    <GlassCard padding="none" className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex-1">
          <h4 className="font-medium text-white">{exercise.exerciseName}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-zinc-500">
              {completedSets} / {totalSets} sets
            </span>
            {totalVolume > 0 && (
              <span className="text-xs text-emerald-400">
                {totalVolume.toLocaleString()} kg
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {exercise.sets.map((set) => (
              <div
                key={set.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  set.completed ? "bg-emerald-400" : "bg-white/10"
                )}
              />
            ))}
          </div>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 border-t border-white/5">
          <SetTable
            sets={exercise.sets}
            onUpdateSet={onUpdateSet}
            onRemoveSet={onRemoveSet}
          />

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-zinc-500 hover:text-white gap-2"
            onClick={onAddSet}
          >
            <Plus className="w-4 h-4" />
            Add Set
          </Button>
        </div>
      )}
    </GlassCard>
  );
}

