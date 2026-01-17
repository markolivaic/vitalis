"use client";

import { useEffect, useState } from "react";
import { VitalTriad } from "@/components/dashboard/vital-triad";
import { QuickCommandBar } from "@/components/dashboard/quick-command-bar";
import { DailyTimeline } from "@/components/dashboard/daily-timeline";
import { StreakGrid } from "@/components/dashboard/streak-grid";
import { HolographicBody3D } from "@/components/dashboard/holographic-body-3d";
import { UserService } from "@/lib/services/user.service";
import { WorkoutService } from "@/lib/services/workout.service";
import { NutritionService } from "@/lib/services/nutrition.service";
import { AIService } from "@/lib/services/ai.service";
import { useBodyStore } from "@/lib/stores/body.store";
import { useNutritionStore } from "@/lib/stores/nutrition.store";
import {
  generateStreakData,
  generateScheduledItems,
} from "@/lib/mock-data";
import type {
  User,
  DailyNutrition,
  Workout,
  AIInsight,
  StreakDay,
  ScheduledItem,
} from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [recoveryScore, setRecoveryScore] = useState(85);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [streaks, setStreaks] = useState<StreakDay[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [bodyMessage, setBodyMessage] = useState("All systems nominal.");
  const [isLoading, setIsLoading] = useState(true);
  
  // Use global body store
  const bodyStatus = useBodyStore((state) => state.bodyStatus);
  const setBodyStatus = useBodyStore((state) => state.setBodyStatus);
  
  // Use nutrition store for real-time updates
  const todayNutrition = useNutritionStore((state) => state.todayNutrition);
  const loadTodayLog = useNutritionStore((state) => state.loadTodayLog);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      // Load user
      const userData = UserService.getUser();
      setUser(userData);

      // Load today's nutrition data via store
      loadTodayLog();

      const workoutData = WorkoutService.getTodayWorkout();
      setTodayWorkout(workoutData || null);

      // Load streaks
      const streakData = generateStreakData();
      setStreaks(streakData);

      // Load schedule
      const scheduleData = generateScheduledItems();
      setScheduledItems(scheduleData);

      // Get recent workouts for AI context
      const recentWorkouts = WorkoutService.getRecentWorkouts(10);

      // Calculate body status
      const calculatedBodyStatus = AIService.calculateBodyStatus(recentWorkouts);
      setBodyStatus(calculatedBodyStatus);

      // Get body recommendation
      const bodyRecommendation = AIService.getSuggestedTarget(calculatedBodyStatus);
      setBodyMessage(bodyRecommendation);

      // Generate AI insights with body status (use calculated status for context)
      const nutritionData = useNutritionStore.getState().todayNutrition;
      const context = {
        user: userData,
        todayNutrition: nutritionData,
        todayWorkout: workoutData || null,
        recentWorkouts,
        weeklyCalories: NutritionService.getWeeklyCalories().map((d) => d.calories),
        bodyStatus: calculatedBodyStatus, // Use calculated status for AI context
      };

      const insight = AIService.generateInsight(context);
      setAiInsight(insight);

      const recovery = AIService.calculateRecoveryScore(context);
      setRecoveryScore(recovery);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = () => {
    setIsLoading(true);
    // Simulate sync delay
    setTimeout(() => {
      loadDashboardData();
    }, 500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
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
            <DailyTimeline items={scheduledItems} />
            <StreakGrid streaks={streaks} />
          </div>
        </div>

        {/* Right Section - Holographic Body 3D (1 column on desktop) */}
        <div className="lg:col-span-1">
          <HolographicBody3D 
            aiMessage={bodyMessage}
          />
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
