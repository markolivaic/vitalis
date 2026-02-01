/**
 * Vitalis AI | Health & Performance Hub
 * File: page.tsx
 * Description: Unified activity history page with timeline view.
 */

"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { UnifiedTimeline } from "@/components/history/unified-timeline";
import { WorkoutSummaryModal } from "@/components/history/workout-summary-modal";
import { HistoryService } from "@/lib/services/history.service";
import type { TimelineItem, TimelineFilter, Workout, DailyNutrition } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HistoryPage() {
  const [entries, setEntries] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [selectedEntry, setSelectedEntry] = useState<TimelineItem | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = () => {
    try {
      const timeline = HistoryService.getUnifiedTimeline(filter);
      setEntries(timeline);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEntry = (entry: TimelineItem) => {
    setSelectedEntry(entry);
    if (entry.type === "workout") {
      setSelectedWorkout(entry.data as Workout);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading history...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-6 h-6 text-zinc-400" />
            History
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Your unified activity timeline
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(value: TimelineFilter) => setFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="workouts">Workouts Only</SelectItem>
              <SelectItem value="nutrition">Nutrition Only</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{entries.length}</p>
            <p className="text-xs text-zinc-500">Total entries</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <UnifiedTimeline
        entries={entries}
        filter={filter}
        onSelectEntry={handleSelectEntry}
      />

      {/* Workout Summary Modal */}
      <WorkoutSummaryModal
        workout={selectedWorkout}
        open={!!selectedWorkout}
        onClose={() => {
          setSelectedWorkout(null);
          setSelectedEntry(null);
        }}
      />

      {/* Nutrition Details Dialog */}
      {selectedEntry?.type === "nutrition" && (
        <Dialog
          open={!!selectedEntry && selectedEntry.type === "nutrition"}
          onOpenChange={() => setSelectedEntry(null)}
        >
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                {selectedEntry &&
                  new Date(selectedEntry.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </DialogDescription>
            </DialogHeader>

            {selectedEntry.type === "nutrition" && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="glass-card p-3 rounded-lg text-center">
                    <p className="text-zinc-500 text-xs mb-1">Calories</p>
                    <p className="font-medium text-emerald-400">
                      {(selectedEntry.data as DailyNutrition).totalCalories}
                    </p>
                  </div>
                  <div className="glass-card p-3 rounded-lg text-center">
                    <p className="text-zinc-500 text-xs mb-1">Protein</p>
                    <p className="font-medium text-white">
                      {Math.round((selectedEntry.data as DailyNutrition).totalProtein)}g
                    </p>
                  </div>
                  <div className="glass-card p-3 rounded-lg text-center">
                    <p className="text-zinc-500 text-xs mb-1">Carbs</p>
                    <p className="font-medium text-white">
                      {Math.round((selectedEntry.data as DailyNutrition).totalCarbs)}g
                    </p>
                  </div>
                  <div className="glass-card p-3 rounded-lg text-center">
                    <p className="text-zinc-500 text-xs mb-1">Fats</p>
                    <p className="font-medium text-white">
                      {Math.round((selectedEntry.data as DailyNutrition).totalFats)}g
                    </p>
                  </div>
                </div>

                {(selectedEntry.data as DailyNutrition).meals.length > 0 && (
                  <div className="space-y-2">
                    {(selectedEntry.data as DailyNutrition).meals.map((meal) => (
                      <div key={meal.id} className="glass-card p-3 rounded-lg">
                        <p className="font-medium text-white text-sm capitalize">
                          {meal.type}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {meal.entries.map((e) => e.foodName).join(", ")}
                        </p>
                        <p className="text-xs text-emerald-400 mt-1">
                          {meal.totalCalories} kcal
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

