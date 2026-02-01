/**
 * Vitalis AI | Health & Performance Hub
 * File: ai.service.ts
 * Description: Rule-based AI engine for generating health insights and recommendations.
 */

import type { AIInsight, AIContext, Workout, BodyStatus } from "@/lib/types";
import { generateId } from "@/lib/utils";

// Nutrition Thresholds
const NUTRITION_THRESHOLDS = {
  PROTEIN_LOW_RATIO: 0.7,
  PROTEIN_VERY_LOW_RATIO: 0.6,
  PROTEIN_GOOD_RATIO: 0.8,
  PROTEIN_TARGET_MIN: 0.9,
  PROTEIN_TARGET_MAX: 1.1,
  CALORIE_DEFICIT_SEVERE: 0.5,
  CALORIE_DEFICIT_MODERATE: 0.7,
  CALORIE_EXCESS_THRESHOLD: 1.15,
} as const;

// Workout Progression Thresholds
const WORKOUT_THRESHOLDS = {
  VOLUME_INCREASE_RATIO: 1.05,
  VOLUME_ABOVE_AVERAGE_RATIO: 1.1,
  DAYS_SINCE_WORKOUT_WARNING: 3,
  CONSECUTIVE_DAYS_WARNING: 5,
  CONSECUTIVE_DAYS_MODERATE: 3,
  RECENT_WORKOUT_WINDOW_DAYS: 7,
  EXTENDED_WORKOUT_WINDOW_DAYS: 14,
  MAX_CONSECUTIVE_CHECK_DAYS: 14,
} as const;

// Recovery Score Penalties
const RECOVERY_PENALTIES = {
  BASE_SCORE: 100,
  CONSECUTIVE_5_DAYS: 20,
  CONSECUTIVE_3_DAYS: 10,
  PROTEIN_VERY_LOW: 15,
  PROTEIN_LOW: 10,
  NO_NUTRITION_DATA: 5,
  CALORIE_DEFICIT_MUSCLE_GOAL: 10,
} as const;

// Time Thresholds (in hours)
const TIME_THRESHOLDS = {
  FATIGUED_WINDOW_HOURS: 24,
  RECOVERING_WINDOW_HOURS: 48,
} as const;

interface RuleCondition {
  check: (context: AIContext) => boolean;
  message: string;
  type: "tip" | "warning" | "achievement";
  context: string;
}

const rules: RuleCondition[] = [
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalProtein < ctx.user.proteinTarget * NUTRITION_THRESHOLDS.PROTEIN_LOW_RATIO;
    },
    message: "Protein intake low. Consider adding a shake or lean protein source.",
    type: "warning",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalCalories < ctx.user.calorieTarget * NUTRITION_THRESHOLDS.CALORIE_DEFICIT_SEVERE;
    },
    message: "You're in a significant caloric deficit today. Don't forget to fuel properly.",
    type: "warning",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalCalories > ctx.user.calorieTarget * NUTRITION_THRESHOLDS.CALORIE_EXCESS_THRESHOLD;
    },
    message: "Calorie target exceeded. Consider a lighter dinner or extra cardio.",
    type: "tip",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      const proteinRatio = ctx.todayNutrition.totalProtein / ctx.user.proteinTarget;
      return proteinRatio >= NUTRITION_THRESHOLDS.PROTEIN_TARGET_MIN && proteinRatio <= NUTRITION_THRESHOLDS.PROTEIN_TARGET_MAX;
    },
    message: "Protein intake on point! Great job hitting your macros.",
    type: "achievement",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (ctx.recentWorkouts.length < 2) return false;
      const thisWeekVolume = ctx.recentWorkouts
        .filter((w) => isWithinDays(w.date, WORKOUT_THRESHOLDS.RECENT_WORKOUT_WINDOW_DAYS))
        .reduce((sum, w) => sum + w.totalVolume, 0);
      const lastWeekVolume = ctx.recentWorkouts
        .filter((w) => isWithinDays(w.date, WORKOUT_THRESHOLDS.EXTENDED_WORKOUT_WINDOW_DAYS) && !isWithinDays(w.date, WORKOUT_THRESHOLDS.RECENT_WORKOUT_WINDOW_DAYS))
        .reduce((sum, w) => sum + w.totalVolume, 0);
      return thisWeekVolume > lastWeekVolume * WORKOUT_THRESHOLDS.VOLUME_INCREASE_RATIO;
    },
    message: "Progressive overload achieved! Volume up from last week.",
    type: "achievement",
    context: "workout",
  },
  {
    check: (ctx) => {
      const daysSinceLastWorkout = getDaysSinceLastWorkout(ctx.recentWorkouts);
      return daysSinceLastWorkout >= WORKOUT_THRESHOLDS.DAYS_SINCE_WORKOUT_WARNING;
    },
    message: "It's been 3+ days since your last workout. Time to hit the gym?",
    type: "tip",
    context: "workout",
  },
  {
    check: (ctx) => {
      if (!ctx.todayWorkout || ctx.todayWorkout.status !== "completed") return false;
      return ctx.todayWorkout.totalVolume > getAverageVolume(ctx.recentWorkouts) * WORKOUT_THRESHOLDS.VOLUME_ABOVE_AVERAGE_RATIO;
    },
    message: "Great session! Your volume today exceeded your average.",
    type: "achievement",
    context: "workout",
  },
  {
    check: (ctx) => {
      const consecutiveWorkouts = getConsecutiveWorkoutDays(ctx.recentWorkouts);
      return consecutiveWorkouts >= WORKOUT_THRESHOLDS.CONSECUTIVE_DAYS_WARNING;
    },
    message: "5+ consecutive training days. Consider scheduling a rest day for recovery.",
    type: "warning",
    context: "recovery",
  },
  {
    check: (ctx) => {
      const hadWorkoutToday = ctx.todayWorkout?.status === "completed";
      const hasLowProtein = ctx.todayNutrition
        ? ctx.todayNutrition.totalProtein < ctx.user.proteinTarget * NUTRITION_THRESHOLDS.PROTEIN_VERY_LOW_RATIO
        : false;
      return hadWorkoutToday && hasLowProtein;
    },
    message: "You trained today but protein is low. Prioritize protein in your next meal.",
    type: "warning",
    context: "combined",
  },
  {
    check: (ctx) => {
      const hadWorkoutToday = ctx.todayWorkout?.status === "completed";
      const hasGoodProtein = ctx.todayNutrition
        ? ctx.todayNutrition.totalProtein >= ctx.user.proteinTarget * NUTRITION_THRESHOLDS.PROTEIN_GOOD_RATIO
        : false;
      return hadWorkoutToday && hasGoodProtein;
    },
    message: "Training + solid protein intake today. Gains loading...",
    type: "achievement",
    context: "combined",
  },
];

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

function getDaysSinceLastWorkout(workouts: Workout[]): number {
  if (workouts.length === 0) return 999;
  const lastWorkout = workouts[0];
  const lastDate = new Date(lastWorkout.date);
  const now = new Date();
  return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getAverageVolume(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const total = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
  return total / workouts.length;
}

function getConsecutiveWorkoutDays(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;

  let consecutive = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < WORKOUT_THRESHOLDS.MAX_CONSECUTIVE_CHECK_DAYS; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    const hadWorkout = workouts.some((w) => w.date === dateStr);
    if (hadWorkout) {
      consecutive++;
    } else {
      break;
    }
  }

  return consecutive;
}

export const AIService = {
  generateInsight(context: AIContext): AIInsight | null {
    for (const rule of rules) {
      if (rule.check(context)) {
        return {
          id: generateId(),
          type: rule.type,
          message: rule.message,
          context: rule.context,
          createdAt: new Date().toISOString(),
        };
      }
    }

    return {
      id: generateId(),
      type: "tip",
      message: "All systems nominal. Keep up the consistency!",
      context: "general",
      createdAt: new Date().toISOString(),
    };
  },

  generateInsights(context: AIContext, limit: number = 3): AIInsight[] {
    const insights: AIInsight[] = [];

    for (const rule of rules) {
      if (insights.length >= limit) break;
      if (rule.check(context)) {
        insights.push({
          id: generateId(),
          type: rule.type,
          message: rule.message,
          context: rule.context,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: generateId(),
        type: "tip",
        message: "All systems nominal. Keep up the consistency!",
        context: "general",
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  },

  calculateRecoveryScore(context: AIContext): number {
    let score = RECOVERY_PENALTIES.BASE_SCORE;

    const consecutive = getConsecutiveWorkoutDays(context.recentWorkouts);
    if (consecutive >= WORKOUT_THRESHOLDS.CONSECUTIVE_DAYS_WARNING) score -= RECOVERY_PENALTIES.CONSECUTIVE_5_DAYS;
    else if (consecutive >= WORKOUT_THRESHOLDS.CONSECUTIVE_DAYS_MODERATE) score -= RECOVERY_PENALTIES.CONSECUTIVE_3_DAYS;

    if (context.todayNutrition) {
      const proteinRatio =
        context.todayNutrition.totalProtein / context.user.proteinTarget;
      if (proteinRatio < NUTRITION_THRESHOLDS.CALORIE_DEFICIT_SEVERE) score -= RECOVERY_PENALTIES.PROTEIN_VERY_LOW;
      else if (proteinRatio < NUTRITION_THRESHOLDS.PROTEIN_LOW_RATIO) score -= RECOVERY_PENALTIES.PROTEIN_LOW;
    } else {
      score -= RECOVERY_PENALTIES.NO_NUTRITION_DATA;
    }

    if (context.user.goal === "muscle" && context.todayNutrition) {
      const calorieRatio =
        context.todayNutrition.totalCalories / context.user.calorieTarget;
      if (calorieRatio < NUTRITION_THRESHOLDS.CALORIE_DEFICIT_MODERATE) score -= RECOVERY_PENALTIES.CALORIE_DEFICIT_MUSCLE_GOAL;
    }

    return Math.max(0, Math.min(100, score));
  },

  calculateBodyStatus(recentWorkouts: Workout[]): BodyStatus {
    const status: BodyStatus = {
      upperBody: "fresh",
      core: "fresh",
      lowerBody: "fresh",
      cardio: "fresh",
    };

    const now = new Date();

    for (const workout of recentWorkouts) {
      if (workout.status !== "completed") continue;

      const workoutDate = new Date(workout.date);
      const hoursAgo = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);

      const workoutName = workout.name.toLowerCase();

      if (hoursAgo <= TIME_THRESHOLDS.FATIGUED_WINDOW_HOURS) {
        if (workoutName.includes("push") || workoutName.includes("chest") || workoutName.includes("shoulder")) {
          status.upperBody = "fatigued";
        }
        if (workoutName.includes("pull") || workoutName.includes("back") || workoutName.includes("bicep")) {
          status.upperBody = "fatigued";
        }
        if (workoutName.includes("leg") || workoutName.includes("lower")) {
          status.lowerBody = "fatigued";
        }
        if (workoutName.includes("core") || workoutName.includes("ab")) {
          status.core = "fatigued";
        }
        if (workoutName.includes("cardio") || workoutName.includes("run") || workoutName.includes("hiit")) {
          status.cardio = "fatigued";
        }
      } else if (hoursAgo <= TIME_THRESHOLDS.RECOVERING_WINDOW_HOURS) {
        if ((workoutName.includes("push") || workoutName.includes("pull") || workoutName.includes("chest") || workoutName.includes("back")) && status.upperBody === "fresh") {
          status.upperBody = "recovering";
        }
        if ((workoutName.includes("leg") || workoutName.includes("lower")) && status.lowerBody === "fresh") {
          status.lowerBody = "recovering";
        }
        if ((workoutName.includes("core") || workoutName.includes("ab")) && status.core === "fresh") {
          status.core = "recovering";
        }
      }
    }

    return status;
  },

  getSuggestedTarget(bodyStatus: BodyStatus): string {
    if (bodyStatus.lowerBody === "fresh") return "Lower body is fresh - great day for legs!";
    if (bodyStatus.upperBody === "fresh") return "Upper body is fresh - perfect for push/pull!";
    if (bodyStatus.core === "fresh") return "Core is ready - add some ab work today!";
    return "Consider active recovery or light cardio today.";
  },
};
