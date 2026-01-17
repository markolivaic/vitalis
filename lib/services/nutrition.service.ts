import type { DailyNutrition, Meal, MealEntry, FoodItem, MealType } from "@/lib/types";
import { StorageService, STORAGE_KEYS } from "./storage.service";
import { foodDatabase, generateSampleNutrition } from "@/lib/mock-data";
import { generateId, getToday } from "@/lib/utils";

export const NutritionService = {
  // ===== FOOD DATABASE =====
  getFoods(): FoodItem[] {
    const foods = StorageService.get<FoodItem[]>(STORAGE_KEYS.FOODS);
    if (!foods) {
      StorageService.set(STORAGE_KEYS.FOODS, foodDatabase);
      return foodDatabase;
    }
    return foods;
  },

  getFoodById(id: string): FoodItem | undefined {
    return this.getFoods().find((f) => f.id === id);
  },

  searchFoods(query: string): FoodItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getFoods().filter((f) =>
      f.name.toLowerCase().includes(lowerQuery)
    );
  },

  // Add custom food
  addCustomFood(food: Omit<FoodItem, "id">): FoodItem {
    const newFood: FoodItem = {
      ...food,
      id: generateId(),
    };
    const foods = this.getFoods();
    foods.push(newFood);
    StorageService.set(STORAGE_KEYS.FOODS, foods);
    return newFood;
  },

  // ===== NUTRITION LOGS =====
  getNutritionLogs(): DailyNutrition[] {
    const logs = StorageService.get<DailyNutrition[]>(STORAGE_KEYS.NUTRITION);
    if (!logs) {
      const sampleLogs = generateSampleNutrition();
      StorageService.set(STORAGE_KEYS.NUTRITION, sampleLogs);
      return sampleLogs;
    }
    return logs;
  },

  getNutritionByDate(date: string): DailyNutrition | undefined {
    return this.getNutritionLogs().find((n) => n.date === date);
  },

  getTodayNutrition(): DailyNutrition {
    const today = getToday();
    let nutrition = this.getNutritionByDate(today);

    if (!nutrition) {
      nutrition = {
        date: today,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
      const logs = this.getNutritionLogs();
      logs.unshift(nutrition);
      StorageService.set(STORAGE_KEYS.NUTRITION, logs);
    }

    return nutrition;
  },

  getWeeklyCalories(): { date: string; calories: number }[] {
    const result: { date: string; calories: number }[] = [];
    const logs = this.getNutritionLogs();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const log = logs.find((l) => l.date === dateStr);
      result.push({
        date: dateStr,
        calories: log?.totalCalories || 0,
      });
    }

    return result;
  },

  // Add food to meal
  addFoodToMeal(
    date: string,
    mealType: MealType,
    foodId: string,
    servings: number
  ): DailyNutrition {
    const food = this.getFoodById(foodId);
    if (!food) throw new Error("Food not found");

    const logs = this.getNutritionLogs();
    let dayLog = logs.find((l) => l.date === date);

    if (!dayLog) {
      dayLog = {
        date,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
      logs.unshift(dayLog);
    }

    let meal = dayLog.meals.find((m) => m.type === mealType);
    if (!meal) {
      meal = {
        id: generateId(),
        type: mealType,
        date,
        entries: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
      dayLog.meals.push(meal);
    }

    const entry: MealEntry = {
      id: generateId(),
      foodId,
      foodName: food.name,
      servings,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings * 10) / 10,
      carbs: Math.round(food.carbs * servings * 10) / 10,
      fats: Math.round(food.fats * servings * 10) / 10,
    };

    meal.entries.push(entry);
    this.recalculateMealTotals(meal);
    this.recalculateDayTotals(dayLog);

    StorageService.set(STORAGE_KEYS.NUTRITION, logs);

    return dayLog;
  },

  // Remove food from meal
  removeFoodFromMeal(date: string, mealType: MealType, entryId: string): DailyNutrition | null {
    const logs = this.getNutritionLogs();
    const dayLog = logs.find((l) => l.date === date);
    if (!dayLog) return null;

    const meal = dayLog.meals.find((m) => m.type === mealType);
    if (!meal) return null;

    meal.entries = meal.entries.filter((e) => e.id !== entryId);
    this.recalculateMealTotals(meal);
    this.recalculateDayTotals(dayLog);

    StorageService.set(STORAGE_KEYS.NUTRITION, logs);

    return dayLog;
  },

  // Update serving size
  updateServings(
    date: string,
    mealType: MealType,
    entryId: string,
    servings: number
  ): DailyNutrition | null {
    const logs = this.getNutritionLogs();
    const dayLog = logs.find((l) => l.date === date);
    if (!dayLog) return null;

    const meal = dayLog.meals.find((m) => m.type === mealType);
    if (!meal) return null;

    const entry = meal.entries.find((e) => e.id === entryId);
    if (!entry) return null;

    const food = this.getFoodById(entry.foodId);
    if (!food) return null;

    entry.servings = servings;
    entry.calories = Math.round(food.calories * servings);
    entry.protein = Math.round(food.protein * servings * 10) / 10;
    entry.carbs = Math.round(food.carbs * servings * 10) / 10;
    entry.fats = Math.round(food.fats * servings * 10) / 10;

    this.recalculateMealTotals(meal);
    this.recalculateDayTotals(dayLog);

    StorageService.set(STORAGE_KEYS.NUTRITION, logs);

    return dayLog;
  },

  // Helper: recalculate meal totals
  recalculateMealTotals(meal: Meal): void {
    meal.totalCalories = meal.entries.reduce((sum, e) => sum + e.calories, 0);
    meal.totalProtein = meal.entries.reduce((sum, e) => sum + e.protein, 0);
    meal.totalCarbs = meal.entries.reduce((sum, e) => sum + e.carbs, 0);
    meal.totalFats = meal.entries.reduce((sum, e) => sum + e.fats, 0);
  },

  // Helper: recalculate day totals
  recalculateDayTotals(day: DailyNutrition): void {
    day.totalCalories = day.meals.reduce((sum, m) => sum + m.totalCalories, 0);
    day.totalProtein = day.meals.reduce((sum, m) => sum + m.totalProtein, 0);
    day.totalCarbs = day.meals.reduce((sum, m) => sum + m.totalCarbs, 0);
    day.totalFats = day.meals.reduce((sum, m) => sum + m.totalFats, 0);
  },

  // Quick add calories without searching for food
  quickAddCalories(
    date: string,
    mealType: MealType,
    calories: number,
    protein: number,
    carbs: number = 0,
    fats: number = 0
  ): DailyNutrition {
    // Create a temporary food item for quick entry
    const quickFood: FoodItem = {
      id: `quick-${Date.now()}`,
      name: "Quick Entry",
      calories,
      protein,
      carbs,
      fats,
      servingSize: 1,
      servingUnit: "serving",
    };

    // Add it as a custom food temporarily (or just add directly to meal)
    const logs = this.getNutritionLogs();
    let dayLog = logs.find((l) => l.date === date);

    if (!dayLog) {
      dayLog = {
        date,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
      logs.unshift(dayLog);
    }

    let meal = dayLog.meals.find((m) => m.type === mealType);
    if (!meal) {
      meal = {
        id: generateId(),
        type: mealType,
        date,
        entries: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
      dayLog.meals.push(meal);
    }

    const entry: MealEntry = {
      id: generateId(),
      foodId: quickFood.id,
      foodName: quickFood.name,
      servings: 1,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fats: Math.round(fats * 10) / 10,
    };

    meal.entries.push(entry);
    this.recalculateMealTotals(meal);
    this.recalculateDayTotals(dayLog);

    StorageService.set(STORAGE_KEYS.NUTRITION, logs);

    return dayLog;
  },
};

