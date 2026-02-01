/**
 * File: index.ts
 * Description: Core type definitions for the Vitalis application domain models.
 */

export interface User {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  goal: "muscle" | "fat_loss" | "maintenance";
  activityLevel: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

export type MuscleGroup =
  | "chest"
  | "upper_back"
  | "middle_back"
  | "lower_back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "cardio";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "other";

export type SetType = "normal" | "warmup" | "drop" | "failure";

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  type?: SetType;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  exercises: WorkoutExercise[];
  totalVolume: number;
  status: "planned" | "in_progress" | "completed";
  routineId?: string;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: string;
  }[];
  color: "violet" | "emerald" | "amber" | "rose";
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: string;
  type: MealType;
  date: string;
  entries: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface TimelineEntry {
  id: string;
  type: "workout" | "nutrition";
  date: string;
  title: string;
  subtitle: string;
  data: Workout | DailyNutrition;
}

export interface TimelineItem extends TimelineEntry {
  timestamp: number;
  isPerfectDay?: boolean;
  prsHit?: string[];
}

export type TimelineFilter = "all" | "workouts" | "nutrition";

export interface AIInsight {
  id: string;
  type: "tip" | "warning" | "achievement";
  message: string;
  context: string;
  createdAt: string;
}

export type MuscleStatus = "fresh" | "fatigued" | "recovering" | "target";

export interface BodyStatus {
  upperBody: MuscleStatus;
  core: MuscleStatus;
  lowerBody: MuscleStatus;
  cardio: MuscleStatus;
}

export interface AIContext {
  user: User;
  todayNutrition: DailyNutrition | null;
  todayWorkout: Workout | null;
  recentWorkouts: Workout[];
  weeklyCalories: number[];
  bodyStatus: BodyStatus;
}

export interface ScheduledItem {
  id: string;
  type: "meal" | "workout";
  title: string;
  time: string;
  status: "pending" | "done" | "skipped";
  linkedId?: string;
}

export interface StreakDay {
  date: string;
  activityLevel: 0 | 1 | 2 | 3;
  hasWorkout: boolean;
  hasNutrition: boolean;
}
