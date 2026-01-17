import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export function getRelativeDateLabel(date: string): string {
  const today = getToday();
  const yesterday = getDaysAgo(1);

  if (date === today) {
    return "Today";
  } else if (date === yesterday) {
    return "Yesterday";
  } else {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
}

export function formatDateWithTime(date: string, time?: string): string {
  const d = time ? new Date(`${date}T${time}`) : new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(time && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number {
  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

export function calculateTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

export function calculateMacros(
  calories: number,
  goal: "muscle" | "fat_loss" | "maintenance"
): { protein: number; carbs: number; fats: number } {
  // grams per day
  switch (goal) {
    case "muscle":
      return {
        protein: Math.round((calories * 0.3) / 4),
        carbs: Math.round((calories * 0.45) / 4),
        fats: Math.round((calories * 0.25) / 9),
      };
    case "fat_loss":
      return {
        protein: Math.round((calories * 0.35) / 4),
        carbs: Math.round((calories * 0.35) / 4),
        fats: Math.round((calories * 0.3) / 9),
      };
    default:
      return {
        protein: Math.round((calories * 0.25) / 4),
        carbs: Math.round((calories * 0.5) / 4),
        fats: Math.round((calories * 0.25) / 9),
      };
  }
}

