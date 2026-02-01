/**
 * File: unified-timeline.tsx
 * Description: Combined workout and nutrition history timeline component.
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Apple,
  TrendingUp,
  Calendar,
  Trophy,
  Sparkles,
} from "lucide-react";
import { HistoryService } from "@/lib/services/history.service";
import { UserService } from "@/lib/services/user.service";
import type { TimelineItem, TimelineFilter, Workout, DailyNutrition } from "@/lib/types";
import { getRelativeDateLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UnifiedTimelineProps {
  entries: TimelineItem[];
  filter: TimelineFilter;
  onSelectEntry?: (entry: TimelineItem) => void;
}

export function UnifiedTimeline({
  entries,
  filter,
  onSelectEntry,
}: UnifiedTimelineProps) {
  const user = UserService.getUser();
  const groupedEntries = useMemo(() => {
    return HistoryService.groupTimelineByDate(entries);
  }, [entries]);

  const perfectDays = useMemo(() => {
    return HistoryService.detectPerfectDays(entries, user);
  }, [entries, user]);

  // Guard clause for null/undefined or empty entries
  if (!entries || entries.length === 0) {
    return (
      <GlassCard padding="lg" className="text-center py-12">
        <div className="text-zinc-600 mb-2 font-mono text-sm">[ NO DATA DETECTED ]</div>
        <p className="text-zinc-500">
          No activity recorded in system logs.
        </p>
        <p className="text-sm text-zinc-600 mt-2">
          Initialize training or nutrition intake to populate timeline.
        </p>
      </GlassCard>
    );
  }

  // Sort dates (newest first)
  const sortedDates = Array.from(groupedEntries.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="relative space-y-6">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      {sortedDates.map((date, dateIndex) => {
        const dateEntries = groupedEntries.get(date)!;
        const isPerfectDay = perfectDays.get(date) || false;

        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-medium text-zinc-400">
                {getRelativeDateLabel(date)}
              </h3>
              {isPerfectDay && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">
                    Perfect Day
                  </span>
                </div>
              )}
            </div>

            {/* Perfect Day Container */}
            <div
              className={cn(
                "space-y-3 rounded-lg p-4 transition-all duration-300",
                isPerfectDay &&
                  "bg-amber-500/5 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              )}
            >
              {dateEntries.map((entry, index) => (
                <TimelineItem
                  key={entry.id}
                  entry={entry}
                  onClick={() => onSelectEntry?.(entry)}
                  index={index}
                  isPerfectDay={isPerfectDay}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TimelineItem({
  entry,
  onClick,
  index,
  isPerfectDay,
}: {
  entry: TimelineItem;
  onClick?: () => void;
  index: number;
  isPerfectDay: boolean;
}) {
  const isWorkout = entry.type === "workout";
  const workout = isWorkout ? (entry.data as Workout) : null;
  const nutrition = !isWorkout ? (entry.data as DailyNutrition) : null;
  const user = UserService.getUser();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4 cursor-pointer group"
      onClick={onClick}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          "transition-all duration-200 group-hover:scale-110",
          isWorkout
            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
        )}
      >
        {isWorkout ? (
          <Dumbbell className="w-5 h-5" />
        ) : (
          <Apple className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <GlassCard
        padding="md"
        className={cn(
          "flex-1 transition-all duration-200",
          "group-hover:bg-white/[0.04] group-hover:scale-[1.01]",
          isWorkout
            ? "border-l-2 border-l-violet-500/30 group-hover:border-l-violet-500/50"
            : "border-l-2 border-l-emerald-500/30 group-hover:border-l-emerald-500/50"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-white">{entry.title}</h4>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {entry.subtitle}
            </p>
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium",
              isWorkout
                ? "bg-violet-500/20 text-violet-400"
                : "bg-emerald-500/20 text-emerald-400"
            )}
          >
            {isWorkout ? "Workout" : "Nutrition"}
          </div>
        </div>

        {/* Workout Content */}
        {workout && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-white font-medium">
                  {workout.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">
                {workout.exercises.length} exercises
              </span>
              {workout.duration && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500">
                    {Math.floor(workout.duration / 60)} min
                  </span>
                </>
              )}
            </div>

            {/* PRs */}
            {entry.prsHit && entry.prsHit.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {entry.prsHit.map((pr, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20"
                  >
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">{pr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nutrition Content */}
        {nutrition && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>
                <span className="text-white font-medium">
                  {nutrition.totalCalories}
                </span>{" "}
                / {user.calorieTarget} kcal
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="pt-2">
              <Progress
                value={user.calorieTarget > 0 
                  ? Math.min((nutrition.totalCalories / user.calorieTarget) * 100, 100) 
                  : 0}
                variant="emerald"
                className="h-1.5"
              />
            </div>

            {/* Macros */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs text-zinc-500">
              <span>
                P: <span className="text-white">{Math.round(nutrition.totalProtein)}</span>g
              </span>
              <span>
                C: <span className="text-white">{Math.round(nutrition.totalCarbs)}</span>g
              </span>
              <span>
                F: <span className="text-white">{Math.round(nutrition.totalFats)}</span>g
              </span>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
