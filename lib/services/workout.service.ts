import type { Workout, WorkoutRoutine, WorkoutExercise, WorkoutSet, Exercise } from "@/lib/types";
import { StorageService, STORAGE_KEYS } from "./storage.service";
import {
  exerciseDatabase,
  defaultRoutines,
  generateSampleWorkouts,
} from "@/lib/mock-data";
import { generateId, getToday, formatTime } from "@/lib/utils";

export const WorkoutService = {
  // ===== EXERCISES =====
  getExercises(): Exercise[] {
    const exercises = StorageService.get<Exercise[]>(STORAGE_KEYS.EXERCISES);
    if (!exercises) {
      StorageService.set(STORAGE_KEYS.EXERCISES, exerciseDatabase);
      return exerciseDatabase;
    }
    return exercises;
  },

  getExerciseById(id: string): Exercise | undefined {
    return this.getExercises().find((ex) => ex.id === id);
  },

  // ===== ROUTINES =====
  getRoutines(): WorkoutRoutine[] {
    const routines = StorageService.get<WorkoutRoutine[]>(STORAGE_KEYS.ROUTINES);
    if (!routines) {
      StorageService.set(STORAGE_KEYS.ROUTINES, defaultRoutines);
      return defaultRoutines;
    }
    return routines;
  },

  getRoutineById(id: string): WorkoutRoutine | undefined {
    return this.getRoutines().find((r) => r.id === id);
  },

  // ===== WORKOUTS =====
  getWorkouts(): Workout[] {
    const workouts = StorageService.get<Workout[]>(STORAGE_KEYS.WORKOUTS);
    if (!workouts) {
      const sampleWorkouts = generateSampleWorkouts();
      StorageService.set(STORAGE_KEYS.WORKOUTS, sampleWorkouts);
      return sampleWorkouts;
    }
    return workouts;
  },

  getWorkoutById(id: string): Workout | undefined {
    return this.getWorkouts().find((w) => w.id === id);
  },

  getWorkoutsByDate(date: string): Workout[] {
    return this.getWorkouts().filter((w) => w.date === date);
  },

  getRecentWorkouts(limit: number = 5): Workout[] {
    return this.getWorkouts()
      .filter((w) => w.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  getTodayWorkout(): Workout | undefined {
    return this.getWorkouts().find((w) => w.date === getToday());
  },

  // Start a new workout
  startWorkout(routineId?: string): Workout {
    const routine = routineId ? this.getRoutineById(routineId) : undefined;

    const exercises: WorkoutExercise[] = routine
      ? routine.exercises.map((re) => ({
          id: generateId(),
          exerciseId: re.exerciseId,
          exerciseName: re.exerciseName,
          sets: Array.from({ length: re.targetSets }, (_, i) => ({
            id: generateId(),
            setNumber: i + 1,
            weight: 0,
            reps: 0,
            completed: false,
            type: "normal" as const,
            // Get previous workout data for this exercise
            ...this.getPreviousSetData(re.exerciseId, i + 1),
          })),
        }))
      : [];

    const workout: Workout = {
      id: generateId(),
      name: routine?.name || "Custom Workout",
      date: getToday(),
      startTime: formatTime(new Date()),
      status: "in_progress",
      routineId,
      totalVolume: 0,
      exercises,
    };

    // Save as active workout
    StorageService.set(STORAGE_KEYS.ACTIVE_WORKOUT, workout);

    return workout;
  },

  // Get active workout
  getActiveWorkout(): Workout | null {
    return StorageService.get<Workout>(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // Update active workout
  updateActiveWorkout(workout: Workout): void {
    // Recalculate total volume (exclude warmup sets)
    workout.totalVolume = workout.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((setTotal, set) => {
          // Only count completed sets that are NOT warmup
          if (set.completed && set.type !== "warmup") {
            return setTotal + set.weight * set.reps;
          }
          return setTotal;
        }, 0)
      );
    }, 0);

    StorageService.set(STORAGE_KEYS.ACTIVE_WORKOUT, workout);
  },

  // Complete workout
  completeWorkout(): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const completedWorkout: Workout = {
      ...activeWorkout,
      status: "completed",
      endTime: formatTime(new Date()),
      duration: Math.floor(
        (Date.now() - new Date(`${activeWorkout.date}T${activeWorkout.startTime}`).getTime()) / 1000
      ),
    };

    // Add to workouts list
    const workouts = this.getWorkouts();
    workouts.unshift(completedWorkout);
    StorageService.set(STORAGE_KEYS.WORKOUTS, workouts);

    // Clear active workout
    StorageService.remove(STORAGE_KEYS.ACTIVE_WORKOUT);

    return completedWorkout;
  },

  // Cancel active workout
  cancelWorkout(): void {
    StorageService.remove(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // Add exercise to active workout
  addExerciseToWorkout(exerciseId: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const exercise = this.getExerciseById(exerciseId);
    if (!exercise) return null;

    const workoutExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId,
      exerciseName: exercise.name,
      sets: [
        {
          id: generateId(),
          setNumber: 1,
          weight: 0,
          reps: 0,
          completed: false,
          type: "normal" as const,
          ...this.getPreviousSetData(exerciseId, 1),
        },
      ],
    };

    activeWorkout.exercises.push(workoutExercise);
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Add set to exercise
  addSetToExercise(workoutExerciseId: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const exercise = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!exercise) return null;

    const newSetNumber = exercise.sets.length + 1;
    const newSet: WorkoutSet = {
      id: generateId(),
      setNumber: newSetNumber,
      weight: 0,
      reps: 0,
      completed: false,
      type: "normal" as const,
      ...this.getPreviousSetData(exercise.exerciseId, newSetNumber),
    };

    exercise.sets.push(newSet);
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Update set
  updateSet(workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const exercise = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!exercise) return null;

    const set = exercise.sets.find((s) => s.id === setId);
    if (!set) return null;

    Object.assign(set, updates);
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Remove set
  removeSet(workoutExerciseId: string, setId: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const exercise = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!exercise) return null;

    exercise.sets = exercise.sets.filter((s) => s.id !== setId);
    // Renumber remaining sets
    exercise.sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });

    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Get previous set data for progressive overload
  getPreviousSetData(
    exerciseId: string,
    setNumber: number
  ): { previousWeight?: number; previousReps?: number } {
    const recentWorkouts = this.getRecentWorkouts(10);

    for (const workout of recentWorkouts) {
      const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise) {
        const set = exercise.sets.find((s) => s.setNumber === setNumber && s.completed);
        if (set) {
          return {
            previousWeight: set.weight,
            previousReps: set.reps,
          };
        }
      }
    }

    return {};
  },

  // Calculate total volume for a period
  getVolumeForPeriod(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.getWorkouts()
      .filter(
        (w) =>
          w.status === "completed" && new Date(w.date) >= cutoffDate
      )
      .reduce((total, w) => total + w.totalVolume, 0);
  },

  // Update exercise note
  updateExerciseNote(workoutExerciseId: string, note: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    const exercise = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!exercise) return null;

    exercise.notes = note;
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Update workout name
  updateWorkoutName(name: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    activeWorkout.name = name;
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },

  // Update workout notes
  updateWorkoutNotes(notes: string): Workout | null {
    const activeWorkout = this.getActiveWorkout();
    if (!activeWorkout) return null;

    activeWorkout.notes = notes;
    this.updateActiveWorkout(activeWorkout);

    return activeWorkout;
  },
};

