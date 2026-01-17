"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { WorkoutSet } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SetTableProps {
  sets: WorkoutSet[];
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  onRemoveSet: (setId: string) => void;
}

export function SetTable({ sets, onUpdateSet, onRemoveSet }: SetTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-zinc-500 uppercase tracking-wider">
            <th className="text-left py-2 pr-2 w-12">Set</th>
            <th className="text-left py-2 px-2 w-20">Prev</th>
            <th className="text-left py-2 px-2">kg</th>
            <th className="text-left py-2 px-2">Reps</th>
            <th className="text-center py-2 px-2 w-12">✓</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <tr key={set.id} className="group">
              <td className="py-2 pr-2">
                <span className="text-sm text-zinc-400">{set.setNumber}</span>
              </td>
              
              {/* Previous data (ghost text) */}
              <td className="py-2 px-2">
                {set.previousWeight && set.previousReps ? (
                  <span className="text-xs text-zinc-600">
                    {set.previousWeight} × {set.previousReps}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-700">—</span>
                )}
              </td>
              
              {/* Weight input */}
              <td className="py-2 px-2">
                <Input
                  variant="ghost"
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={set.weight || ""}
                  onChange={(e) =>
                    onUpdateSet(set.id, { weight: parseFloat(e.target.value) || 0 })
                  }
                  className={cn(
                    "w-16 h-10 text-sm text-center",
                    set.completed && "text-zinc-500"
                  )}
                />
              </td>
              
              {/* Reps input */}
              <td className="py-2 px-2">
                <Input
                  variant="ghost"
                  type="number"
                  placeholder="0"
                  value={set.reps || ""}
                  onChange={(e) =>
                    onUpdateSet(set.id, { reps: parseInt(e.target.value) || 0 })
                  }
                  className={cn(
                    "w-16 h-10 text-sm text-center",
                    set.completed && "text-zinc-500"
                  )}
                />
              </td>
              
              {/* Completed checkbox */}
              <td className="py-2 px-2 text-center">
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={(checked) =>
                    onUpdateSet(set.id, { completed: !!checked })
                  }
                  className="touch-target"
                />
              </td>
              
              {/* Delete button */}
              <td className="py-2 pl-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                  onClick={() => onRemoveSet(set.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

