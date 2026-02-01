/**
 * Vitalis AI | Health & Performance Hub
 * File: page.tsx
 * Description: User profile page with settings, targets, and account management.
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  RotateCcw,
  Save,
  LogOut,
  UserX,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorageService } from "@/lib/services/storage.service";
import { AIService } from "@/lib/services/ai.service";
import { WorkoutService } from "@/lib/services/workout.service";
import { NutritionService } from "@/lib/services/nutrition.service";
import type { AIInsight } from "@/lib/types";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  goal: "muscle" | "fat_loss" | "maintenance";
  activityLevel: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  createdAt: string;
}

interface ProfileFormData {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female";
  goal: "muscle" | "fat_loss" | "maintenance";
  activityLevel: number;
}

async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch("/api/user/profile");
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  const json = await response.json();
  return json.data;
}

async function updateProfile(
  data: ProfileFormData
): Promise<{ data: ProfileData; meta: { bmr: number; tdee: number; goalModifier: string } }> {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update profile");
  }
  return response.json();
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: 25,
    height: 170,
    weight: 70,
    gender: "male",
    goal: "maintenance",
    activityLevel: 1.55,
  });

  // Fetch profile from API
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchProfile,
    onSuccess: (data) => {
      // Populate form when data loads
      setFormData({
        name: data.name || "",
        age: data.age,
        height: data.height,
        weight: data.weight,
        gender: data.gender,
        goal: data.goal,
        activityLevel: data.activityLevel,
      });

      // Generate AI insights
      const todayNutrition = NutritionService.getTodayNutrition();
      const todayWorkout = WorkoutService.getTodayWorkout();
      const recentWorkouts = WorkoutService.getRecentWorkouts(10);

      const context = {
        user: {
          ...data,
          createdAt: data.createdAt,
          updatedAt: new Date().toISOString(),
        },
        todayNutrition,
        todayWorkout: todayWorkout || null,
        recentWorkouts,
        weeklyCalories: NutritionService.getWeeklyCalories().map((d) => d.calories),
      };

      const aiInsights = AIService.generateInsights(context, 3);
      setInsights(aiInsights);
    },
  });

  // Mutation for profile updates
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      // Update cache with new data
      queryClient.setQueryData(["user", "profile"], response.data);

      // Invalidate dashboard stats to reflect new targets
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });

      // Show success message with new targets
      setSuccessMessage(
        `Targets updated: ${response.data.calorieTarget} kcal | ${response.data.proteinTarget}g protein | ${response.data.carbsTarget}g carbs | ${response.data.fatsTarget}g fats`
      );

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      console.error("Error saving profile:", error);
      setSuccessMessage(null);
    },
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data? This will clear your workouts, nutrition logs, and reset your profile to defaults."
      )
    ) {
      StorageService.clear();
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-500">
            {error ? "Failed to load profile" : "Please sign in to continue"}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-zinc-400" />
            Profile
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your settings and preferences
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Profile Form */}
      <GlassCard padding="lg">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">
          Personal Information
        </h3>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              variant="ghost"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                variant="ghost"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value) || 25 })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "male" | "female") =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                variant="ghost"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: parseInt(e.target.value) || 170 })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                variant="ghost"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: parseFloat(e.target.value) || 70 })
                }
                className="mt-2"
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Select
              value={formData.goal}
              onValueChange={(value: "muscle" | "fat_loss" | "maintenance") =>
                setFormData({ ...formData, goal: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="muscle">Build Muscle (Surplus)</SelectItem>
                <SelectItem value="fat_loss">Lose Fat (Deficit)</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Level */}
          <div>
            <Label htmlFor="activity">Activity Level</Label>
            <Select
              value={formData.activityLevel.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, activityLevel: parseFloat(value) })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2">Sedentary (Office job)</SelectItem>
                <SelectItem value="1.375">Light (1-2 days/week)</SelectItem>
                <SelectItem value="1.55">Moderate (3-5 days/week)</SelectItem>
                <SelectItem value="1.725">Active (6-7 days/week)</SelectItem>
                <SelectItem value="1.9">Very Active (Athlete)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="emerald"
            className="w-full gap-2"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </GlassCard>

      {/* Calculated Targets */}
      <GlassCard padding="lg">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Your Daily Targets
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">{user.calorieTarget}</p>
            <p className="text-xs text-zinc-500">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{user.proteinTarget}g</p>
            <p className="text-xs text-zinc-500">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{user.carbsTarget}g</p>
            <p className="text-xs text-zinc-500">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{user.fatsTarget}g</p>
            <p className="text-xs text-zinc-500">Fats</p>
          </div>
        </div>
      </GlassCard>

      {/* AI Insights */}
      <GlassCard padding="lg">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          AI Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border-l-2 ${
                insight.type === "achievement"
                  ? "bg-emerald-500/10 border-emerald-500"
                  : insight.type === "warning"
                  ? "bg-amber-500/10 border-amber-500"
                  : "bg-white/5 border-white/20"
              }`}
            >
              <p className="text-sm font-mono-ai text-zinc-300">
                <span
                  className={
                    insight.type === "achievement"
                      ? "text-emerald-400"
                      : insight.type === "warning"
                      ? "text-amber-400"
                      : "text-zinc-500"
                  }
                >
                  {">"}
                </span>{" "}
                {insight.message}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Session & Security */}
      <GlassCard padding="lg" className="border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            System Security & Access
          </h3>
        </div>

        <p className="text-sm text-zinc-500 mb-6">
          Manage your current session or permanently wipe all data from the Vitalis network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminate Session
          </Button>

          <Button variant="danger" className="flex-1 gap-2" onClick={handleResetData}>
            <RotateCcw className="w-4 h-4" />
            Reset Local Data
          </Button>
        </div>
      </GlassCard>

      {/* Delete Account */}
      <GlassCard padding="lg" className="border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-4">
          <UserX className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-medium text-red-500 uppercase tracking-widest">
            Account Termination
          </h3>
        </div>

        <p className="text-sm text-zinc-500 mb-6">
          Permanently delete your account and all associated data from the Vitalis system.
          This action is irreversible.
        </p>

        <Button
          variant="danger"
          className="w-full bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
          onClick={async () => {
            const confirmed = confirm(
              "WARNING: This action is irreversible. All bio-data and progress will be permanently erased. Proceed with termination?"
            );
            if (confirmed) {
              try {
                const res = await fetch("/api/user/delete", { method: "DELETE" });
                if (res.ok) {
                  signOut({ callbackUrl: "/login" });
                } else {
                  alert("Error during termination sequence.");
                }
              } catch (error) {
                console.error(error);
              }
            }
          }}
        >
          <UserX className="w-4 h-4 mr-2" />
          Delete Account Permanently
        </Button>
      </GlassCard>
    </div>
  );
}
