/**
 * File: page.tsx
 * Description: Main dashboard page with vitals, holographic body, and activity overview.
 */

"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VitalTriad } from "@/components/dashboard/vital-triad";
import { QuickCommandBar } from "@/components/dashboard/quick-command-bar";
import { DailyTimeline } from "@/components/dashboard/daily-timeline";
import { StreakGrid } from "@/components/dashboard/streak-grid";
import { HolographicBody3D } from "@/components/dashboard/holographic-body-3d";
import { AIService } from "@/lib/services/ai.service";
import { NutritionService } from "@/lib/services/nutrition.service";
import { useBodyStore } from "@/lib/stores/body.store";
import type { User, DailyNutrition, Workout, AIInsight } from "@/lib/types";

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  const json = await response.json();
  return json.data;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const setBodyStatus = useBodyStore((state) => state.setBodyStatus);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  // Extract data from API response
  const user: User | null = data?.user
    ? {
        id: data.user.id,
        name: data.user.name,
        age: data.user.age,
        weight: data.user.weight,
        height: data.user.height,
        gender: data.user.gender,
        goal: data.user.goal,
        activityLevel: data.user.activityLevel,
        calorieTarget: data.user.calorieTarget,
        proteinTarget: data.user.proteinTarget,
        carbsTarget: data.user.carbsTarget,
        fatsTarget: data.user.fatsTarget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  const todayNutrition: DailyNutrition | null = data?.todayNutrition ?? null;
  const todayWorkout: Workout | null = data?.todayWorkout ?? null;
  const recentWorkouts: Workout[] = data?.recentWorkouts ?? [];

  // Calculate AI insights and body status when data changes
  const bodyStatus = useBodyStore((state) => state.bodyStatus);

  useEffect(() => {
    if (!data?.user || !data?.recentWorkouts) return;

    // Calculate body status from recent workouts
    const workouts = data.recentWorkouts;
    const calculatedBodyStatus = AIService.calculateBodyStatus(workouts);
    setBodyStatus(calculatedBodyStatus);

    // Update hologram with latest workout
    if (workouts.length > 0) {
      useBodyStore.getState().calculateFatigueFromWorkout(workouts[0]);
    }
  }, [data, setBodyStatus]);

  // Generate AI insights
  const aiInsight: AIInsight | null = user
    ? AIService.generateInsight({
        user,
        todayNutrition,
        todayWorkout,
        recentWorkouts,
        weeklyCalories: NutritionService.getWeeklyCalories().map((d) => d.calories),
        bodyStatus,
      })
    : null;

  // Calculate recovery score
  const recoveryScore = user
    ? AIService.calculateRecoveryScore({
        user,
        todayNutrition,
        todayWorkout,
        recentWorkouts,
        weeklyCalories: NutritionService.getWeeklyCalories().map((d) => d.calories),
        bodyStatus,
      })
    : 85;

  // Get body recommendation
  const bodyMessage = AIService.getSuggestedTarget(bodyStatus);

  const handleSync = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-500">
            {error ? "Failed to load dashboard data" : "Please sign in to continue"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Sci-Fi Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Main Content (2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vital Triad - Top Row */}
          <VitalTriad
            user={user}
            todayNutrition={todayNutrition}
            todayWorkout={todayWorkout}
            recoveryScore={recoveryScore}
            aiInsight={aiInsight}
          />

          {/* Quick Command Bar */}
          <QuickCommandBar onSync={handleSync} />

          {/* Mission Control - Timeline & Streaks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DailyTimeline />
            <StreakGrid />
          </div>
        </div>

        {/* Right Section - Holographic Body 3D (1 column on desktop) */}
        <div className="lg:col-span-1">
          <HolographicBody3D aiMessage={bodyMessage} />
        </div>
      </div>

      {/* Debug: Reset Body Button */}
      <button
        onClick={() => useBodyStore.getState().resetBody()}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg bg-zinc-900/80 border border-white/10 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
      >
        Reset Body
      </button>
    </div>
  );
}
