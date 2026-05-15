"use client";

import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SKILL_COLORS, type Skill } from "@/lib/types";
import type { DailyPlan } from "@/lib/types";
import { getMaterial } from "@/lib/materials";

interface DailyPlanWidgetProps {
  plan: DailyPlan | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onToggleTask?: (taskIndex: number, checked: boolean) => void;
}

const PRIORITY_STYLES = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
} as const;

export function DailyPlanWidget({ plan, isLoading, error, onRegenerate, onToggleTask }: DailyPlanWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Plan</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating…" : "Regenerate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !plan && (
          <div className="space-y-3 py-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        )}

        {error && !plan && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {plan && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{plan.greeting}</p>

            <div className="space-y-2">
              {plan.tasks.map((task, i) => {
                const isCompleted = plan.completedTasks?.includes(i) ?? false;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${isCompleted ? "opacity-50" : ""}`}
                  >
                    {onToggleTask ? (
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={(checked) => onToggleTask(i, !!checked)}
                        className="mt-0.5 shrink-0"
                        aria-label={`Mark "${task.activity}" as ${isCompleted ? "incomplete" : "complete"}`}
                      />
                    ) : (
                      <div
                        className="mt-0.5 size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: SKILL_COLORS[task.skill as Skill] ?? "hsl(0,0%,60%)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${isCompleted ? "line-through" : ""}`}>{task.activity}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{task.time}</span>
                        <span>·</span>
                        <span>{task.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{task.reason}</p>
                      {(() => {
                        const mat = getMaterial(task.activity);
                        return mat?.url ? (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="size-3" />
                            {mat.label}
                          </a>
                        ) : null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>

            {plan.ankiReminder && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                {plan.ankiReminder}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-xs text-muted-foreground italic">{plan.motivationalNote}</p>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {plan.totalPlannedHours}h planned
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
