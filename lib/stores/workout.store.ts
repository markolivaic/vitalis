/**
 * File: workout.store.ts
 * Description: Zustand store for managing active workout session state.
 */

import { create } from "zustand";
import { WorkoutService } from "@/lib/services/workout.service";
import { useBodyStore } from "./body.store";
import type { Workout, SetType } from "@/lib/types";

type WorkoutStatus = "idle" | "active" | "paused";

interface WorkoutState {
  status: WorkoutStatus;
  elapsedSeconds: number;
  activeRoutine: Workout | null;
  completedSets: Record<string, boolean>;
  startTime: number | null;
  startWorkout: (routineId?: string) => void;
  logSet: (exerciseId: string, setId: string, weight: number, reps: number) => void;
  updateSetCompleted: (exerciseId: string, setId: string, isCompleted: boolean) => void;
  updateSetType: (exerciseId: string, setId: string, type: SetType) => void;
  updateExerciseNote: (exerciseId: string, note: string) => void;
  updateWorkoutDetails: (name: string, notes: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: (name?: string, notes?: string) => Promise<void>;
  cancelWorkout: () => void;
  updateElapsedTime: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  status: "idle",
  elapsedSeconds: 0,
  activeRoutine: null,
  completedSets: {},
  startTime: null,

  startWorkout: (routineId) => {
    const workout = WorkoutService.startWorkout(routineId);
    const startTime = new Date(`${workout.date}T${workout.startTime}`).getTime();

    set({
      status: "active",
      activeRoutine: workout,
      startTime,
      elapsedSeconds: 0,
      completedSets: {},
    });
  },

  logSet: (exerciseId, setId, weight, reps) => {
    const state = get();
    if (!state.activeRoutine) return;

    const updated = WorkoutService.updateSet(exerciseId, setId, { weight, reps });
    if (updated) {
      set({ activeRoutine: updated });
    }
  },

  updateSetCompleted: (exerciseId, setId, isCompleted) => {
    const state = get();
    if (!state.activeRoutine) return;

    const updated = WorkoutService.updateSet(exerciseId, setId, { completed: isCompleted });
    if (updated) {
      const setKey = `${exerciseId}-${setId}`;
      set({
        activeRoutine: updated,
        completedSets: {
          ...state.completedSets,
          [setKey]: isCompleted,
        },
      });
    }
  },

  updateSetType: (exerciseId, setId, type) => {
    const state = get();
    if (!state.activeRoutine) return;

    const updated = WorkoutService.updateSet(exerciseId, setId, { type });
    if (updated) {
      set({ activeRoutine: updated });
    }
  },

  updateExerciseNote: (exerciseId, note) => {
    const state = get();
    if (!state.activeRoutine) return;

    const updated = WorkoutService.updateExerciseNote(exerciseId, note);
    if (updated) {
      set({ activeRoutine: updated });
    }
  },

  updateWorkoutDetails: (name, notes) => {
    const state = get();
    if (!state.activeRoutine) return;

    let updated = WorkoutService.updateWorkoutName(name);
    if (updated) {
      updated = WorkoutService.updateWorkoutNotes(notes);
      if (updated) {
        set({ activeRoutine: updated });
      }
    }
  },

  pauseWorkout: () => {
    set({ status: "paused" });
  },

  resumeWorkout: () => {
    const state = get();
    if (state.activeRoutine && state.startTime) {
      const now = Date.now();
      const pausedDuration = now - (state.startTime + state.elapsedSeconds * 1000);
      set({
        status: "active",
        startTime: state.startTime - pausedDuration,
      });
    } else {
      set({ status: "active" });
    }
  },

  finishWorkout: async (name, notes) => {
    const state = get();
    if (!state.activeRoutine) return;

    if (name || notes) {
      const currentName = name || state.activeRoutine.name;
      const currentNotes = notes || state.activeRoutine.notes || "";

      let updated = WorkoutService.updateWorkoutName(currentName);
      if (updated) {
        updated = WorkoutService.updateWorkoutNotes(currentNotes);
        if (updated) {
          set({ activeRoutine: updated });
        }
      }
    }

    const completedWorkout = WorkoutService.completeWorkout();

    if (completedWorkout) {
      useBodyStore.getState().calculateFatigueFromWorkout(completedWorkout);

      set({
        status: "idle",
        activeRoutine: null,
        elapsedSeconds: 0,
        completedSets: {},
        startTime: null,
      });

      try {
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: completedWorkout.name,
            duration: completedWorkout.duration,
            totalVolume: completedWorkout.totalVolume,
            notes: completedWorkout.notes,
            exercises: completedWorkout.exercises,
          }),
        });

        if (!response.ok) {
          console.error("Failed to sync workout to database");
        }
      } catch (error) {
        console.error("Error syncing workout to database:", error);
      }
    }
  },

  cancelWorkout: () => {
    WorkoutService.cancelWorkout();
    set({
      status: "idle",
      activeRoutine: null,
      elapsedSeconds: 0,
      completedSets: {},
      startTime: null,
    });
  },

  updateElapsedTime: () => {
    const state = get();
    if (state.status === "active" && state.startTime) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      set({ elapsedSeconds: elapsed });
    }
  },
}));
