"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NutritionService } from "@/lib/services/nutrition.service";
import { useNutritionStore } from "@/lib/stores/nutrition.store";
import type { FoodItem, MealType } from "@/lib/types";
import { Plus, Minus } from "lucide-react";

interface FoodSearchModalProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType | null;
  date: string;
  onFoodAdded: () => void;
}

export function FoodSearchModal({
  open,
  onClose,
  mealType,
  date,
  onFoodAdded,
}: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  
  // Quick Add state
  const [quickCalories, setQuickCalories] = useState("");
  const [quickProtein, setQuickProtein] = useState("");
  const [quickCarbs, setQuickCarbs] = useState("");
  const [quickFats, setQuickFats] = useState("");

  // Store actions
  const logFood = useNutritionStore((state) => state.logFood);
  const quickLogCalories = useNutritionStore((state) => state.quickLogCalories);
  const recentFoods = useNutritionStore((state) => state.recentFoods);

  const foods = NutritionService.searchFoods(searchQuery);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleAddFood = () => {
    if (!selectedFood || !mealType) return;

    logFood(mealType, selectedFood.id, servings);
    onFoodAdded();
    handleClose();
  };

  const handleQuickAdd = () => {
    if (!mealType) return;
    
    const calories = parseFloat(quickCalories) || 0;
    const protein = parseFloat(quickProtein) || 0;
    const carbs = parseFloat(quickCarbs) || 0;
    const fats = parseFloat(quickFats) || 0;

    if (calories <= 0 || protein < 0) return;

    quickLogCalories(mealType, calories, protein, carbs, fats);
    onFoodAdded();
    handleClose();
  };

  const handleRecentFoodClick = (food: FoodItem) => {
    if (!mealType) return;
    logFood(mealType, food.id, 1);
    onFoodAdded();
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedFood(null);
    setServings(1);
    setQuickCalories("");
    setQuickProtein("");
    setQuickCarbs("");
    setQuickFats("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add to {mealType?.charAt(0).toUpperCase()}{mealType?.slice(1)}
          </DialogTitle>
        </DialogHeader>

        {!selectedFood ? (
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="quick">Quick Add</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-4 space-y-4">
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
                autoFocus
              />

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                {foods.map((food) => (
                  <button
                    key={food.id}
                    className="w-full text-left p-3 rounded-lg glass-card hover:bg-white/5 transition-colors"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{food.name}</p>
                        <p className="text-xs text-zinc-500">
                          {food.servingSize} {food.servingUnit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-400">{food.calories} kcal</p>
                        <p className="text-xs text-zinc-500">
                          P: {food.protein}g
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {foods.length === 0 && searchQuery && (
                  <p className="text-center text-zinc-500 py-8">
                    No foods found
                  </p>
                )}

                {foods.length === 0 && !searchQuery && (
                  <p className="text-center text-zinc-500 py-8">
                    Type to search for foods
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Quick Add Tab */}
            <TabsContent value="quick" className="mt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Calories *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(e.target.value)}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Protein (g) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Carbs (g)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Fats (g)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quickFats}
                    onChange={(e) => setQuickFats(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>
              <Button
                variant="emerald"
                className="w-full"
                onClick={handleQuickAdd}
                disabled={!quickCalories || !quickProtein || parseFloat(quickCalories) <= 0}
              >
                Add Entry
              </Button>
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="mt-4">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentFoods.length > 0 ? (
                  recentFoods.map((food) => (
                    <button
                      key={food.id}
                      className="w-full text-left p-3 rounded-lg glass-card hover:bg-white/5 transition-colors"
                      onClick={() => handleRecentFoodClick(food)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{food.name}</p>
                          <p className="text-xs text-zinc-500">
                            {food.servingSize} {food.servingUnit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-emerald-400">{food.calories} kcal</p>
                          <p className="text-xs text-zinc-500">
                            P: {food.protein}g
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-zinc-500 py-8">
                    No recent foods yet
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Selected Food Details */}
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-medium text-white text-lg">
                {selectedFood.name}
              </h4>
              <p className="text-sm text-zinc-500 mt-1">
                {selectedFood.servingSize} {selectedFood.servingUnit} per serving
              </p>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">
                    {Math.round(selectedFood.calories * servings)}
                  </p>
                  <p className="text-xs text-zinc-500">kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {Math.round(selectedFood.protein * servings)}g
                  </p>
                  <p className="text-xs text-zinc-500">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {Math.round(selectedFood.carbs * servings)}g
                  </p>
                  <p className="text-xs text-zinc-500">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {Math.round(selectedFood.fats * servings)}g
                  </p>
                  <p className="text-xs text-zinc-500">Fats</p>
                </div>
              </div>
            </div>

            {/* Servings Selector */}
            <div>
              <p className="text-sm text-zinc-400 mb-3">Servings</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  disabled={servings <= 0.5}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-2xl font-bold text-white w-16 text-center">
                  {servings}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setServings(servings + 0.5)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setSelectedFood(null)}
              >
                Back
              </Button>
              <Button
                variant="emerald"
                className="flex-1"
                onClick={handleAddFood}
              >
                Add Food
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

