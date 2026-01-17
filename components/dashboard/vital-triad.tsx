"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { Activity, Zap, Brain } from "lucide-react";
import type { User, DailyNutrition, Workout, AIInsight } from "@/lib/types";

interface VitalTriadProps {
  user: User;
  todayNutrition: DailyNutrition | null;
  todayWorkout: Workout | null;
  recoveryScore: number;
  aiInsight: AIInsight | null;
}

export function VitalTriad({
  user,
  todayNutrition,
  todayWorkout,
  recoveryScore,
  aiInsight,
}: VitalTriadProps) {
  const caloriesConsumed = todayNutrition?.totalCalories || 0;
  const calorieTarget = user.calorieTarget;

  const workoutStatus = todayWorkout
    ? todayWorkout.status === "completed"
      ? todayWorkout.name
      : "In Progress"
    : "Rest Day";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Fuel Card - Nutrition */}
      <GlassCard className="flex flex-col items-center justify-center py-6 min-h-[180px]">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Fuel
          </span>
        </div>
        <DonutChart
          value={caloriesConsumed}
          max={calorieTarget}
          variant="emerald"
          size="md"
          label={`${caloriesConsumed}`}
          sublabel={`/ ${calorieTarget} kcal`}
        />
        <div className="mt-4 flex gap-4 text-xs text-zinc-500">
          <span>
            P: <span className="text-white">{todayNutrition?.totalProtein || 0}g</span>
          </span>
          <span>
            C: <span className="text-white">{todayNutrition?.totalCarbs || 0}g</span>
          </span>
          <span>
            F: <span className="text-white">{todayNutrition?.totalFats || 0}g</span>
          </span>
        </div>
      </GlassCard>

      {/* Output Card - Activity */}
      <GlassCard className="flex flex-col items-center justify-center py-6 min-h-[180px]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Output
          </span>
        </div>
        <DonutChart
          value={todayWorkout ? 100 : 0}
          max={100}
          variant="violet"
          size="md"
          label={workoutStatus}
          sublabel={todayWorkout ? `${todayWorkout.totalVolume} kg vol` : "No workout"}
        />
        {todayWorkout && todayWorkout.status === "completed" && (
          <div className="mt-4 text-xs text-zinc-500">
            Duration: <span className="text-white">{Math.floor((todayWorkout.duration || 0) / 60)} min</span>
          </div>
        )}
      </GlassCard>

      {/* System Status Card - AI */}
      <GlassCard className="flex flex-col py-6 px-5 min-h-[180px]">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-white/60" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            System Status
          </span>
        </div>
        
        {/* Recovery Score */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-white">{recoveryScore}%</span>
          <span className="text-sm text-zinc-500">Recovery</span>
        </div>

        {/* AI Insight */}
        <div className="flex-1 flex items-end">
          <p className="font-mono-ai text-zinc-400 leading-relaxed">
            <span className="text-emerald-400">&gt;</span>{" "}
            {aiInsight?.message || "All systems nominal."}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <div
            className={`w-2 h-2 rounded-full ${
              recoveryScore >= 80
                ? "bg-emerald-400"
                : recoveryScore >= 50
                ? "bg-amber-400"
                : "bg-red-400"
            } animate-pulse`}
          />
          <span className="text-xs text-zinc-500">
            {recoveryScore >= 80
              ? "Optimal"
              : recoveryScore >= 50
              ? "Moderate"
              : "Low"}
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

