/**
 * File: index.ts
 * Description: Mock data generators and default values for development and seeding.
 */

import type {
  User,
  Exercise,
  Workout,
  WorkoutRoutine,
  FoodItem,
  DailyNutrition,
  Meal,
  StreakDay,
  ScheduledItem,
} from "@/lib/types";
import { generateId, getToday, getDaysAgo } from "@/lib/utils";

export const defaultUser: User = {
  id: "user-1",
  name: "Alex",
  age: 28,
  gender: "male",
  height: 178,
  weight: 75,
  goal: "muscle",
  activityLevel: 1.55,
  calorieTarget: 2500,
  proteinTarget: 188,
  carbsTarget: 281,
  fatsTarget: 69,
  createdAt: getDaysAgo(30),
  updatedAt: getToday(),
};

export const exerciseDatabase: Exercise[] = [
  // ===== CHEST (10 exercises) =====
  { id: "ex-1", name: "Flat Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { id: "ex-2", name: "Incline Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { id: "ex-3", name: "Decline Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { id: "ex-4", name: "Dumbbell Chest Press", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "ex-5", name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "ex-6", name: "Dumbbell Flyes", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "ex-7", name: "Cable Crossover", muscleGroup: "chest", equipment: "cable" },
  { id: "ex-8", name: "Pec Deck Machine", muscleGroup: "chest", equipment: "machine" },
  { id: "ex-9", name: "Push-ups", muscleGroup: "chest", equipment: "bodyweight" },
  { id: "ex-10", name: "Chest Dips", muscleGroup: "chest", equipment: "bodyweight" },

  // ===== UPPER BACK (9 exercises) =====
  { id: "ex-11", name: "Face Pulls", muscleGroup: "upper_back", equipment: "cable" },
  { id: "ex-12", name: "Rear Delt Flyes", muscleGroup: "upper_back", equipment: "dumbbell" },
  { id: "ex-13", name: "Barbell Shrugs", muscleGroup: "upper_back", equipment: "barbell" },
  { id: "ex-14", name: "Dumbbell Shrugs", muscleGroup: "upper_back", equipment: "dumbbell" },
  { id: "ex-15", name: "Cable Shrugs", muscleGroup: "upper_back", equipment: "cable" },
  { id: "ex-16", name: "Reverse Pec Deck", muscleGroup: "upper_back", equipment: "machine" },
  { id: "ex-17", name: "High Rope Face Pull", muscleGroup: "upper_back", equipment: "cable" },
  { id: "ex-18", name: "Band Pull-Aparts", muscleGroup: "upper_back", equipment: "other" },
  { id: "ex-19", name: "Prone Y-Raises", muscleGroup: "upper_back", equipment: "dumbbell" },

  // ===== MIDDLE BACK (12 exercises) =====
  { id: "ex-20", name: "Lat Pulldown", muscleGroup: "middle_back", equipment: "cable" },
  { id: "ex-21", name: "Wide Grip Lat Pulldown", muscleGroup: "middle_back", equipment: "cable" },
  { id: "ex-22", name: "Close Grip Lat Pulldown", muscleGroup: "middle_back", equipment: "cable" },
  { id: "ex-23", name: "Seated Cable Row", muscleGroup: "middle_back", equipment: "cable" },
  { id: "ex-24", name: "Single-Arm Cable Row", muscleGroup: "middle_back", equipment: "cable" },
  { id: "ex-25", name: "T-Bar Row", muscleGroup: "middle_back", equipment: "barbell" },
  { id: "ex-26", name: "Bent Over Barbell Row", muscleGroup: "middle_back", equipment: "barbell" },
  { id: "ex-27", name: "Dumbbell Row", muscleGroup: "middle_back", equipment: "dumbbell" },
  { id: "ex-28", name: "Chest Supported Row", muscleGroup: "middle_back", equipment: "dumbbell" },
  { id: "ex-29", name: "Pull-ups", muscleGroup: "middle_back", equipment: "bodyweight" },
  { id: "ex-30", name: "Chin-ups", muscleGroup: "middle_back", equipment: "bodyweight" },
  { id: "ex-31", name: "Straight Arm Pulldown", muscleGroup: "middle_back", equipment: "cable" },

  // ===== LOWER BACK (8 exercises) =====
  { id: "ex-32", name: "Conventional Deadlift", muscleGroup: "lower_back", equipment: "barbell" },
  { id: "ex-33", name: "Sumo Deadlift", muscleGroup: "lower_back", equipment: "barbell" },
  { id: "ex-34", name: "Deficit Deadlift", muscleGroup: "lower_back", equipment: "barbell" },
  { id: "ex-35", name: "Trap Bar Deadlift", muscleGroup: "lower_back", equipment: "barbell" },
  { id: "ex-36", name: "Good Mornings", muscleGroup: "lower_back", equipment: "barbell" },
  { id: "ex-37", name: "Back Extensions", muscleGroup: "lower_back", equipment: "bodyweight" },
  { id: "ex-38", name: "Hyperextensions", muscleGroup: "lower_back", equipment: "machine" },
  { id: "ex-39", name: "Reverse Hyperextensions", muscleGroup: "lower_back", equipment: "machine" },

  // ===== SHOULDERS (11 exercises) =====
  { id: "ex-40", name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "ex-41", name: "Seated Dumbbell Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "ex-42", name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "ex-43", name: "Lateral Raises", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "ex-44", name: "Cable Lateral Raises", muscleGroup: "shoulders", equipment: "cable" },
  { id: "ex-45", name: "Front Raises", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "ex-46", name: "Upright Row", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "ex-47", name: "Machine Shoulder Press", muscleGroup: "shoulders", equipment: "machine" },
  { id: "ex-48", name: "Behind Neck Press", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "ex-49", name: "Lu Raises", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "ex-50", name: "Landmine Press", muscleGroup: "shoulders", equipment: "barbell" },

  // ===== BICEPS (9 exercises) =====
  { id: "ex-51", name: "Barbell Curl", muscleGroup: "biceps", equipment: "barbell" },
  { id: "ex-52", name: "EZ Bar Curl", muscleGroup: "biceps", equipment: "barbell" },
  { id: "ex-53", name: "Preacher Curl", muscleGroup: "biceps", equipment: "barbell" },
  { id: "ex-54", name: "Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "ex-55", name: "Hammer Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "ex-56", name: "Incline Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "ex-57", name: "Cable Curl", muscleGroup: "biceps", equipment: "cable" },
  { id: "ex-58", name: "Concentration Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "ex-59", name: "Spider Curl", muscleGroup: "biceps", equipment: "dumbbell" },

  // ===== TRICEPS (9 exercises) =====
  { id: "ex-60", name: "Tricep Pushdown", muscleGroup: "triceps", equipment: "cable" },
  { id: "ex-61", name: "Rope Pushdown", muscleGroup: "triceps", equipment: "cable" },
  { id: "ex-62", name: "Overhead Tricep Extension", muscleGroup: "triceps", equipment: "cable" },
  { id: "ex-63", name: "Skull Crushers", muscleGroup: "triceps", equipment: "barbell" },
  { id: "ex-64", name: "Close Grip Bench Press", muscleGroup: "triceps", equipment: "barbell" },
  { id: "ex-65", name: "Tricep Dips", muscleGroup: "triceps", equipment: "bodyweight" },
  { id: "ex-66", name: "Diamond Push-ups", muscleGroup: "triceps", equipment: "bodyweight" },
  { id: "ex-67", name: "Cable Kickbacks", muscleGroup: "triceps", equipment: "cable" },
  { id: "ex-68", name: "Single Arm Pushdown", muscleGroup: "triceps", equipment: "cable" },

  // ===== QUADS (9 exercises) =====
  { id: "ex-69", name: "Back Squat", muscleGroup: "quads", equipment: "barbell" },
  { id: "ex-70", name: "Front Squat", muscleGroup: "quads", equipment: "barbell" },
  { id: "ex-71", name: "Hack Squat", muscleGroup: "quads", equipment: "machine" },
  { id: "ex-72", name: "Leg Press", muscleGroup: "quads", equipment: "machine" },
  { id: "ex-73", name: "Leg Extension", muscleGroup: "quads", equipment: "machine" },
  { id: "ex-74", name: "Goblet Squat", muscleGroup: "quads", equipment: "dumbbell" },
  { id: "ex-75", name: "Bulgarian Split Squat", muscleGroup: "quads", equipment: "dumbbell" },
  { id: "ex-76", name: "Walking Lunges", muscleGroup: "quads", equipment: "dumbbell" },
  { id: "ex-77", name: "Sissy Squat", muscleGroup: "quads", equipment: "bodyweight" },

  // ===== HAMSTRINGS (7 exercises) =====
  { id: "ex-78", name: "Lying Leg Curl", muscleGroup: "hamstrings", equipment: "machine" },
  { id: "ex-79", name: "Seated Leg Curl", muscleGroup: "hamstrings", equipment: "machine" },
  { id: "ex-80", name: "Nordic Curl", muscleGroup: "hamstrings", equipment: "bodyweight" },
  { id: "ex-81", name: "Romanian Deadlift", muscleGroup: "hamstrings", equipment: "barbell" },
  { id: "ex-82", name: "Stiff Leg Deadlift", muscleGroup: "hamstrings", equipment: "barbell" },
  { id: "ex-83", name: "Single Leg Romanian Deadlift", muscleGroup: "hamstrings", equipment: "dumbbell" },
  { id: "ex-84", name: "Glute Ham Raise", muscleGroup: "hamstrings", equipment: "machine" },

  // ===== GLUTES (8 exercises) =====
  { id: "ex-85", name: "Hip Thrust", muscleGroup: "glutes", equipment: "barbell" },
  { id: "ex-86", name: "Barbell Hip Thrust", muscleGroup: "glutes", equipment: "barbell" },
  { id: "ex-87", name: "Single Leg Hip Thrust", muscleGroup: "glutes", equipment: "bodyweight" },
  { id: "ex-88", name: "Glute Kickback Machine", muscleGroup: "glutes", equipment: "machine" },
  { id: "ex-89", name: "Cable Glute Kickback", muscleGroup: "glutes", equipment: "cable" },
  { id: "ex-90", name: "Glute Bridge", muscleGroup: "glutes", equipment: "bodyweight" },
  { id: "ex-91", name: "Sumo Squat", muscleGroup: "glutes", equipment: "dumbbell" },
  { id: "ex-92", name: "Step-ups", muscleGroup: "glutes", equipment: "dumbbell" },

  // ===== CALVES (6 exercises) =====
  { id: "ex-93", name: "Standing Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { id: "ex-94", name: "Seated Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { id: "ex-95", name: "Donkey Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { id: "ex-96", name: "Single Leg Calf Raise", muscleGroup: "calves", equipment: "bodyweight" },
  { id: "ex-97", name: "Leg Press Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { id: "ex-98", name: "Smith Machine Calf Raise", muscleGroup: "calves", equipment: "machine" },

  // ===== CORE (10 exercises) =====
  { id: "ex-99", name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ex-100", name: "Side Plank", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ex-101", name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ex-102", name: "Cable Crunch", muscleGroup: "core", equipment: "cable" },
  { id: "ex-103", name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "other" },
  { id: "ex-104", name: "Bicycle Crunch", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ex-105", name: "Dead Bug", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ex-106", name: "Pallof Press", muscleGroup: "core", equipment: "cable" },
  { id: "ex-107", name: "Woodchoppers", muscleGroup: "core", equipment: "cable" },
  { id: "ex-108", name: "Decline Sit-ups", muscleGroup: "core", equipment: "bodyweight" },

  // ===== CARDIO (6 exercises) =====
  { id: "ex-109", name: "Treadmill Running", muscleGroup: "cardio", equipment: "machine" },
  { id: "ex-110", name: "Stationary Bike", muscleGroup: "cardio", equipment: "machine" },
  { id: "ex-111", name: "Elliptical", muscleGroup: "cardio", equipment: "machine" },
  { id: "ex-112", name: "Rowing Machine", muscleGroup: "cardio", equipment: "machine" },
  { id: "ex-113", name: "Jump Rope", muscleGroup: "cardio", equipment: "other" },
  { id: "ex-114", name: "Stair Climber", muscleGroup: "cardio", equipment: "machine" },
];

export const defaultRoutines: WorkoutRoutine[] = [
  {
    id: "routine-push",
    name: "Push Day",
    color: "violet",
    exercises: [
      { exerciseId: "ex-1", exerciseName: "Flat Bench Press", targetSets: 4, targetReps: "6-8" },
      { exerciseId: "ex-5", exerciseName: "Incline Dumbbell Press", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex-40", exerciseName: "Overhead Press", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex-43", exerciseName: "Lateral Raises", targetSets: 3, targetReps: "12-15" },
      { exerciseId: "ex-60", exerciseName: "Tricep Pushdown", targetSets: 3, targetReps: "10-12" },
    ],
  },
  {
    id: "routine-pull",
    name: "Pull Day",
    color: "emerald",
    exercises: [
      { exerciseId: "ex-32", exerciseName: "Conventional Deadlift", targetSets: 4, targetReps: "5" },
      { exerciseId: "ex-26", exerciseName: "Bent Over Barbell Row", targetSets: 4, targetReps: "6-8" },
      { exerciseId: "ex-20", exerciseName: "Lat Pulldown", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex-11", exerciseName: "Face Pulls", targetSets: 3, targetReps: "15-20" },
      { exerciseId: "ex-51", exerciseName: "Barbell Curl", targetSets: 3, targetReps: "10-12" },
    ],
  },
  {
    id: "routine-legs",
    name: "Leg Day",
    color: "amber",
    exercises: [
      { exerciseId: "ex-69", exerciseName: "Back Squat", targetSets: 4, targetReps: "6-8" },
      { exerciseId: "ex-81", exerciseName: "Romanian Deadlift", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex-72", exerciseName: "Leg Press", targetSets: 3, targetReps: "10-12" },
      { exerciseId: "ex-78", exerciseName: "Lying Leg Curl", targetSets: 3, targetReps: "10-12" },
      { exerciseId: "ex-93", exerciseName: "Standing Calf Raise", targetSets: 4, targetReps: "12-15" },
    ],
  },
];

export const generateSampleWorkouts = (): Workout[] => {
  const workouts: Workout[] = [];

  workouts.push({
    id: "workout-1",
    name: "Push Day",
    date: getDaysAgo(2),
    startTime: "17:00",
    endTime: "18:15",
    duration: 4500,
    status: "completed",
    routineId: "routine-push",
    totalVolume: 8560,
    exercises: [
      {
        id: "we-1",
        exerciseId: "ex-1",
        exerciseName: "Flat Bench Press",
        sets: [
          { id: "s1", setNumber: 1, weight: 80, reps: 8, completed: true, previousWeight: 77.5, previousReps: 8 },
          { id: "s2", setNumber: 2, weight: 80, reps: 7, completed: true, previousWeight: 77.5, previousReps: 7 },
          { id: "s3", setNumber: 3, weight: 80, reps: 6, completed: true, previousWeight: 77.5, previousReps: 6 },
          { id: "s4", setNumber: 4, weight: 75, reps: 8, completed: true, previousWeight: 75, previousReps: 7 },
        ],
      },
      {
        id: "we-2",
        exerciseId: "ex-5",
        exerciseName: "Incline Dumbbell Press",
        sets: [
          { id: "s5", setNumber: 1, weight: 30, reps: 10, completed: true },
          { id: "s6", setNumber: 2, weight: 30, reps: 9, completed: true },
          { id: "s7", setNumber: 3, weight: 28, reps: 10, completed: true },
        ],
      },
      {
        id: "we-3",
        exerciseId: "ex-40",
        exerciseName: "Overhead Press",
        sets: [
          { id: "s8", setNumber: 1, weight: 50, reps: 8, completed: true },
          { id: "s9", setNumber: 2, weight: 50, reps: 7, completed: true },
          { id: "s10", setNumber: 3, weight: 47.5, reps: 8, completed: true },
        ],
      },
    ],
  });

  workouts.push({
    id: "workout-2",
    name: "Pull Day",
    date: getDaysAgo(4),
    startTime: "18:00",
    endTime: "19:20",
    duration: 4800,
    status: "completed",
    routineId: "routine-pull",
    totalVolume: 9240,
    exercises: [
      {
        id: "we-4",
        exerciseId: "ex-32",
        exerciseName: "Conventional Deadlift",
        sets: [
          { id: "s11", setNumber: 1, weight: 120, reps: 5, completed: true },
          { id: "s12", setNumber: 2, weight: 120, reps: 5, completed: true },
          { id: "s13", setNumber: 3, weight: 120, reps: 5, completed: true },
          { id: "s14", setNumber: 4, weight: 120, reps: 4, completed: true },
        ],
      },
      {
        id: "we-5",
        exerciseId: "ex-26",
        exerciseName: "Bent Over Barbell Row",
        sets: [
          { id: "s15", setNumber: 1, weight: 70, reps: 8, completed: true },
          { id: "s16", setNumber: 2, weight: 70, reps: 8, completed: true },
          { id: "s17", setNumber: 3, weight: 70, reps: 7, completed: true },
        ],
      },
    ],
  });

  workouts.push({
    id: "workout-3",
    name: "Leg Day",
    date: getDaysAgo(5),
    startTime: "16:30",
    endTime: "17:50",
    duration: 4800,
    status: "completed",
    routineId: "routine-legs",
    totalVolume: 12450,
    exercises: [
      {
        id: "we-6",
        exerciseId: "ex-69",
        exerciseName: "Back Squat",
        sets: [
          { id: "s18", setNumber: 1, weight: 100, reps: 8, completed: true },
          { id: "s19", setNumber: 2, weight: 100, reps: 7, completed: true },
          { id: "s20", setNumber: 3, weight: 100, reps: 6, completed: true },
          { id: "s21", setNumber: 4, weight: 95, reps: 8, completed: true },
        ],
      },
    ],
  });

  return workouts;
};

export const foodDatabase: FoodItem[] = [
  { id: "food-1", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: 100, servingUnit: "g" },
  { id: "food-2", name: "Salmon Fillet", calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: 100, servingUnit: "g" },
  { id: "food-3", name: "Eggs (2 large)", calories: 156, protein: 13, carbs: 1, fats: 11, servingSize: 2, servingUnit: "eggs" },
  { id: "food-4", name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fats: 0.7, servingSize: 170, servingUnit: "g" },
  { id: "food-5", name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fats: 1.5, servingSize: 1, servingUnit: "scoop" },
  { id: "food-6", name: "White Rice", calories: 206, protein: 4, carbs: 45, fats: 0.4, servingSize: 158, servingUnit: "g" },
  { id: "food-7", name: "Oatmeal", calories: 158, protein: 6, carbs: 27, fats: 3, servingSize: 40, servingUnit: "g" },
  { id: "food-8", name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0.4, servingSize: 1, servingUnit: "medium" },
  { id: "food-9", name: "Sweet Potato", calories: 103, protein: 2, carbs: 24, fats: 0, servingSize: 114, servingUnit: "g" },
  { id: "food-10", name: "Whole Wheat Bread", calories: 81, protein: 4, carbs: 14, fats: 1, servingSize: 1, servingUnit: "slice" },
  { id: "food-11", name: "Almonds", calories: 164, protein: 6, carbs: 6, fats: 14, servingSize: 28, servingUnit: "g" },
  { id: "food-12", name: "Avocado", calories: 234, protein: 3, carbs: 12, fats: 21, servingSize: 0.5, servingUnit: "avocado" },
  { id: "food-13", name: "Olive Oil", calories: 119, protein: 0, carbs: 0, fats: 14, servingSize: 1, servingUnit: "tbsp" },
  { id: "food-14", name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fats: 16, servingSize: 2, servingUnit: "tbsp" },
  { id: "food-15", name: "Broccoli", calories: 55, protein: 4, carbs: 11, fats: 0.5, servingSize: 156, servingUnit: "g" },
  { id: "food-16", name: "Spinach", calories: 7, protein: 1, carbs: 1, fats: 0, servingSize: 30, servingUnit: "g" },
  { id: "food-17", name: "Mixed Salad", calories: 20, protein: 1, carbs: 4, fats: 0, servingSize: 100, servingUnit: "g" },
];

export const generateSampleNutrition = (): DailyNutrition[] => {
  const nutrition: DailyNutrition[] = [];

  const todayMeals: Meal[] = [
    {
      id: "meal-1",
      type: "breakfast",
      date: getToday(),
      entries: [
        { id: "me-1", foodId: "food-7", foodName: "Oatmeal", servings: 1, calories: 158, protein: 6, carbs: 27, fats: 3 },
        { id: "me-2", foodId: "food-8", foodName: "Banana", servings: 1, calories: 105, protein: 1, carbs: 27, fats: 0.4 },
        { id: "me-3", foodId: "food-5", foodName: "Whey Protein Shake", servings: 1, calories: 120, protein: 24, carbs: 3, fats: 1.5 },
      ],
      totalCalories: 383,
      totalProtein: 31,
      totalCarbs: 57,
      totalFats: 4.9,
    },
    {
      id: "meal-2",
      type: "lunch",
      date: getToday(),
      entries: [
        { id: "me-4", foodId: "food-1", foodName: "Chicken Breast", servings: 1.5, calories: 248, protein: 46.5, carbs: 0, fats: 5.4 },
        { id: "me-5", foodId: "food-6", foodName: "White Rice", servings: 1, calories: 206, protein: 4, carbs: 45, fats: 0.4 },
        { id: "me-6", foodId: "food-15", foodName: "Broccoli", servings: 1, calories: 55, protein: 4, carbs: 11, fats: 0.5 },
      ],
      totalCalories: 509,
      totalProtein: 54.5,
      totalCarbs: 56,
      totalFats: 6.3,
    },
  ];

  nutrition.push({
    date: getToday(),
    meals: todayMeals,
    totalCalories: 892,
    totalProtein: 85.5,
    totalCarbs: 113,
    totalFats: 11.2,
  });

  const yesterdayMeals: Meal[] = [
    {
      id: "meal-3",
      type: "breakfast",
      date: getDaysAgo(1),
      entries: [
        { id: "me-7", foodId: "food-3", foodName: "Eggs (2 large)", servings: 1, calories: 156, protein: 13, carbs: 1, fats: 11 },
        { id: "me-8", foodId: "food-10", foodName: "Whole Wheat Bread", servings: 2, calories: 162, protein: 8, carbs: 28, fats: 2 },
        { id: "me-9", foodId: "food-12", foodName: "Avocado", servings: 0.5, calories: 117, protein: 1.5, carbs: 6, fats: 10.5 },
      ],
      totalCalories: 435,
      totalProtein: 22.5,
      totalCarbs: 35,
      totalFats: 23.5,
    },
    {
      id: "meal-4",
      type: "lunch",
      date: getDaysAgo(1),
      entries: [
        { id: "me-10", foodId: "food-2", foodName: "Salmon Fillet", servings: 1.5, calories: 312, protein: 30, carbs: 0, fats: 19.5 },
        { id: "me-11", foodId: "food-9", foodName: "Sweet Potato", servings: 1.5, calories: 155, protein: 3, carbs: 36, fats: 0 },
        { id: "me-12", foodId: "food-17", foodName: "Mixed Salad", servings: 1, calories: 20, protein: 1, carbs: 4, fats: 0 },
      ],
      totalCalories: 487,
      totalProtein: 34,
      totalCarbs: 40,
      totalFats: 19.5,
    },
    {
      id: "meal-5",
      type: "dinner",
      date: getDaysAgo(1),
      entries: [
        { id: "me-13", foodId: "food-1", foodName: "Chicken Breast", servings: 2, calories: 330, protein: 62, carbs: 0, fats: 7.2 },
        { id: "me-14", foodId: "food-6", foodName: "White Rice", servings: 1.5, calories: 309, protein: 6, carbs: 67.5, fats: 0.6 },
        { id: "me-15", foodId: "food-15", foodName: "Broccoli", servings: 1, calories: 55, protein: 4, carbs: 11, fats: 0.5 },
      ],
      totalCalories: 694,
      totalProtein: 72,
      totalCarbs: 78.5,
      totalFats: 8.3,
    },
    {
      id: "meal-6",
      type: "snack",
      date: getDaysAgo(1),
      entries: [
        { id: "me-16", foodId: "food-4", foodName: "Greek Yogurt", servings: 1, calories: 100, protein: 17, carbs: 6, fats: 0.7 },
        { id: "me-17", foodId: "food-11", foodName: "Almonds", servings: 1, calories: 164, protein: 6, carbs: 6, fats: 14 },
      ],
      totalCalories: 264,
      totalProtein: 23,
      totalCarbs: 12,
      totalFats: 14.7,
    },
  ];

  nutrition.push({
    date: getDaysAgo(1),
    meals: yesterdayMeals,
    totalCalories: 1880,
    totalProtein: 151.5,
    totalCarbs: 165.5,
    totalFats: 66,
  });

  for (let i = 2; i <= 6; i++) {
    const variation = Math.random() * 600 - 300;
    nutrition.push({
      date: getDaysAgo(i),
      meals: [],
      totalCalories: Math.round(2200 + variation),
      totalProtein: Math.round(150 + variation / 10),
      totalCarbs: Math.round(200 + variation / 8),
      totalFats: Math.round(70 + variation / 15),
    });
  }

  return nutrition;
};

export const generateStreakData = (): StreakDay[] => {
  const streaks: StreakDay[] = [];

  for (let i = 13; i >= 0; i--) {
    const hasWorkout = Math.random() > 0.4;
    const hasNutrition = Math.random() > 0.2;

    let activityLevel: 0 | 1 | 2 | 3 = 0;
    if (hasWorkout && hasNutrition) activityLevel = 3;
    else if (hasWorkout || hasNutrition) activityLevel = Math.random() > 0.5 ? 2 : 1;

    streaks.push({
      date: getDaysAgo(i),
      activityLevel,
      hasWorkout,
      hasNutrition,
    });
  }

  return streaks;
};

export const generateScheduledItems = (): ScheduledItem[] => {
  return [
    { id: "sched-1", type: "meal", title: "Breakfast", time: "08:00", status: "done" },
    { id: "sched-2", type: "meal", title: "Lunch", time: "12:30", status: "done" },
    { id: "sched-3", type: "workout", title: "Push Workout", time: "17:00", status: "pending" },
    { id: "sched-4", type: "meal", title: "Dinner", time: "19:30", status: "pending" },
  ];
};
