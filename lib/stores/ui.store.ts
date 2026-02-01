/**
 * Vitalis AI | Health & Performance Hub
 * File: ui.store.ts
 * Description: Zustand store for managing UI state across the application.
 */

import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeWorkoutId: string | null;
  setActiveWorkout: (id: string | null) => void;
  workoutStartTime: number | null;
  startWorkoutTimer: () => void;
  stopWorkoutTimer: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isFoodSearchOpen: boolean;
  setFoodSearchOpen: (isOpen: boolean) => void;
  isWorkoutDetailsOpen: boolean;
  setWorkoutDetailsOpen: (isOpen: boolean) => void;
  selectedWorkoutDetailId: string | null;
  setSelectedWorkoutDetailId: (id: string | null) => void;
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  activeWorkoutId: null,
  setActiveWorkout: (id) => set({ activeWorkoutId: id }),

  workoutStartTime: null,
  startWorkoutTimer: () => set({ workoutStartTime: Date.now() }),
  stopWorkoutTimer: () => set({ workoutStartTime: null }),

  selectedDate: getToday(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  isFoodSearchOpen: false,
  setFoodSearchOpen: (isOpen) => set({ isFoodSearchOpen: isOpen }),

  isWorkoutDetailsOpen: false,
  setWorkoutDetailsOpen: (isOpen) => set({ isWorkoutDetailsOpen: isOpen }),

  selectedWorkoutDetailId: null,
  setSelectedWorkoutDetailId: (id) => set({ selectedWorkoutDetailId: id }),
}));
