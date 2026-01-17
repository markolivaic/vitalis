import type { AIInsight, AIContext, Workout, BodyStatus } from "@/lib/types";
import { generateId } from "@/lib/utils";

// TODO: AI Integration - Replace rule engine with OpenAI API
// This service uses a rule-based engine for now
// To integrate real AI:
// 1. Add OpenAI API key to environment variables
// 2. Replace generateInsight() with API call passing AIContext
// 3. Keep rule engine as fallback for offline/rate-limited scenarios

interface RuleCondition {
  check: (context: AIContext) => boolean;
  message: string;
  type: "tip" | "warning" | "achievement";
  context: string;
}

// Rule-based AI Engine
const rules: RuleCondition[] = [
  // Nutrition Rules
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalProtein < ctx.user.proteinTarget * 0.7;
    },
    message: "Protein intake low. Consider adding a shake or lean protein source.",
    type: "warning",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalCalories < ctx.user.calorieTarget * 0.5;
    },
    message: "You're in a significant caloric deficit today. Don't forget to fuel properly.",
    type: "warning",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      return ctx.todayNutrition.totalCalories > ctx.user.calorieTarget * 1.15;
    },
    message: "Calorie target exceeded. Consider a lighter dinner or extra cardio.",
    type: "tip",
    context: "nutrition",
  },
  {
    check: (ctx) => {
      if (!ctx.todayNutrition) return false;
      const proteinRatio = ctx.todayNutrition.totalProtein / ctx.user.proteinTarget;
      return proteinRatio >= 0.9 && proteinRatio <= 1.1;
    },
    message: "Protein intake on point! Great job hitting your macros.",
    type: "achievement",
    context: "nutrition",
  },

  // Workout Rules
  {
    check: (ctx) => {
      if (ctx.recentWorkouts.length < 2) return false;
      const thisWeekVolume = ctx.recentWorkouts
        .filter((w) => isWithinDays(w.date, 7))
        .reduce((sum, w) => sum + w.totalVolume, 0);
      const lastWeekVolume = ctx.recentWorkouts
        .filter((w) => isWithinDays(w.date, 14) && !isWithinDays(w.date, 7))
        .reduce((sum, w) => sum + w.totalVolume, 0);
      return thisWeekVolume > lastWeekVolume * 1.05;
    },
    message: "Progressive overload achieved! Volume up from last week.",
    type: "achievement",
    context: "workout",
  },
  {
    check: (ctx) => {
      const daysSinceLastWorkout = getDaysSinceLastWorkout(ctx.recentWorkouts);
      return daysSinceLastWorkout >= 3;
    },
    message: "It's been 3+ days since your last workout. Time to hit the gym?",
    type: "tip",
    context: "workout",
  },
  {
    check: (ctx) => {
      if (!ctx.todayWorkout || ctx.todayWorkout.status !== "completed") return false;
      return ctx.todayWorkout.totalVolume > getAverageVolume(ctx.recentWorkouts) * 1.1;
    },
    message: "Great session! Your volume today exceeded your average.",
    type: "achievement",
    context: "workout",
  },

  // Recovery Rules
  {
    check: (ctx) => {
      const consecutiveWorkouts = getConsecutiveWorkoutDays(ctx.recentWorkouts);
      return consecutiveWorkouts >= 5;
    },
    message: "5+ consecutive training days. Consider scheduling a rest day for recovery.",
    type: "warning",
    context: "recovery",
  },

  // Combined Rules
  {
    check: (ctx) => {
      const hadWorkoutToday = ctx.todayWorkout?.status === "completed";
      const lowProtein = ctx.todayNutrition
        ? ctx.todayNutrition.totalProtein < ctx.user.proteinTarget * 0.6
        : false;
      return hadWorkoutToday && lowProtein;
    },
    message: "You trained today but protein is low. Prioritize protein in your next meal.",
    type: "warning",
    context: "combined",
  },
  {
    check: (ctx) => {
      const hadWorkoutToday = ctx.todayWorkout?.status === "completed";
      const goodProtein = ctx.todayNutrition
        ? ctx.todayNutrition.totalProtein >= ctx.user.proteinTarget * 0.8
        : false;
      return hadWorkoutToday && goodProtein;
    },
    message: "Training + solid protein intake today. Gains loading...",
    type: "achievement",
    context: "combined",
  },
];

// Helper functions
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

  for (let i = 0; i < 14; i++) {
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
  // Generate insight based on current context
  // TODO: AI Integration - This method will call OpenAI API
  generateInsight(context: AIContext): AIInsight | null {
    // Find first matching rule
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

    // Default insight if no rules match
    return {
      id: generateId(),
      type: "tip",
      message: "All systems nominal. Keep up the consistency!",
      context: "general",
      createdAt: new Date().toISOString(),
    };
  },

  // Get multiple insights (for dashboard)
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

    // Add default if no insights
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

  // Calculate recovery score (0-100)
  calculateRecoveryScore(context: AIContext): number {
    let score = 100;

    // Deduct for consecutive training days
    const consecutive = getConsecutiveWorkoutDays(context.recentWorkouts);
    if (consecutive >= 5) score -= 20;
    else if (consecutive >= 3) score -= 10;

    // Deduct for low protein
    if (context.todayNutrition) {
      const proteinRatio =
        context.todayNutrition.totalProtein / context.user.proteinTarget;
      if (proteinRatio < 0.5) score -= 15;
      else if (proteinRatio < 0.7) score -= 10;
    } else {
      score -= 5; // No nutrition logged
    }

    // Deduct for caloric deficit (if muscle building)
    if (context.user.goal === "muscle" && context.todayNutrition) {
      const calorieRatio =
        context.todayNutrition.totalCalories / context.user.calorieTarget;
      if (calorieRatio < 0.7) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  },

  // Calculate body status based on recent workouts
  calculateBodyStatus(recentWorkouts: Workout[]): BodyStatus {
    const status: BodyStatus = {
      upperBody: "fresh",
      core: "fresh",
      lowerBody: "fresh",
      cardio: "fresh",
    };

    // Check workouts within last 24-48 hours
    const now = new Date();
    
    for (const workout of recentWorkouts) {
      if (workout.status !== "completed") continue;
      
      const workoutDate = new Date(workout.date);
      const hoursAgo = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);
      
      // Within 24 hours = fatigued, 24-48 hours = recovering
      const workoutName = workout.name.toLowerCase();
      
      if (hoursAgo <= 24) {
        // Fatigued state
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
      } else if (hoursAgo <= 48) {
        // Recovering state (only if not already fatigued)
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

  // Get suggested target muscle group based on body status
  getSuggestedTarget(bodyStatus: BodyStatus): string {
    if (bodyStatus.lowerBody === "fresh") return "Lower body is fresh - great day for legs!";
    if (bodyStatus.upperBody === "fresh") return "Upper body is fresh - perfect for push/pull!";
    if (bodyStatus.core === "fresh") return "Core is ready - add some ab work today!";
    return "Consider active recovery or light cardio today.";
  },
};

