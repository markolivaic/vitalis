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
        console.log("⚡ CALCULATING FATIGUE FOR WORKOUT:", workout.name);
        
        // Start with current status
        const newStatus = { ...get().bodyStatus };
        let hasChanges = false;

        // Keywords mapping
        const keywords = {
          upperBody: ["chest", "bench", "press", "push", "fly", "shoulder", "deltoid", "raise", "bicep", "tricep", "curl", "extension", "row", "pull", "lat", "chin", "dip"],
          lowerBody: ["leg", "squat", "deadlift", "lunge", "hinge", "calf", "glute", "hamstring", "quad", "press"],
          core: ["ab", "crunch", "plank", "sit", "core", "oblique"],
          cardio: ["run", "treadmill", "bike", "cycle", "elliptical", "rowing", "jump", "cardio"]
        };

        // Analyze exercises
        workout.exercises.forEach((exercise) => {
          const name = exercise.exerciseName.toLowerCase();
          console.log("Analyzing exercise:", name);

          if (keywords.upperBody.some(k => name.includes(k))) {
            newStatus.upperBody = "fatigued";
            hasChanges = true;
            console.log("-> Upper Body Hit");
          }
          if (keywords.lowerBody.some(k => name.includes(k))) {
            newStatus.lowerBody = "fatigued";
            hasChanges = true;
            console.log("-> Lower Body Hit");
          }
          if (keywords.core.some(k => name.includes(k))) {
            newStatus.core = "fatigued";
            hasChanges = true;
            console.log("-> Core Hit");
          }
          if (keywords.cardio.some(k => name.includes(k))) {
            newStatus.cardio = "fatigued";
            hasChanges = true;
            console.log("-> Cardio Hit");
          }
        });

        if (hasChanges) {
          console.log("✅ UPDATING BODY STATUS:", newStatus);
          set({ bodyStatus: newStatus });
        } else {
          console.warn("⚠️ NO MATCHING MUSCLES FOUND. Check keywords.");
        }
      },
    }),
    {
      name: "vitalis-body-storage", // Unique name for LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
