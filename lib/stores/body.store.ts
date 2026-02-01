/**
 * File: body.store.ts
 * Description: Zustand store for managing body muscle status and fatigue calculations.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BodyStatus, MuscleStatus, Workout } from "@/lib/types";

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

        const keywords = {
          upperBody: [
            // Chest
            "chest", "bench", "fly", "pec", "crossover",
            // Upper Back (traps, rear delts)
            "shrug", "face pull", "rear delt", "trap", "y-raise", "pull-apart",
            // Middle Back (lats, rhomboids)
            "row", "pull", "lat", "chin", "pulldown",
            // Shoulders
            "shoulder", "deltoid", "raise", "overhead", "arnold", "upright", "landmine",
            // Biceps
            "bicep", "curl", "preacher", "hammer", "spider",
            // Triceps
            "tricep", "pushdown", "skull", "kickback", "dip", "diamond"
          ],
          lowerBody: [
            // Quads
            "squat", "leg press", "leg extension", "lunge", "split squat", "hack", "goblet", "sissy",
            // Hamstrings
            "leg curl", "romanian", "stiff leg", "nordic", "glute ham",
            // Glutes
            "glute", "hip thrust", "bridge", "step-up", "sumo",
            // Calves
            "calf", "calves",
            // Lower Back
            "deadlift", "good morning", "back extension", "hyperextension"
          ],
          core: [
            "ab", "crunch", "plank", "sit-up", "core", "oblique",
            "pallof", "dead bug", "woodchop", "rollout", "leg raise"
          ],
          cardio: [
            "run", "treadmill", "bike", "cycle", "elliptical",
            "rowing", "jump", "cardio", "stair", "rope"
          ]
        };

        workout.exercises.forEach((exercise) => {
          const name = exercise.exerciseName.toLowerCase();
          console.log("Analyzing exercise:", name);

          if (keywords.upperBody.some(k => name.includes(k))) {
            newStatus.upperBody = "fatigued";
            hasChanges = true;
            console.log("Upper body targeted");
          }
          if (keywords.lowerBody.some(k => name.includes(k))) {
            newStatus.lowerBody = "fatigued";
            hasChanges = true;
            console.log("Lower body targeted");
          }
          if (keywords.core.some(k => name.includes(k))) {
            newStatus.core = "fatigued";
            hasChanges = true;
            console.log("Core targeted");
          }
          if (keywords.cardio.some(k => name.includes(k))) {
            newStatus.cardio = "fatigued";
            hasChanges = true;
            console.log("Cardio targeted");
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
