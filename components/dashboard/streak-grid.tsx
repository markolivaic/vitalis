/**
 * File: streak-grid.tsx
 * Description: Activity streak visualization grid component with real-time data fetching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Flame } from "lucide-react";
import type { StreakDay } from "@/lib/types";
import { cn } from "@/lib/utils";

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  const json = await response.json();
  return json.data;
}

export function StreakGrid() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const streaks: StreakDay[] = data?.streaks ?? [];

  // Calculate current streak
  const currentStreak = streaks.reduce((count, day, index) => {
    if (index === 0 || count < index) {
      return day.activityLevel > 0 ? count + 1 : 0;
    }
    return count;
  }, 0);

  const getActivityClass = (level: StreakDay["activityLevel"]) => {
    switch (level) {
      case 3:
        return "active-high";
      case 2:
        return "active-medium";
      case 1:
        return "active-low";
      default:
        return "";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
  };

  if (isLoading) {
    return (
      <GlassCard className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Consistency
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse" />
            <span className="text-xs text-zinc-500">day streak</span>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className="streak-cell bg-zinc-800 animate-pulse"
                style={{ animationDelay: `${index * 30}ms` }}
              />
              {index % 2 === 0 && (
                <span className="text-[8px] text-zinc-600">-</span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="streak-cell w-2.5 h-2.5" />
            <span className="text-[10px] text-zinc-600">None</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="streak-cell w-2.5 h-2.5 active-low" />
            <span className="text-[10px] text-zinc-600">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="streak-cell w-2.5 h-2.5 active-medium" />
            <span className="text-[10px] text-zinc-600">Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="streak-cell w-2.5 h-2.5 active-high" />
            <span className="text-[10px] text-zinc-600">High</span>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Consistency
          </h3>
        </div>
        <p className="text-sm text-zinc-500 text-center py-4">
          Unable to load streak data
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Consistency
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-white">{currentStreak}</span>
          <span className="text-xs text-zinc-500">day streak</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {streaks.map((day, index) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-1"
            title={`${day.date}: ${day.hasWorkout ? "Workout" : ""
              } ${day.hasNutrition ? "Nutrition" : ""}`}
          >
            <div
              className={cn(
                "streak-cell hover:scale-125 transition-transform",
                getActivityClass(day.activityLevel)
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            />
            {index % 2 === 0 && (
              <span className="text-[8px] text-zinc-600">
                {formatDate(day.date)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="streak-cell w-2.5 h-2.5" />
          <span className="text-[10px] text-zinc-600">None</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="streak-cell w-2.5 h-2.5 active-low" />
          <span className="text-[10px] text-zinc-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="streak-cell w-2.5 h-2.5 active-medium" />
          <span className="text-[10px] text-zinc-600">Med</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="streak-cell w-2.5 h-2.5 active-high" />
          <span className="text-[10px] text-zinc-600">High</span>
        </div>
      </div>
    </GlassCard>
  );
}
