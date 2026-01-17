import type { User } from "@/lib/types";
import { StorageService, STORAGE_KEYS } from "./storage.service";
import { defaultUser } from "@/lib/mock-data";
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/utils";

export const UserService = {
  // Get current user
  getUser(): User {
    const user = StorageService.get<User>(STORAGE_KEYS.USER);
    if (!user) {
      // Initialize with default user
      StorageService.set(STORAGE_KEYS.USER, defaultUser);
      return defaultUser;
    }
    return user;
  },

  // Update user profile
  updateUser(updates: Partial<User>): User {
    const currentUser = this.getUser();
    const updatedUser: User = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    // Recalculate targets if relevant fields changed
    if (
      updates.weight !== undefined ||
      updates.height !== undefined ||
      updates.age !== undefined ||
      updates.gender !== undefined ||
      updates.activityLevel !== undefined ||
      updates.goal !== undefined
    ) {
      const bmr = calculateBMR(
        updatedUser.weight,
        updatedUser.height,
        updatedUser.age,
        updatedUser.gender
      );
      const tdee = calculateTDEE(bmr, updatedUser.activityLevel);

      // Adjust calories based on goal
      let targetCalories = tdee;
      if (updatedUser.goal === "muscle") {
        targetCalories = Math.round(tdee * 1.1); // 10% surplus
      } else if (updatedUser.goal === "fat_loss") {
        targetCalories = Math.round(tdee * 0.8); // 20% deficit
      }

      const macros = calculateMacros(targetCalories, updatedUser.goal);

      updatedUser.calorieTarget = targetCalories;
      updatedUser.proteinTarget = macros.protein;
      updatedUser.carbsTarget = macros.carbs;
      updatedUser.fatsTarget = macros.fats;
    }

    StorageService.set(STORAGE_KEYS.USER, updatedUser);
    return updatedUser;
  },

  // Reset user to default
  resetUser(): User {
    StorageService.set(STORAGE_KEYS.USER, defaultUser);
    return defaultUser;
  },
};

