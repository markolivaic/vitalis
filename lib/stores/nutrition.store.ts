/**
 * File: nutrition.store.ts
 * Description: Zustand store for managing nutrition state and meal logging.
 */

import { create } from "zustand";
import { NutritionService } from "@/lib/services/nutrition.service";
import { UserService } from "@/lib/services/user.service";
import { StorageService, STORAGE_KEYS } from "@/lib/services/storage.service";
import { getToday } from "@/lib/utils";
import type { MealEntry, MealType, DailyNutrition, FoodItem } from "@/lib/types";

interface TodayLog {
  breakfast: MealEntry[];
  lunch: MealEntry[];
  dinner: MealEntry[];
  snack: MealEntry[];
}

interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DbNutritionLog {
  id: string;
  foodId: string;
  foodName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
  date: string;
}

interface NutritionState {
  todayLog: TodayLog;
  targets: Targets;
  recentFoods: FoodItem[];
  todayNutrition: DailyNutrition | null;
  selectedDate: string;
  isLoading: boolean;
  loadTodayLog: (date?: string) => Promise<void>;
  logFood: (mealType: MealType, foodId: string, servings: number) => Promise<void>;
  quickLogCalories: (
    mealType: MealType,
    calories: number,
    protein: number,
    carbs?: number,
    fats?: number
  ) => Promise<void>;
  deleteFood: (mealType: MealType, entryId: string) => Promise<void>;
  getTotals: () => { calories: number; protein: number; carbs: number; fats: number };
}

const RECENT_FOODS_KEY = "vitalis-recent-foods";

const toMealEntry = (log: DbNutritionLog): MealEntry => ({
  id: log.id,
  foodId: log.foodId || log.id,
  foodName: log.foodName,
  servings: log.servings,
  calories: log.calories,
  protein: log.protein,
  carbs: log.carbs,
  fats: log.fats,
});

function organizeMealsByType(nutrition: DailyNutrition): TodayLog {
  const log: TodayLog = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  nutrition.meals.forEach((meal) => {
    log[meal.type] = meal.entries;
  });

  return log;
}

function organizeDbLogsByType(logs: DbNutritionLog[]): TodayLog {
  const organized: TodayLog = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  logs.forEach((log) => {
    const mealType = log.mealType as MealType;
    if (organized[mealType]) {
      organized[mealType].push(toMealEntry(log));
    }
  });

  return organized;
}

function loadRecentFoods(): FoodItem[] {
  const foodIds = StorageService.get<string[]>(RECENT_FOODS_KEY) || [];
  const allFoods = NutritionService.getFoods();
  return foodIds
    .map((id) => allFoods.find((f) => f.id === id))
    .filter((f): f is FoodItem => f !== undefined)
    .slice(0, 5);
}

function saveRecentFood(foodId: string): void {
  const current = StorageService.get<string[]>(RECENT_FOODS_KEY) || [];
  const updated = [foodId, ...current.filter((id) => id !== foodId)].slice(0, 5);
  StorageService.set(RECENT_FOODS_KEY, updated);
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayLog: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  },
  targets: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  },
  recentFoods: [],
  todayNutrition: null,
  selectedDate: getToday(),
  isLoading: false,

  loadTodayLog: async (date) => {
    const targetDate = date || getToday();
    const user = UserService.getUser();
    const recentFoods = loadRecentFoods();

    set({ isLoading: true, selectedDate: targetDate });

    try {
      const res = await fetch(`/api/nutrition?date=${targetDate}`);

      if (res.ok) {
        const response = await res.json();
        const logs: DbNutritionLog[] = response.data || response;
        const organized = organizeDbLogsByType(logs);

        const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
        const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
        const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
        const totalFats = logs.reduce((sum, log) => sum + log.fats, 0);

        set({
          todayLog: organized,
          targets: {
            calories: user.calorieTarget,
            protein: user.proteinTarget,
            carbs: user.carbsTarget,
            fat: user.fatsTarget,
          },
          recentFoods,
          todayNutrition: {
            date: targetDate,
            meals: [],
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFats,
          },
          isLoading: false,
        });
        return;
      }
    } catch (error) {
      console.error("API fetch failed, falling back to localStorage:", error);
    }

    const nutrition = NutritionService.getNutritionByDate(targetDate) || NutritionService.getTodayNutrition();
    const organized = organizeMealsByType(nutrition);

    set({
      todayLog: organized,
      targets: {
        calories: user.calorieTarget,
        protein: user.proteinTarget,
        carbs: user.carbsTarget,
        fat: user.fatsTarget,
      },
      recentFoods,
      todayNutrition: nutrition,
      isLoading: false,
    });
  },

  logFood: async (mealType, foodId, servings) => {
    const state = get();
    const allFoods = NutritionService.getFoods();
    const food = allFoods.find((f) => f.id === foodId);

    if (!food) return;

    saveRecentFood(foodId);

    const payload = {
      foodName: food.name,
      calories: food.calories * servings,
      protein: food.protein * servings,
      carbs: food.carbs * servings,
      fats: food.fats * servings,
      servings,
      mealType,
      date: state.selectedDate,
    };

    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await get().loadTodayLog(state.selectedDate);
        return;
      }
    } catch (error) {
      console.error("API save failed, falling back to localStorage:", error);
    }

    const nutrition = NutritionService.addFoodToMeal(state.selectedDate, mealType, foodId, servings);
    const organized = organizeMealsByType(nutrition);
    const recentFoods = loadRecentFoods();

    set({
      todayLog: organized,
      todayNutrition: nutrition,
      recentFoods,
    });
  },

  quickLogCalories: async (mealType, calories, protein, carbs = 0, fats = 0) => {
    const state = get();

    const payload = {
      foodName: "Quick Entry",
      calories,
      protein,
      carbs,
      fats,
      servings: 1,
      mealType,
      date: state.selectedDate,
    };

    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await get().loadTodayLog(state.selectedDate);
        return;
      }
    } catch (error) {
      console.error("API save failed, falling back to localStorage:", error);
    }

    const nutrition = NutritionService.quickAddCalories(
      state.selectedDate,
      mealType,
      calories,
      protein,
      carbs,
      fats
    );
    const organized = organizeMealsByType(nutrition);

    set({
      todayLog: organized,
      todayNutrition: nutrition,
    });
  },

  deleteFood: async (mealType, entryId) => {
    const state = get();

    try {
      const res = await fetch(`/api/nutrition/${entryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await get().loadTodayLog(state.selectedDate);
        return;
      }
    } catch (error) {
      console.error("API delete failed, falling back to localStorage:", error);
    }

    const nutrition = NutritionService.removeFoodFromMeal(state.selectedDate, mealType, entryId);

    if (!nutrition) return;

    const organized = organizeMealsByType(nutrition);

    set({
      todayLog: organized,
      todayNutrition: nutrition,
    });
  },

  getTotals: () => {
    const state = get();
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    Object.values(state.todayLog).forEach((entries) => {
      entries.forEach((entry) => {
        totals.calories += entry.calories;
        totals.protein += entry.protein;
        totals.carbs += entry.carbs;
        totals.fats += entry.fats;
      });
    });

    return totals;
  },
}));
