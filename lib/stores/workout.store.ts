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
  
  // Actions
  startWorkout: (routineId?: string) => void;
  logSet: (exerciseId: string, setId: string, weight: number, reps: number) => void;
  updateSetCompleted: (exerciseId: string, setId: string, completed: boolean) => void;
  updateSetType: (exerciseId: string, setId: string, type: SetType) => void;
  updateExerciseNote: (exerciseId: string, note: string) => void;
  updateWorkoutDetails: (name: string, notes: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: (name?: string, notes?: string) => void;
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
    // Calculate start time from workout's startTime string
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

  updateSetCompleted: (exerciseId, setId, completed) => {
    const state = get();
    if (!state.activeRoutine) return;

    const updated = WorkoutService.updateSet(exerciseId, setId, { completed });
    if (updated) {
      const setKey = `${exerciseId}-${setId}`;
      set({
        activeRoutine: updated,
        completedSets: {
          ...state.completedSets,
          [setKey]: completed,
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
      // Adjust start time to account for paused duration
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

  finishWorkout: (name, notes) => {
    const state = get();
    if (!state.activeRoutine) return;

    // Update workout details if provided
    if (name || notes) {
      const currentName = name || state.activeRoutine.name;
      const currentNotes = notes || state.activeRoutine.notes || "";
      
      // Update workout details via WorkoutService
      let updated = WorkoutService.updateWorkoutName(currentName);
      if (updated) {
        updated = WorkoutService.updateWorkoutNotes(currentNotes);
        if (updated) {
          set({ activeRoutine: updated });
        }
      }
    }

    // Complete the workout via WorkoutService
    const completedWorkout = WorkoutService.completeWorkout();
    
    if (completedWorkout) {
      // Force the body store to update
      useBodyStore.getState().calculateFatigueFromWorkout(completedWorkout);
      
      // Clear state
      set({
        status: "idle",
        activeRoutine: null,
        elapsedSeconds: 0,
        completedSets: {},
        startTime: null,
      });
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

