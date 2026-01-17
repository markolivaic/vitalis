// ===== USER TYPES =====
export interface User {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  height: number; // cm
  weight: number; // kg
  goal: "muscle" | "fat_loss" | "maintenance";
  activityLevel: number; // 1.2 - 1.9 multiplier
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  createdAt: string;
  updatedAt: string;
}

// ===== WORKOUT TYPES =====
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
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
  weight: number; // kg
  reps: number;
  completed: boolean;
  type?: SetType; // Default: 'normal'
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
  duration?: number; // seconds
  exercises: WorkoutExercise[];
  totalVolume: number; // kg
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
    targetReps: string; // e.g., "8-12"
  }[];
  color: "violet" | "emerald" | "amber" | "rose";
}

// ===== NUTRITION TYPES =====
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

// ===== HISTORY/TIMELINE TYPES =====
export interface TimelineEntry {
  id: string;
  type: "workout" | "nutrition";
  date: string;
  title: string;
  subtitle: string;
  data: Workout | DailyNutrition;
}

export interface TimelineItem extends TimelineEntry {
  timestamp: number; // For sorting
  isPerfectDay?: boolean; // If this day was perfect
  prsHit?: string[]; // For workouts: list of PRs achieved
}

export type TimelineFilter = "all" | "workouts" | "nutrition";

// ===== AI TYPES =====
export interface AIInsight {
  id: string;
  type: "tip" | "warning" | "achievement";
  message: string;
  context: string;
  createdAt: string;
}

// ===== BODY STATUS TYPES =====
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

// ===== SCHEDULED ITEMS =====
export interface ScheduledItem {
  id: string;
  type: "meal" | "workout";
  title: string;
  time: string;
  status: "pending" | "done" | "skipped";
  linkedId?: string;
}

// ===== STREAK DATA =====
export interface StreakDay {
  date: string;
  activityLevel: 0 | 1 | 2 | 3; // 0 = none, 1 = low, 2 = medium, 3 = high
  hasWorkout: boolean;
  hasNutrition: boolean;
}

