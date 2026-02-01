/**
 * Vitalis AI | Health & Performance Hub
 * File: storage.service.ts
 * Description: LocalStorage abstraction layer for client-side data persistence.
 */

const isBrowser = typeof window !== "undefined";

export const StorageService = {
  get<T>(key: string): T | null {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove(key: string): void {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear(): void {
    if (!isBrowser) return;
    try {
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith("vitalis-")
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  isInitialized(): boolean {
    if (!isBrowser) return false;
    return localStorage.getItem("vitalis-initialized") === "true";
  },

  setInitialized(): void {
    if (!isBrowser) return;
    localStorage.setItem("vitalis-initialized", "true");
  },
};

export const STORAGE_KEYS = {
  USER: "vitalis-user",
  WORKOUTS: "vitalis-workouts",
  ROUTINES: "vitalis-routines",
  NUTRITION: "vitalis-nutrition",
  EXERCISES: "vitalis-exercises",
  FOODS: "vitalis-foods",
  STREAKS: "vitalis-streaks",
  ACTIVE_WORKOUT: "vitalis-active-workout",
} as const;
