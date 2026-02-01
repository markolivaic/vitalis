/**
 * Vitalis AI | Health & Performance Hub
 * File: date-navigator.tsx
 * Description: Date selection navigation component for nutrition tracking.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, getToday } from "@/lib/utils";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const today = getToday();

  const goToPrevious = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const goToNext = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    onDateChange(today);
  };

  const isToday = selectedDate === today;
  const isFuture = new Date(selectedDate) > new Date(today);

  return (
    <div className="flex items-center justify-between glass-card p-3 rounded-xl">
      <Button variant="ghost" size="icon" onClick={goToPrevious}>
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3">
        <button
          onClick={goToToday}
          className={`text-center transition-colors ${
            isToday ? "text-emerald-400" : "text-white hover:text-emerald-400"
          }`}
        >
          <p className="text-sm font-medium">
            {isToday ? "Today" : formatDate(selectedDate)}
          </p>
          {!isToday && (
            <p className="text-xs text-zinc-500">
              {isFuture ? "Planning ahead" : "Past day"}
            </p>
          )}
        </button>
      </div>

      <Button variant="ghost" size="icon" onClick={goToNext}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

