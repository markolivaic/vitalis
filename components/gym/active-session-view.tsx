/**
 * Vitalis AI | Health & Performance Hub
 * File: active-session-view.tsx
 * Description: Active workout session view with exercise tracking and set logging.
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkoutStore } from "@/lib/stores/workout.store";
import { WorkoutService } from "@/lib/services/workout.service";
import { formatDuration } from "@/lib/utils";
import { Check, X, Plus, Trash2, Search } from "lucide-react";
import type { SetType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ActiveSessionView() {
  const router = useRouter();

  const status = useWorkoutStore(state => state.status);
  const elapsedSeconds = useWorkoutStore(state => state.elapsedSeconds);
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const updateElapsedTime = useWorkoutStore(state => state.updateElapsedTime);

  const {
    finishWorkout,
    cancelWorkout,
    logSet,
    updateSetCompleted,
    updateSetType,
    updateExerciseNote,
  } = useWorkoutStore.getState();

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);

  const [availableExercises] = useState(() => WorkoutService.getExercises());

  useEffect(() => {
    if (status === "active") {
      const interval = setInterval(() => {
        updateElapsedTime();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, updateElapsedTime]);

  useEffect(() => {
    if (initializedRef.current) return;

    const active = WorkoutService.getActiveWorkout();
    const currentStore = useWorkoutStore.getState();

    if (active && !currentStore.activeRoutine) {
      const startTime = new Date(`${active.date}T${active.startTime}`).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      useWorkoutStore.setState({
        status: "active",
        activeRoutine: active,
        startTime,
        elapsedSeconds: elapsed,
      });
      initializedRef.current = true;
    } else if (!active && !currentStore.activeRoutine) {
      router.push("/gym");
      initializedRef.current = true;
    }
  }, [router]);

  useEffect(() => {
    if (activeRoutine) {
      setWorkoutName(activeRoutine.name);
      setWorkoutNotes(activeRoutine.notes || "");
      const notes: Record<string, string> = {};
      activeRoutine.exercises.forEach((ex) => {
        if (ex.notes) notes[ex.id] = ex.notes;
      });
      setExerciseNotes(notes);
    }
  }, [activeRoutine?.id]);

  const handleFinishClick = () => {
    setShowFinishModal(true);
  };

  const handleFinishConfirm = () => {
    finishWorkout(workoutName, workoutNotes);
    setShowFinishModal(false);
    router.push("/");
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel?")) {
      cancelWorkout();
      router.push("/gym");
    }
  };

  const handleAddExerciseToWorkout = (exerciseId: string) => {
    const updatedWorkout = WorkoutService.addExerciseToWorkout(exerciseId);
    if (updatedWorkout) {
      useWorkoutStore.setState({ activeRoutine: updatedWorkout });
      setShowAddExercise(false);
      setSearchQuery("");
    }
  };

  const handleUpdateSet = useCallback((
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;

    const currentWorkout = useWorkoutStore.getState().activeRoutine;
    const exercise = currentWorkout?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);

    if (set) {
      logSet(
        exerciseId,
        setId,
        field === 'weight' ? numValue : set.weight,
        field === 'reps' ? numValue : set.reps
      );
    }
  }, [logSet]);

  const handleToggleSet = (exerciseId: string, setId: string, isChecked: boolean) => {
    updateSetCompleted(exerciseId, setId, isChecked);
  };

  const handleAddSet = (exerciseId: string) => {
    const updated = WorkoutService.addSetToExercise(exerciseId);
    if (updated) useWorkoutStore.setState({ activeRoutine: updated });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updated = WorkoutService.removeSet(exerciseId, setId);
    if (updated) useWorkoutStore.setState({ activeRoutine: updated });
  };

  const handleSetTypeChange = (exerciseId: string, setId: string, type: SetType) => {
    updateSetType(exerciseId, setId, type);
  };

  const handleExerciseNoteChange = (exerciseId: string, note: string) => {
    setExerciseNotes((prev) => ({ ...prev, [exerciseId]: note }));
    updateExerciseNote(exerciseId, note);
  };

  const getWorkoutStats = () => {
    if (!activeRoutine) return { volume: 0, exercises: 0, completedSets: 0 };

    const volume = activeRoutine.totalVolume;
    const exercises = activeRoutine.exercises.length;
    const completedSets = activeRoutine.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed && s.type !== "warmup").length,
      0
    );

    return { volume, exercises, completedSets };
  };

  const stats = getWorkoutStats();

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!activeRoutine) return null;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-mono text-4xl md:text-5xl text-white tabular-nums">
              {formatDuration(elapsedSeconds)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Workout Time</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel} className="text-zinc-400 hover:text-red-400">
              <X className="w-5 h-5" />
            </Button>
            <Button variant="emerald" size="lg" onClick={handleFinishClick} className="min-h-12 px-6">
              <Check className="w-5 h-5 mr-2" />
              Finish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {activeRoutine.exercises.map((exercise) => (
          <GlassCard key={exercise.id} padding="md" className="space-y-4">
            <h3 className="text-lg font-bold text-white">{exercise.exerciseName}</h3>

            <Textarea
              variant="ghost"
              placeholder="Seat height: 4, Grip width: wide..."
              value={exerciseNotes[exercise.id] || ""}
              onChange={(e) => handleExerciseNoteChange(exercise.id, e.target.value)}
              className="text-sm min-h-[60px]"
              onBlur={() => {
                if (exerciseNotes[exercise.id] !== undefined) {
                  updateExerciseNote(exercise.id, exerciseNotes[exercise.id] || "");
                }
              }}
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-zinc-500 uppercase border-b border-white/10">
                    <th className="text-left py-2 w-16">Set</th>
                    <th className="text-left py-2 w-20">Kg</th>
                    <th className="text-left py-2 w-20">Reps</th>
                    <th className="text-center py-2 w-12">Done</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => {
                    const setType = set.type || "normal";
                    const isWarmup = setType === "warmup";

                    return (
                      <tr
                        key={set.id}
                        className={cn(
                          "border-b border-white/5",
                          isWarmup && "opacity-60"
                        )}
                      >
                        <td className="py-2">
                          <Select
                            value={setType}
                            onValueChange={(value: SetType) => handleSetTypeChange(exercise.id, set.id, value)}
                          >
                            <SelectTrigger className="h-10 w-14 p-0 border-0 bg-transparent hover:bg-white/5">
                              <SelectValue>
                                {setType === "normal" ? (
                                  <span className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-medium">
                                    {set.setNumber}
                                  </span>
                                ) : setType === "warmup" ? (
                                  <span className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
                                    W
                                  </span>
                                ) : setType === "drop" ? (
                                  <span className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                                    D
                                  </span>
                                ) : (
                                  <span className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold">
                                    F
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">
                                    {set.setNumber}
                                  </span>
                                  <span>Normal</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="warmup">
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
                                    W
                                  </span>
                                  <span>Warmup</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="drop">
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                                    D
                                  </span>
                                  <span>Drop Set</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="failure">
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold">
                                    F
                                  </span>
                                  <span>Failure</span>
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      <td className="py-2 px-1">
                        <Input
                          variant="ghost"
                          type="number"
                          defaultValue={set.weight || ""}
                          placeholder="0"
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                          className="w-16 h-10 text-center text-lg bg-transparent border-b border-white/20 focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <Input
                          variant="ghost"
                          type="number"
                          defaultValue={set.reps || ""}
                          placeholder="0"
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                          className="w-16 h-10 text-center text-lg bg-transparent border-b border-white/20 focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(checked) => handleToggleSet(exercise.id, set.id, !!checked)}
                          className="w-6 h-6"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleRemoveSet(exercise.id, set.id)}>
                          <Trash2 className="w-4 h-4 text-zinc-600" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => handleAddSet(exercise.id)}
              className="w-full py-3 border border-dashed border-white/10 rounded-lg text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </GlassCard>
        ))}

        <div className="pt-4 pb-20">
          <Button
            variant="emerald"
            className="w-full h-14"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Exercise
          </Button>
        </div>
      </div>

      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent className="max-h-[80vh] flex flex-col p-0 gap-0 bg-zinc-900 border-white/10">
          <div className="p-4 border-b border-white/10">
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-black/50 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExerciseToWorkout(ex.id)}
                className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-white">{ex.name}</div>
                  <div className="text-xs text-zinc-500 capitalize">{ex.muscleGroup}</div>
                </div>
                <Plus className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="max-w-md bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl">Finish Workout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Workout Name</label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-black/50 border-white/10"
                placeholder="Push Day"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Workout Notes</label>
              <Textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did it feel? Energy levels?"
                className="bg-black/50 border-white/10 min-h-[100px]"
              />
            </div>

            <GlassCard padding="md" className="bg-white/5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Volume</p>
                  <p className="text-lg font-bold text-white">{stats.volume.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-lg font-bold text-white">{formatDuration(elapsedSeconds)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Sets</p>
                  <p className="text-lg font-bold text-white">{stats.completedSets}</p>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowFinishModal(false)}
              >
                Discard
              </Button>
              <Button
                variant="emerald"
                className="flex-1"
                onClick={handleFinishConfirm}
              >
                <Check className="w-4 h-4 mr-2" />
                Save Workout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
