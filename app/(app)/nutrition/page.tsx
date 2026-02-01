/**
 * Vitalis AI | Health & Performance Hub
 * File: page.tsx
 * Description: Nutrition tracking page with meal logging and weekly overview.
 */

"use client";

import { useEffect, useState } from "react";
import { Apple } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateNavigator } from "@/components/nutrition/date-navigator";
import { MacroProgressBars } from "@/components/nutrition/macro-progress-bars";
import { MealList } from "@/components/nutrition/meal-list";
import { WeeklyChart } from "@/components/nutrition/weekly-chart";
import { FoodSearchModal } from "@/components/nutrition/food-search-modal";
import { UserService } from "@/lib/services/user.service";
import { NutritionService } from "@/lib/services/nutrition.service";
import { useNutritionStore } from "@/lib/stores/nutrition.store";
import { getToday } from "@/lib/utils";
import type { User, MealType } from "@/lib/types";

export default function NutritionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ date: string; calories: number }[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use nutrition store
  const selectedDate = useNutritionStore((state) => state.selectedDate);
  const todayNutrition = useNutritionStore((state) => state.todayNutrition);
  const loadTodayLog = useNutritionStore((state) => state.loadTodayLog);
  const deleteFood = useNutritionStore((state) => state.deleteFood);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTodayLog(selectedDate);
    }
  }, [selectedDate, loadTodayLog]);

  const loadData = () => {
    try {
      const userData = UserService.getUser();
      setUser(userData);

      const weekly = NutritionService.getWeeklyCalories();
      setWeeklyData(weekly);

      // Load today's log
      loadTodayLog(selectedDate);
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleRemoveEntry = (mealType: MealType, entryId: string) => {
    deleteFood(mealType, entryId);
  };

  const handleFoodAdded = () => {
    // Store will update automatically, no need to reload
  };

  const handleDateChange = (date: string) => {
    loadTodayLog(date);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading nutrition...</p>
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
            <Apple className="w-6 h-6 text-emerald-400" />
            Nutrition
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track your daily intake
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Tabs */}
      <Tabs defaultValue="day" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="day" className="flex-1">
            Day View
          </TabsTrigger>
          <TabsTrigger value="week" className="flex-1">
            Week View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-6">
          {/* Macro Progress */}
          <MacroProgressBars user={user} nutrition={todayNutrition} />

          {/* Meals */}
          <MealList
            meals={todayNutrition?.meals || []}
            onAddFood={handleAddFood}
            onRemoveEntry={handleRemoveEntry}
          />
        </TabsContent>

        <TabsContent value="week">
          <WeeklyChart data={weeklyData} user={user} />
        </TabsContent>
      </Tabs>

      {/* Food Search Modal */}
      <FoodSearchModal
        open={showFoodSearch}
        onClose={() => {
          setShowFoodSearch(false);
          setSelectedMealType(null);
        }}
        mealType={selectedMealType}
        date={selectedDate}
        onFoodAdded={handleFoodAdded}
      />
    </div>
  );
}

