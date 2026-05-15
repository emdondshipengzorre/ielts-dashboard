"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SKILL_LABELS } from "@/lib/types";
import { formatHours } from "@/lib/utils";
import { getMaterial } from "@/lib/materials";
import type { ScheduleItem, WeeklyCheckoff } from "@/lib/types";

interface WeeklyChecklistProps {
  items: ScheduleItem[];
  checkoffs: WeeklyCheckoff[];
  onToggle: (scheduleItemId: string) => void;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function WeeklyChecklist({
  items,
  checkoffs,
  onToggle,
}: WeeklyChecklistProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedIds = new Set(
    checkoffs.filter((c) => c.completed).map((c) => c.scheduleItemId)
  );

  // Group items by dayOfWeek (0 = Monday, 6 = Sunday)
  const byDay: Record<number, ScheduleItem[]> = {};
  for (const item of items) {
    if (!byDay[item.dayOfWeek]) byDay[item.dayOfWeek] = [];
    byDay[item.dayOfWeek].push(item);
  }

  const anyItems = items.length > 0;

  if (!anyItems) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No schedule items for this location yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {DAY_NAMES.map((dayName, dayIndex) => {
        const dayItems = byDay[dayIndex] ?? [];

        return (
          <div key={dayName}>
            <div className="flex items-center gap-2 py-1">
              <h3 className="text-sm font-semibold text-foreground">{dayName}</h3>
              {dayItems.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({dayItems.filter((i) => completedIds.has(i.id)).length}/{dayItems.length})
                </span>
              )}
            </div>
            <Separator className="mb-2" />
            {dayItems.length === 0 ? (
              <p className="py-1 text-xs text-muted-foreground italic">Rest day</p>
            ) : (
              <ul className="space-y-1">
                {dayItems.map((item) => {
                  const isChecked = completedIds.has(item.id);
                  const material = getMaterial(item.activity);
                  const isExpanded = expandedId === item.id;

                  return (
                    <li key={item.id} className="rounded-lg transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3 px-2 py-1.5">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onToggle(item.id)}
                          aria-label={`Mark "${item.activity}" as ${isChecked ? "incomplete" : "complete"}`}
                        />
                        <button
                          type="button"
                          className="flex flex-1 items-center gap-2 min-w-0 text-left"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          <Badge variant="secondary" className="shrink-0">
                            {SKILL_LABELS[item.skill]}
                          </Badge>
                          <span
                            className={`flex-1 truncate text-sm ${
                              isChecked ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.activity}
                          </span>
                          {material && (
                            isExpanded
                              ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                              : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {formatHours(item.targetHours)}
                        </span>
                      </div>
                      {isExpanded && material && (
                        <div className="ml-10 mr-2 mb-2 rounded-md border border-border/50 bg-muted/30 p-3 space-y-2">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {material.instructions}
                          </p>
                          {material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              Open {material.label}
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
