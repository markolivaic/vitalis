/**
 * File: types.ts
 * Description: Database-specific type definitions for API responses and Prisma models.
 */

export * from "./types/index";

export interface DbWorkout {
  id: string;
  userId: string;
  name: string;
  date: Date | string;
  duration: number | null;
  totalVolume: number;
  notes: string | null;
  exercises: unknown;
}

export interface DbNutritionLog {
  id: string;
  userId: string;
  date: Date | string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
}

export interface DbExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
}

export interface DbFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
}

export interface DbUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: Date | string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  goal: string;
  activityLevel: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
}
