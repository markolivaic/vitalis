"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/ui/glass-card";
import { useNutritionStore } from "@/lib/stores/nutrition.store";
import type { User, DailyNutrition } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MacroProgressBarsProps {
  user: User;
  nutrition: DailyNutrition | null;
}

export function MacroProgressBars({ user, nutrition }: MacroProgressBarsProps) {
  // Use store totals if available, otherwise fall back to nutrition prop
  // Get todayLog from store (stable reference)
  const storeTodayLog = useNutritionStore((state) => state.todayLog);
  const storeTargets = useNutritionStore((state) => state.targets);

  // Compute totals from todayLog with useMemo to avoid infinite loops
  const storeTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    Object.values(storeTodayLog).forEach((entries) => {
      entries.forEach((entry) => {
        totals.calories += entry.calories;
        totals.protein += entry.protein;
        totals.carbs += entry.carbs;
        totals.fats += entry.fats;
      });
    });

    return totals;
  }, [storeTodayLog]);

  const current = nutrition
    ? {
        calories: nutrition.totalCalories,
        protein: nutrition.totalProtein,
        carbs: nutrition.totalCarbs,
        fats: nutrition.totalFats,
      }
    : storeTotals;

  const targets = {
    calories: storeTargets.calories || user.calorieTarget,
    protein: storeTargets.protein || user.proteinTarget,
    carbs: storeTargets.carbs || user.carbsTarget,
    fats: storeTargets.fat || user.fatsTarget,
  };

  const macros = [
    {
      name: "Calories",
      current: current.calories,
      target: targets.calories,
      unit: "kcal",
      variant: "emerald" as const,
    },
    {
      name: "Protein",
      current: current.protein,
      target: targets.protein,
      unit: "g",
      variant: "violet" as const,
    },
    {
      name: "Carbs",
      current: current.carbs,
      target: targets.carbs,
      unit: "g",
      variant: "amber" as const,
    },
    {
      name: "Fats",
      current: current.fats,
      target: targets.fats,
      unit: "g",
      variant: "default" as const,
    },
  ];

  return (
    <GlassCard padding="md">
      <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
        Daily Progress
      </h3>

      <div className="space-y-4">
        {macros.map((macro) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const isOver = macro.current > macro.target;

          // Add glowing effect when near target (80%+)
          const isNearTarget = percentage >= 80 && percentage <= 100;
          const glowClass = isNearTarget
            ? macro.variant === "emerald"
              ? "shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : macro.variant === "violet"
              ? "shadow-[0_0_8px_rgba(139,92,246,0.5)]"
              : macro.variant === "amber"
              ? "shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : ""
            : "";

          return (
            <div key={macro.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-zinc-400">{macro.name}</span>
                <span className={cn("text-sm font-medium", isOver ? "text-red-400" : "text-white")}>
                  {Math.round(macro.current)} / {macro.target} {macro.unit}
                </span>
              </div>
              <div className={cn("rounded-full", glowClass)}>
                <Progress value={percentage} variant={macro.variant} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

