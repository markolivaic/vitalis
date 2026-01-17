import { create } from "zustand";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Active workout (for Gym view)
  activeWorkoutId: string | null;
  setActiveWorkout: (id: string | null) => void;
  
  // Workout timer
  workoutStartTime: number | null;
  startWorkoutTimer: () => void;
  stopWorkoutTimer: () => void;
  
  // Selected date (for Nutrition view)
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  // Modal states
  isFoodSearchOpen: boolean;
  setFoodSearchOpen: (open: boolean) => void;
  isWorkoutDetailsOpen: boolean;
  setWorkoutDetailsOpen: (open: boolean) => void;
  selectedWorkoutDetailId: string | null;
  setSelectedWorkoutDetailId: (id: string | null) => void;
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // Active workout
  activeWorkoutId: null,
  setActiveWorkout: (id) => set({ activeWorkoutId: id }),
  
  // Workout timer
  workoutStartTime: null,
  startWorkoutTimer: () => set({ workoutStartTime: Date.now() }),
  stopWorkoutTimer: () => set({ workoutStartTime: null }),
  
  // Selected date
  selectedDate: getToday(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  // Modal states
  isFoodSearchOpen: false,
  setFoodSearchOpen: (open) => set({ isFoodSearchOpen: open }),
  isWorkoutDetailsOpen: false,
  setWorkoutDetailsOpen: (open) => set({ isWorkoutDetailsOpen: open }),
  selectedWorkoutDetailId: null,
  setSelectedWorkoutDetailId: (id) => set({ selectedWorkoutDetailId: id }),
}));

