"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/gym/workout-card";
import { RoutineCard } from "@/components/gym/routine-card";
import { WorkoutService } from "@/lib/services/workout.service";
import { useUIStore } from "@/lib/stores/ui.store";
import { useWorkoutStore } from "@/lib/stores/workout.store";
import { Dumbbell, Play, TrendingUp, Calendar } from "lucide-react";
import type { Workout, WorkoutRoutine } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function GymPage() {
  const router = useRouter();
  const { setActiveWorkout, startWorkoutTimer } = useUIStore();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [activeWorkout, setActiveWorkoutState] = useState<Workout | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [weeklyVolume, setWeeklyVolume] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGymData();
  }, []);

  const loadGymData = () => {
    try {
      // Check for active workout
      const active = WorkoutService.getActiveWorkout();
      setActiveWorkoutState(active);

      // Load recent workouts
      const recent = WorkoutService.getRecentWorkouts(3);
      setRecentWorkouts(recent);

      // Load routines
      const routineData = WorkoutService.getRoutines();
      setRoutines(routineData);

      // Calculate weekly volume
      const volume = WorkoutService.getVolumeForPeriod(7);
      setWeeklyVolume(volume);
    } catch (error) {
      console.error("Error loading gym data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = (routineId?: string) => {
    // Initialize workout store
    useWorkoutStore.getState().startWorkout(routineId);
    
    const workout = WorkoutService.getActiveWorkout();
    if (workout) {
      setActiveWorkout(workout.id);
      startWorkoutTimer();
      router.push("/gym/workout");
    }
  };

  const handleContinueWorkout = () => {
    if (activeWorkout) {
      setActiveWorkout(activeWorkout.id);
      router.push("/gym/workout");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading gym...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-violet-400" />
            Gym
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {activeWorkout
              ? "Workout in progress"
              : "Ready to train"}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              Weekly Volume
            </p>
            <p className="text-xl font-bold text-white">
              {weeklyVolume.toLocaleString()} kg
            </p>
          </div>
        </GlassCard>

        <GlassCard padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              This Week
            </p>
            <p className="text-xl font-bold text-white">
              {recentWorkouts.filter((w) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(w.date) >= weekAgo;
              }).length}{" "}
              sessions
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Active Workout / Start New */}
      {activeWorkout ? (
        <GlassCard
          variant="highlight-violet"
          padding="lg"
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs text-violet-400 uppercase tracking-wider font-medium">
              Active Workout
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {activeWorkout.name}
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            {activeWorkout.exercises.length} exercises •{" "}
            {activeWorkout.totalVolume.toLocaleString()} kg
          </p>
          <Button variant="violet" size="lg" onClick={handleContinueWorkout}>
            Continue Workout
          </Button>
        </GlassCard>
      ) : (
        <GlassCard
          variant="interactive"
          padding="lg"
          className="text-center cursor-pointer"
          onClick={() => handleStartWorkout()}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Start New Workout
          </h2>
          <p className="text-sm text-zinc-500">
            Quick start or choose a routine below
          </p>
        </GlassCard>
      )}

      {/* Routines */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">
          Routines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={handleStartWorkout}
            />
          ))}
        </div>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Recent Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onClick={() => setSelectedWorkout(workout)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Workout Details Dialog */}
      <Dialog
        open={!!selectedWorkout}
        onOpenChange={() => setSelectedWorkout(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name}</DialogTitle>
            <DialogDescription>
              {selectedWorkout && new Date(selectedWorkout.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedWorkout && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 text-sm">
                <div className="flex-1 glass-card p-3 rounded-lg text-center">
                  <p className="text-zinc-500 text-xs mb-1">Duration</p>
                  <p className="font-medium text-white">
                    {Math.floor((selectedWorkout.duration || 0) / 60)} min
                  </p>
                </div>
                <div className="flex-1 glass-card p-3 rounded-lg text-center">
                  <p className="text-zinc-500 text-xs mb-1">Volume</p>
                  <p className="font-medium text-white">
                    {selectedWorkout.totalVolume.toLocaleString()} kg
                  </p>
                </div>
                <div className="flex-1 glass-card p-3 rounded-lg text-center">
                  <p className="text-zinc-500 text-xs mb-1">Exercises</p>
                  <p className="font-medium text-white">
                    {selectedWorkout.exercises.length}
                  </p>
                </div>
              </div>

              {/* Workout Notes */}
              {selectedWorkout.notes && (
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Workout Notes</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedWorkout.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedWorkout.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="glass-card p-3 rounded-lg space-y-2"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">
                        {ex.exerciseName}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {ex.sets
                          .filter((s) => s.completed && s.type !== "warmup")
                          .map((s) => {
                            const typeLabel = s.type === "drop" ? "D" : s.type === "failure" ? "F" : "";
                            return typeLabel ? `${s.weight}×${s.reps} (${typeLabel})` : `${s.weight}×${s.reps}`;
                          })
                          .join(" | ")}
                      </p>
                    </div>
                    {/* Exercise Notes */}
                    {ex.notes && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-zinc-400 italic">{ex.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

