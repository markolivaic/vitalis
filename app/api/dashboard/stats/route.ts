/**
 * File: route.ts
 * Description: API endpoint for dashboard statistics including consistency grid, timeline, and nutrition/workout data.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { StreakDay, ScheduledItem, MealType } from "@/lib/types";

// Meal type to timeline mapping
const MEAL_TIME_MAP: Record<string, { title: string; time: string }> = {
  breakfast: { title: "Breakfast", time: "08:00" },
  lunch: { title: "Lunch", time: "12:30" },
  dinner: { title: "Dinner", time: "19:00" },
  snack: { title: "Snack", time: "15:00" },
};

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        age: true,
        weight: true,
        height: true,
        gender: true,
        goal: true,
        activityLevel: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatsTarget: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

    // Fetch workouts for last 14 days
    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: fourteenDaysAgo,
          lt: todayEnd,
        },
      },
      orderBy: { date: "desc" },
    });

    // Fetch nutrition logs for last 14 days
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: fourteenDaysAgo,
          lt: todayEnd,
        },
      },
      orderBy: { date: "asc" },
    });

    // Build consistency grid (last 14 days)
    const streaks: StreakDay[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasWorkout = workouts.some((w) => {
        const wDate = new Date(w.date);
        return wDate >= dayStart && wDate < dayEnd;
      });

      const hasNutrition = nutritionLogs.some((n) => {
        const nDate = new Date(n.date);
        return nDate >= dayStart && nDate < dayEnd;
      });

      let activityLevel: 0 | 1 | 2 | 3 = 0;
      if (hasWorkout && hasNutrition) {
        activityLevel = 3;
      } else if (hasWorkout) {
        activityLevel = 2;
      } else if (hasNutrition) {
        activityLevel = 1;
      }

      streaks.push({
        date: dateStr,
        activityLevel,
        hasWorkout,
        hasNutrition,
      });
    }

    // Get today's data for timeline
    const todayWorkouts = workouts.filter((w) => {
      const wDate = new Date(w.date);
      return wDate >= todayStart && wDate < todayEnd;
    });

    const todayNutritionLogs = nutritionLogs.filter((n) => {
      const nDate = new Date(n.date);
      return nDate >= todayStart && nDate < todayEnd;
    });

    // Build scheduled items for timeline
    const scheduledItems: ScheduledItem[] = [];

    // Group nutrition logs by meal type
    const mealGroups: Record<string, typeof todayNutritionLogs> = {};
    todayNutritionLogs.forEach((log) => {
      const mealType = log.mealType.toLowerCase();
      if (!mealGroups[mealType]) {
        mealGroups[mealType] = [];
      }
      mealGroups[mealType].push(log);
    });

    // Add meal items to timeline
    Object.entries(mealGroups).forEach(([mealType, logs]) => {
      const mapping = MEAL_TIME_MAP[mealType] || { title: mealType, time: "12:00" };
      scheduledItems.push({
        id: `meal-${mealType}`,
        type: "meal",
        title: mapping.title,
        time: mapping.time,
        status: "done",
        linkedId: logs[0]?.id,
      });
    });

    // Add workout items to timeline
    todayWorkouts.forEach((workout, index) => {
      const workoutTime = new Date(workout.date);
      const timeStr = workoutTime.toTimeString().slice(0, 5);
      scheduledItems.push({
        id: `workout-${workout.id}`,
        type: "workout",
        title: workout.name,
        time: timeStr !== "00:00" ? timeStr : "17:00",
        status: "done",
        linkedId: workout.id,
      });
    });

    // Add pending meal slots that haven't been logged yet
    const currentHour = now.getHours();
    const mealSlots = ["breakfast", "lunch", "dinner", "snack"] as const;
    const mealHours: Record<string, number> = {
      breakfast: 8,
      lunch: 12,
      dinner: 19,
      snack: 15,
    };

    mealSlots.forEach((slot) => {
      if (!mealGroups[slot]) {
        const slotHour = mealHours[slot];
        const isPast = currentHour > slotHour + 2;
        const mapping = MEAL_TIME_MAP[slot];
        scheduledItems.push({
          id: `pending-${slot}`,
          type: "meal",
          title: mapping.title,
          time: mapping.time,
          status: isPast ? "skipped" : "pending",
        });
      }
    });

    // Sort timeline by time
    scheduledItems.sort((a, b) => a.time.localeCompare(b.time));

    // Build today's nutrition summary
    let todayNutrition = null;
    if (todayNutritionLogs.length > 0) {
      const totals = todayNutritionLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fats: acc.fats + log.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      // Group logs into meals
      const meals = Object.entries(mealGroups).map(([mealType, logs]) => ({
        id: `meal-${mealType}`,
        type: mealType as MealType,
        date: todayStart.toISOString(),
        entries: logs.map((log) => ({
          id: log.id,
          foodId: log.id,
          foodName: log.foodName,
          servings: log.servings,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fats: log.fats,
        })),
        totalCalories: logs.reduce((sum, l) => sum + l.calories, 0),
        totalProtein: logs.reduce((sum, l) => sum + l.protein, 0),
        totalCarbs: logs.reduce((sum, l) => sum + l.carbs, 0),
        totalFats: logs.reduce((sum, l) => sum + l.fats, 0),
      }));

      todayNutrition = {
        date: todayStart.toISOString().split("T")[0],
        meals,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFats: totals.fats,
      };
    }

    // Build today's workout
    let todayWorkout = null;
    if (todayWorkouts.length > 0) {
      const w = todayWorkouts[0];
      todayWorkout = {
        id: w.id,
        name: w.name,
        date: w.date.toISOString(),
        startTime: w.date.toTimeString().slice(0, 5),
        duration: w.duration || 0,
        exercises: Array.isArray(w.exercises) ? w.exercises : [],
        totalVolume: w.totalVolume,
        status: "completed" as const,
        notes: w.notes,
      };
    }

    // Get recent workouts for body status calculation (last 10)
    const recentWorkouts = workouts.slice(0, 10).map((w) => ({
      id: w.id,
      name: w.name,
      date: w.date.toISOString(),
      startTime: w.date.toTimeString().slice(0, 5),
      duration: w.duration || 0,
      exercises: Array.isArray(w.exercises) ? w.exercises : [],
      totalVolume: w.totalVolume,
      status: "completed" as const,
      notes: w.notes,
    }));

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name || "User",
          age: user.age,
          weight: user.weight,
          height: user.height,
          gender: user.gender,
          goal: user.goal,
          activityLevel: user.activityLevel,
          calorieTarget: user.calorieTarget,
          proteinTarget: user.proteinTarget,
          carbsTarget: user.carbsTarget,
          fatsTarget: user.fatsTarget,
        },
        streaks,
        scheduledItems,
        todayNutrition,
        todayWorkout,
        recentWorkouts,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
