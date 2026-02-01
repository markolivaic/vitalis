/**
 * File: user.service.ts
 * Description: Service for managing user profile data and macro calculations.
 */

import type { User } from "@/lib/types";
import { StorageService, STORAGE_KEYS } from "./storage.service";
import { defaultUser } from "@/lib/mock-data";
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/utils";

export const UserService = {
  getUser(): User {
    const user = StorageService.get<User>(STORAGE_KEYS.USER);
    if (!user) {
      StorageService.set(STORAGE_KEYS.USER, defaultUser);
      return defaultUser;
    }
    return user;
  },

  updateUser(updates: Partial<User>): User {
    const currentUser = this.getUser();
    const updatedUser: User = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const shouldRecalculateTargets =
      updates.weight !== undefined ||
      updates.height !== undefined ||
      updates.age !== undefined ||
      updates.gender !== undefined ||
      updates.activityLevel !== undefined ||
      updates.goal !== undefined;

    if (shouldRecalculateTargets) {
      const bmr = calculateBMR(
        updatedUser.weight,
        updatedUser.height,
        updatedUser.age,
        updatedUser.gender
      );
      const tdee = calculateTDEE(bmr, updatedUser.activityLevel);

      let targetCalories = tdee;
      if (updatedUser.goal === "muscle") {
        targetCalories = Math.round(tdee * 1.1);
      } else if (updatedUser.goal === "fat_loss") {
        targetCalories = Math.round(tdee * 0.8);
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

  resetUser(): User {
    StorageService.set(STORAGE_KEYS.USER, defaultUser);
    return defaultUser;
  },
};
