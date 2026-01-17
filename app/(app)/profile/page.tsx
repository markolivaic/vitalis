"use client";

import { useEffect, useState } from "react";
import { User as UserIcon, Trash2, RotateCcw, Save } from "lucide-react";
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
import { UserService } from "@/lib/services/user.service";
import { StorageService } from "@/lib/services/storage.service";
import { AIService } from "@/lib/services/ai.service";
import { WorkoutService } from "@/lib/services/workout.service";
import { NutritionService } from "@/lib/services/nutrition.service";
import type { User, AIInsight } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    height: 170,
    weight: 70,
    gender: "male" as "male" | "female",
    goal: "maintenance" as "muscle" | "fat_loss" | "maintenance",
    activityLevel: 1.55,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      const userData = UserService.getUser();
      setUser(userData);
      setFormData({
        name: userData.name,
        age: userData.age,
        height: userData.height,
        weight: userData.weight,
        gender: userData.gender,
        goal: userData.goal,
        activityLevel: userData.activityLevel,
      });

      // Generate AI insights
      const todayNutrition = NutritionService.getTodayNutrition();
      const todayWorkout = WorkoutService.getTodayWorkout();
      const recentWorkouts = WorkoutService.getRecentWorkouts(10);

      const context = {
        user: userData,
        todayNutrition,
        todayWorkout: todayWorkout || null,
        recentWorkouts,
        weeklyCalories: NutritionService.getWeeklyCalories().map((d) => d.calories),
      };

      const aiInsights = AIService.generateInsights(context, 3);
      setInsights(aiInsights);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = UserService.updateUser(formData);
      setUser(updated);
      // Show success feedback
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsSaving(false);
    }
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

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading profile...</p>
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
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
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
          {/* TODO: AI Integration - Replace with real AI responses */}
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

      {/* Danger Zone */}
      <GlassCard padding="lg" className="border-red-500/20">
        <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4">
          Danger Zone
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          Reset all data including workouts, nutrition logs, and profile settings.
          This action cannot be undone.
        </p>
        <Button variant="danger" className="gap-2" onClick={handleResetData}>
          <RotateCcw className="w-4 h-4" />
          Reset All Data
        </Button>
      </GlassCard>
    </div>
  );
}

