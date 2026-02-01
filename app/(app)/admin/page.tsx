/**
 * File: page.tsx
 * Description: Admin dashboard page with exercises CRUD and user management.
 */

"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Trash2,
  Plus,
  ShieldCheck,
  Pencil,
  Users,
  Dumbbell,
  Save,
} from "lucide-react";
import type { Exercise } from "@/lib/types";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [view, setView] = useState<"exercises" | "users">("exercises");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    muscleGroup: "",
    equipment: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchExercises = async () => {
    try {
      const res = await fetch("/api/exercises");
      const json = await res.json();
      if (json.data) {
        setExercises(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.data) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "exercises") {
      fetchExercises();
    } else {
      fetchUsers();
    }
  }, [view]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, muscleGroup, equipment }),
      });
      if (res.ok) {
        setName("");
        setMuscleGroup("");
        setEquipment("");
        fetchExercises();
      }
    } catch (error) {
      console.error("Failed to add exercise:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      try {
        await fetch(`/api/exercises/${id}`, { method: "DELETE" });
        fetchExercises();
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      }
    }
  };

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingExercise(null);
    setEditForm({ name: "", muscleGroup: "", equipment: "" });
  };

  const handleUpdate = async () => {
    if (!editingExercise) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/exercises/${editingExercise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        closeEditDialog();
        fetchExercises();
      } else {
        const error = await res.json();
        console.error("Failed to update exercise:", error.error);
      }
    } catch (error) {
      console.error("Failed to update exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        <h1 className="text-2xl font-bold">Admin Mission Control</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setView("exercises")}
          className={`flex items-center gap-2 text-sm uppercase tracking-widest transition-colors ${
            view === "exercises"
              ? "text-emerald-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Exercises CRUD
        </button>
        <button
          onClick={() => setView("users")}
          className={`flex items-center gap-2 text-sm uppercase tracking-widest transition-colors ${
            view === "users"
              ? "text-emerald-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Subject Database
        </button>
      </div>

      {view === "exercises" ? (
        <>
          {/* Add Exercise Form */}
          <GlassCard padding="lg">
            <h2 className="text-lg font-semibold mb-4">Add New Exercise</h2>
            <form
              onSubmit={handleAdd}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Muscle Group"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                required
              />
              <Input
                placeholder="Equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                required
              />
              <Button variant="emerald" type="submit">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </form>
          </GlassCard>

          {/* Exercise List */}
          <GlassCard padding="lg">
            <h2 className="text-lg font-semibold mb-4">
              Exercises ({exercises.length})
            </h2>
            {loading ? (
              <p className="text-zinc-500">Loading...</p>
            ) : exercises.length === 0 ? (
              <p className="text-zinc-500">No exercises found. Add one above!</p>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <span className="font-bold text-white">{ex.name}</span>
                      <span className="ml-3 text-xs text-zinc-500 uppercase">
                        {ex.muscleGroup} | {ex.equipment}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(ex)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="icon-sm"
                        onClick={() => handleDelete(ex.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Edit Exercise Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Exercise</DialogTitle>
                <DialogDescription>
                  Update the exercise details below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Exercise name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-muscle">Muscle Group</Label>
                  <Input
                    id="edit-muscle"
                    value={editForm.muscleGroup}
                    onChange={(e) =>
                      setEditForm({ ...editForm, muscleGroup: e.target.value })
                    }
                    placeholder="e.g., Chest, Back, Legs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-equipment">Equipment</Label>
                  <Input
                    id="edit-equipment"
                    value={editForm.equipment}
                    onChange={(e) =>
                      setEditForm({ ...editForm, equipment: e.target.value })
                    }
                    placeholder="e.g., Barbell, Dumbbell, Cable"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={closeEditDialog}>
                  Cancel
                </Button>
                <Button
                  variant="emerald"
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        /* Users View */
        <GlassCard padding="lg">
          <h2 className="text-lg font-semibold mb-4">
            Registered Subjects ({users.length})
          </h2>
          {loading ? (
            <p className="text-zinc-500">Loading subjects...</p>
          ) : users.length === 0 ? (
            <p className="text-zinc-500">No subjects found in the system.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold border border-white/10 overflow-hidden">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-zinc-400">
                          {u.name?.charAt(0)?.toUpperCase() ||
                            u.email?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {u.name || "Unknown Subject"}
                      </p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">
                        Joined:{" "}
                        {new Date(u.createdAt).toLocaleDateString("hr-HR")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      u.role === "admin"
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                    }`}
                  >
                    {u.role}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
