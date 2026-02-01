/**
 * Vitalis AI | Health & Performance Hub
 * File: workout-timer.tsx
 * Description: Real-time workout duration timer component.
 */

"use client";

import { useState, useEffect } from "react";
import { formatDuration } from "@/lib/utils";

interface WorkoutTimerProps {
  startTime: number;
}

export function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-mono text-lg text-white tabular-nums">
        {formatDuration(elapsed)}
      </span>
    </div>
  );
}

