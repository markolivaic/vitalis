/**
 * File: history.service.ts
 * Description: Service for managing unified timeline history of workouts and nutrition.
 */

import { WorkoutService } from "./workout.service";
import { NutritionService } from "./nutrition.service";
import { UserService } from "./user.service";
import type { TimelineItem, TimelineFilter, Workout, DailyNutrition, User } from "@/lib/types";

export const HistoryService = {
  getUnifiedTimeline(filter: TimelineFilter = "all"): TimelineItem[] {
    const workouts = WorkoutService.getWorkouts().filter(
      (w) => w.status === "completed"
    );
    const nutritionLogs = NutritionService.getNutritionLogs();
    const user = UserService.getUser();

    const workoutItems: TimelineItem[] = workouts.map((w) => {
      const timestamp = this.getTimestamp(w.date, w.startTime);
      const prsHit = this.detectPRs(w);

      return {
        id: `workout-${w.id}`,
        type: "workout",
        date: w.date,
        title: w.name,
        subtitle: `${w.exercises.length} exercises • ${Math.round((w.duration || 0) / 60)} min`,
        data: w,
        timestamp,
        prsHit,
      };
    });

    const nutritionItems: TimelineItem[] = nutritionLogs
      .filter((n) => n.totalCalories > 0)
      .map((n) => {
        const timestamp = this.getTimestamp(n.date);
        const dayScore = this.calculateDayScore(n.date, user);
        const isPerfectDay = dayScore === 100;

        return {
          id: `nutrition-${n.date}`,
          type: "nutrition",
          date: n.date,
          title: "Daily Nutrition",
          subtitle: `${n.totalCalories} kcal • ${n.meals.length} meals logged`,
          data: n,
          timestamp,
          isPerfectDay,
        };
      });

    let allItems: TimelineItem[] = [];
    if (filter === "all") {
      allItems = [...workoutItems, ...nutritionItems];
    } else if (filter === "workouts") {
      allItems = workoutItems;
    } else if (filter === "nutrition") {
      allItems = nutritionItems;
    }

    allItems.sort((a, b) => b.timestamp - a.timestamp);

    const perfectDays = this.detectPerfectDays(allItems, user);
    allItems.forEach((item) => {
      if (perfectDays.has(item.date)) {
        item.isPerfectDay = true;
      }
    });

    return allItems;
  },

  calculateDayScore(date: string, user: User): number {
    const workouts = WorkoutService.getWorkouts().filter(
      (w) => w.status === "completed" && w.date === date
    );
    const nutrition = NutritionService.getNutritionByDate(date);

    let score = 0;

    if (workouts.length > 0) {
      score += 50;
    }

    if (nutrition && nutrition.totalCalories > 0) {
      const target = user.calorieTarget;
      const tolerance = target * 0.1;
      const diff = Math.abs(nutrition.totalCalories - target);

      if (diff <= tolerance) {
        score += 50;
      } else if (nutrition.totalCalories > 0) {
        const percentage = Math.max(0, 1 - diff / target);
        score += Math.round(50 * percentage);
      }
    }

    return score;
  },

  detectPerfectDays(timeline: TimelineItem[], user: User): Map<string, boolean> {
    const perfectDays = new Map<string, boolean>();
    const dates = new Set(timeline.map((item) => item.date));

    dates.forEach((date) => {
      const score = this.calculateDayScore(date, user);
      perfectDays.set(date, score === 100);
    });

    return perfectDays;
  },

  groupTimelineByDate(timeline: TimelineItem[]): Map<string, TimelineItem[]> {
    const grouped = new Map<string, TimelineItem[]>();

    timeline.forEach((item) => {
      const date = item.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item);
    });

    grouped.forEach((items) => {
      items.sort((a, b) => b.timestamp - a.timestamp);
    });

    return grouped;
  },

  getTimestamp(date: string, time?: string): number {
    if (time) {
      return new Date(`${date}T${time}`).getTime();
    }
    return new Date(date).getTime();
  },

  detectPRs(workout: Workout): string[] {
    const prs: string[] = [];
    const allWorkouts = WorkoutService.getWorkouts().filter(
      (w) => w.status === "completed" && w.id !== workout.id
    );

    workout.exercises.forEach((exercise) => {
      const exerciseName = exercise.exerciseName;
      const completedSets = exercise.sets.filter(
        (s) => s.completed && s.type !== "warmup"
      );

      if (completedSets.length === 0) return;

      const previousWorkouts = allWorkouts
        .filter((w) => w.date < workout.date)
        .flatMap((w) =>
          w.exercises
            .filter((e) => e.exerciseName === exerciseName)
            .map((e) => ({
              date: w.date,
              sets: e.sets.filter((s) => s.completed && s.type !== "warmup"),
            }))
        )
        .filter((e) => e.sets.length > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (previousWorkouts.length === 0) {
        prs.push(`${exerciseName} (First Time)`);
        return;
      }

      const maxWeight = Math.max(...completedSets.map((s) => s.weight));
      const previousMaxWeight = Math.max(
        ...previousWorkouts.flatMap((p) => p.sets.map((s) => s.weight))
      );

      if (maxWeight > previousMaxWeight) {
        prs.push(`${exerciseName}: ${maxWeight}kg (Weight PR)`);
      }

      const totalVolume = completedSets.reduce(
        (sum, s) => sum + s.weight * s.reps,
        0
      );
      const previousMaxVolume = Math.max(
        ...previousWorkouts.map((p) =>
          p.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
        )
      );

      if (totalVolume > previousMaxVolume) {
        prs.push(`${exerciseName}: ${totalVolume}kg (Volume PR)`);
      }
    });

    return prs;
  },
};
