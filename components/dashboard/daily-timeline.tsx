/**
 * Vitalis AI | Health & Performance Hub
 * File: daily-timeline.tsx
 * Description: Daily schedule timeline component showing meals and workouts with real-time data fetching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Check, Clock, X, Apple, Dumbbell } from "lucide-react";
import type { ScheduledItem } from "@/lib/types";
import { cn } from "@/lib/utils";

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  const json = await response.json();
  return json.data;
}

export function DailyTimeline() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const items: ScheduledItem[] = data?.scheduledItems ?? [];

  const getStatusIcon = (status: ScheduledItem["status"]) => {
    switch (status) {
      case "done":
        return <Check className="w-3 h-3 text-emerald-400" />;
      case "skipped":
        return <X className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-zinc-500" />;
    }
  };

  const getTypeIcon = (type: ScheduledItem["type"]) => {
    return type === "workout" ? (
      <Dumbbell className="w-4 h-4 text-violet-400" />
    ) : (
      <Apple className="w-4 h-4 text-emerald-400" />
    );
  };

  if (isLoading) {
    return (
      <GlassCard className="h-full">
        <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Today&apos;s Schedule
        </h3>

        <div className="relative space-y-1">
          {/* Timeline line */}
          <div className="timeline-line" />

          {/* Skeleton items */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative flex items-center gap-3 py-3 pl-8 rounded-lg"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Timeline dot skeleton */}
              <div className="timeline-dot absolute left-2 bg-zinc-800 animate-pulse" />

              {/* Icon skeleton */}
              <div className="flex-shrink-0 w-4 h-4 bg-zinc-800 rounded animate-pulse" />

              {/* Content skeleton */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
              </div>

              {/* Status skeleton */}
              <div className="flex-shrink-0 w-3 h-3 bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="h-full">
        <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Today&apos;s Schedule
        </h3>
        <p className="text-sm text-zinc-500 text-center py-4">
          Unable to load schedule data
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full">
      <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Today&apos;s Schedule
      </h3>

      <div className="relative space-y-1">
        {/* Timeline line */}
        <div className="timeline-line" />

        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative flex items-center gap-3 py-3 pl-8 rounded-lg transition-colors",
              item.status === "pending" && "hover:bg-white/5 cursor-pointer"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "timeline-dot absolute left-2",
                item.status === "done" && "emerald",
                item.type === "workout" && item.status === "pending" && "violet"
              )}
            />

            {/* Icon */}
            <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  item.status === "done" ? "text-zinc-500 line-through" : "text-white"
                )}
              >
                {item.title}
              </p>
              <p className="text-xs text-zinc-600">{item.time}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">
            No items scheduled for today
          </p>
        )}
      </div>
    </GlassCard>
  );
}
