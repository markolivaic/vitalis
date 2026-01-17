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

interface NutritionState {
  todayLog: TodayLog;
  targets: Targets;
  recentFoods: FoodItem[];
  todayNutrition: DailyNutrition | null;
  selectedDate: string;

  // Actions
  loadTodayLog: (date?: string) => void;
  logFood: (mealType: MealType, foodId: string, servings: number) => void;
  quickLogCalories: (
    mealType: MealType,
    calories: number,
    protein: number,
    carbs?: number,
    fats?: number
  ) => void;
  deleteFood: (mealType: MealType, entryId: string) => void;
  getTotals: () => { calories: number; protein: number; carbs: number; fats: number };
}

const RECENT_FOODS_KEY = "vitalis-recent-foods";

// Helper to organize meals by type
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

// Load recent foods from localStorage
function loadRecentFoods(): FoodItem[] {
  const foodIds = StorageService.get<string[]>(RECENT_FOODS_KEY) || [];
  const allFoods = NutritionService.getFoods();
  return foodIds
    .map((id) => allFoods.find((f) => f.id === id))
    .filter((f): f is FoodItem => f !== undefined)
    .slice(0, 5);
}

// Save recent foods to localStorage
function saveRecentFood(foodId: string): void {
  const current = StorageService.get<string[]>(RECENT_FOODS_KEY) || [];
  // Remove if already exists, then add to front
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

  loadTodayLog: (date) => {
    const targetDate = date || getToday();
    const nutrition = NutritionService.getNutritionByDate(targetDate) || NutritionService.getTodayNutrition();
    const user = UserService.getUser();

    const organized = organizeMealsByType(nutrition);
    const recentFoods = loadRecentFoods();

    set({
      todayLog: organized,
      targets: {
        calories: user.calorieTarget,
        protein: user.proteinTarget,
        carbs: user.carbsTarget,
        fat: user.fatsTarget,
      },
      recentFoods: recentFoods,
      todayNutrition: nutrition,
      selectedDate: targetDate,
    });
  },

  logFood: (mealType, foodId, servings) => {
    const state = get();
    const nutrition = NutritionService.addFoodToMeal(state.selectedDate, mealType, foodId, servings);
    const organized = organizeMealsByType(nutrition);

    // Add to recent foods
    saveRecentFood(foodId);
    const recentFoods = loadRecentFoods();

    set({
      todayLog: organized,
      todayNutrition: nutrition,
      recentFoods: recentFoods,
    });
  },

  quickLogCalories: (mealType, calories, protein, carbs = 0, fats = 0) => {
    const state = get();
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

  deleteFood: (mealType, entryId) => {
    const state = get();
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








