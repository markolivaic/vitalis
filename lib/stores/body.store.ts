/**
 * Vitalis AI | Health & Performance Hub
 * File: body.store.ts
 * Description: Zustand store for managing body muscle status and fatigue calculations.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BodyStatus, MuscleStatus, Workout, MuscleGroup } from "@/lib/types";
import { WorkoutService } from "@/lib/services/workout.service";

interface BodyState {
  bodyStatus: BodyStatus;
  setBodyStatus: (status: BodyStatus) => void;
  updateMuscleStatus: (muscle: keyof BodyStatus, status: MuscleStatus) => void;
  calculateFatigueFromWorkout: (workout: Workout) => void;
  resetBody: () => void;
}

const defaultBodyStatus: BodyStatus = {
  upperBody: "fresh",
  core: "fresh",
  lowerBody: "fresh",
  cardio: "fresh",
};

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      bodyStatus: defaultBodyStatus,

      setBodyStatus: (status) => set({ bodyStatus: status }),

      updateMuscleStatus: (muscle, status) =>
        set((state) => ({
          bodyStatus: {
            ...state.bodyStatus,
            [muscle]: status,
          },
        })),

      resetBody: () => set({ bodyStatus: defaultBodyStatus }),

      calculateFatigueFromWorkout: (workout) => {
        console.log("Calculating fatigue for workout:", workout.name);

        const newStatus = { ...get().bodyStatus };
        let hasChanges = false;

        // Map muscle groups to body parts
        const muscleGroupToBodyPart: Record<MuscleGroup, keyof BodyStatus> = {
          // Upper Body
          chest: "upperBody",
          upper_back: "upperBody",
          middle_back: "upperBody",
          shoulders: "upperBody",
          biceps: "upperBody",
          triceps: "upperBody",

          // Core
          core: "core",
          lower_back: "core",

          // Lower Body
          quads: "lowerBody",
          hamstrings: "lowerBody",
          glutes: "lowerBody",
          calves: "lowerBody",

          // Cardio
          cardio: "cardio",
        };

        workout.exercises.forEach((exercise) => {
          console.log("Analyzing exercise:", exercise.exerciseName);

          // Fetch exercise data from exerciseId
          const exerciseData = WorkoutService.getExerciseById(exercise.exerciseId);

          if (!exerciseData) {
            console.warn("Exercise not found:", exercise.exerciseId);
            return;
          }

          // Map muscleGroup to body part
          const bodyPart = muscleGroupToBodyPart[exerciseData.muscleGroup];

          if (bodyPart) {
            newStatus[bodyPart] = "fatigued";
            hasChanges = true;
            console.log(`Muscle group "${exerciseData.muscleGroup}" mapped to "${bodyPart}"`);
          } else {
            console.warn("Unknown muscle group:", exerciseData.muscleGroup);
          }
        });

        if (hasChanges) {
          console.log("Updating body status:", newStatus);
          set({ bodyStatus: newStatus });
        } else {
          console.warn("No matching muscle groups found");
        }
      },
    }),
    {
      name: "vitalis-body-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
