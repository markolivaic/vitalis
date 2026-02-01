/**
 * Vitalis AI | Health & Performance Hub
 * File: weekly-chart.tsx
 * Description: Weekly calorie intake bar chart visualization.
 */

"use client";

import { GlassCard } from "@/components/ui/glass-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { User } from "@/lib/types";

interface WeeklyChartProps {
  data: { date: string; calories: number }[];
  user: User;
}

export function WeeklyChart({ data, user }: WeeklyChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    isToday: d.date === new Date().toISOString().split("T")[0],
  }));

  const avgCalories = Math.round(
    chartData.reduce((sum, d) => sum + d.calories, 0) / chartData.length
  );

  return (
    <GlassCard padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">
          Weekly Overview
        </h3>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Avg</p>
          <p className="text-sm font-medium text-white">{avgCalories} kcal</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              width={40}
            />
            <ReferenceLine
              y={user.calorieTarget}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isToday
                      ? "#10b981"
                      : entry.calories >= user.calorieTarget
                      ? "rgba(16, 185, 129, 0.5)"
                      : "rgba(255, 255, 255, 0.1)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/10" />
          <span className="text-xs text-zinc-500">Under target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/50" />
          <span className="text-xs text-zinc-500">Met target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-px h-3 bg-emerald-500 border border-emerald-500 border-dashed" />
          <span className="text-xs text-zinc-500">Target ({user.calorieTarget})</span>
        </div>
      </div>
    </GlassCard>
  );
}

