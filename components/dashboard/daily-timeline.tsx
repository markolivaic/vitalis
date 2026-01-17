"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Check, Clock, X, Apple, Dumbbell } from "lucide-react";
import type { ScheduledItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DailyTimelineProps {
  items: ScheduledItem[];
}

export function DailyTimeline({ items }: DailyTimelineProps) {
  const getStatusIcon = (status: ScheduledItem["status"]) => {
    switch (status) {
      case "done":
        return <Check className="w-3 h-3 text-emerald-400" />;
      case "skipped":
        return <X className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-zinc-500" />;
    }
  };

  const getTypeIcon = (type: ScheduledItem["type"]) => {
    return type === "workout" ? (
      <Dumbbell className="w-4 h-4 text-violet-400" />
    ) : (
      <Apple className="w-4 h-4 text-emerald-400" />
    );
  };

  return (
    <GlassCard className="h-full">
      <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Today&apos;s Schedule
      </h3>

      <div className="relative space-y-1">
        {/* Timeline line */}
        <div className="timeline-line" />

        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative flex items-center gap-3 py-3 pl-8 rounded-lg transition-colors",
              item.status === "pending" && "hover:bg-white/5 cursor-pointer"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "timeline-dot absolute left-2",
                item.status === "done" && "emerald",
                item.type === "workout" && item.status === "pending" && "violet"
              )}
            />

            {/* Icon */}
            <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  item.status === "done" ? "text-zinc-500 line-through" : "text-white"
                )}
              >
                {item.title}
              </p>
              <p className="text-xs text-zinc-600">{item.time}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">
            No items scheduled for today
          </p>
        )}
      </div>
    </GlassCard>
  );
}

