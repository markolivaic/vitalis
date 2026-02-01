/**
 * File: meal-list.tsx
 * Description: Collapsible meal sections with food entry management.
 */

"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Coffee, Sun, Moon, Cookie, ChevronDown, ChevronUp } from "lucide-react";
import type { Meal, MealType, MealEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MealListProps {
  meals: Meal[];
  onAddFood: (mealType: MealType) => void;
  onRemoveEntry: (mealType: MealType, entryId: string) => void;
}

const mealConfig: Record<MealType, { icon: typeof Coffee; label: string; color: string }> = {
  breakfast: { icon: Coffee, label: "Breakfast", color: "text-amber-400" },
  lunch: { icon: Sun, label: "Lunch", color: "text-emerald-400" },
  dinner: { icon: Moon, label: "Dinner", color: "text-violet-400" },
  snack: { icon: Cookie, label: "Snacks", color: "text-rose-400" },
};

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function MealList({ meals, onAddFood, onRemoveEntry }: MealListProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<MealType>>(
    new Set(["breakfast", "lunch", "dinner", "snack"])
  );

  const toggleMeal = (type: MealType) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const getMealByType = (type: MealType) => meals.find((m) => m.type === type);
  const isExpanded = (type: MealType) => expandedMeals.has(type);

  return (
    <div className="space-y-4">
      {mealTypes.map((type) => {
        const config = mealConfig[type];
        const meal = getMealByType(type);
        const Icon = config.icon;
        const expanded = isExpanded(type);

        return (
          <GlassCard key={type} padding="md">
            {/* Meal Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleMeal(type)}
                className="flex items-center gap-2 flex-1 text-left group"
              >
                <Icon className={cn("w-4 h-4", config.color)} />
                <h4 className="font-medium text-white">{config.label}</h4>
                {meal && meal.entries.length > 0 && (
                  <span className="text-xs text-zinc-500">
                    {meal.totalCalories} kcal
                  </span>
                )}
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500 ml-auto group-hover:text-white transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 ml-auto group-hover:text-white transition-colors" />
                )}
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAddFood(type)}
                className="text-zinc-500 hover:text-emerald-400"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Meal Entries - Collapsible */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out",
                expanded ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
              )}
            >
              {meal && meal.entries.length > 0 ? (
                <div className="space-y-2">
                  {meal.entries.map((entry) => (
                    <MealEntryRow
                      key={entry.id}
                      entry={entry}
                      onRemove={() => onRemoveEntry(type, entry.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-600">
                    System fuel levels unknown. Log intake to monitor.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

function MealEntryRow({
  entry,
  onRemove,
}: {
  entry: MealEntry;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-white/5 group transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{entry.foodName}</p>
        <p className="text-xs text-zinc-500">
          {entry.servings > 1 && `${entry.servings}× • `}
          P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fats}g
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{entry.calories}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

