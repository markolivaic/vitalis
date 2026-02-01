/**
 * Vitalis AI | Health & Performance Hub
 * File: donut-chart.tsx
 * Description: Reusable donut chart component with gradient support.
 */

"use client";

import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  value: number;
  max: number;
  variant?: "emerald" | "violet" | "amber" | "default";
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  className?: string;
}

const gradients = {
  emerald: ["#10b981", "#059669"],
  violet: ["#8b5cf6", "#7c3aed"],
  amber: ["#f59e0b", "#d97706"],
  default: ["#ffffff", "#a1a1aa"],
};

export function DonutChart({
  value,
  max,
  variant = "default",
  size = "md",
  label,
  sublabel,
  className,
}: DonutChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const remaining = Math.max(max - value, 0);
  const colors = gradients[variant];

  const data = [
    { name: "completed", value: value },
    { name: "remaining", value: remaining },
  ];

  const sizeConfig = {
    sm: { width: 80, height: 80, innerRadius: 28, outerRadius: 36 },
    md: { width: 120, height: 120, innerRadius: 42, outerRadius: 54 },
    lg: { width: 160, height: 160, innerRadius: 58, outerRadius: 74 },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <ResponsiveContainer width={config.width} height={config.height}>
        <PieChart>
          <defs>
            <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={`url(#gradient-${variant})`} />
            <Cell fill="rgba(255,255,255,0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && (
            <span className={cn(
              "font-semibold text-white",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}>
              {label}
            </span>
          )}
          {sublabel && (
            <span className={cn(
              "text-zinc-500",
              size === "sm" && "text-[10px]",
              size === "md" && "text-xs",
              size === "lg" && "text-sm"
            )}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

