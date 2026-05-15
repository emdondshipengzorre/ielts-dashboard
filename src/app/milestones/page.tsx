"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Circle } from "lucide-react";
import { db } from "@/lib/storage";
import { seedDatabase } from "@/lib/seed";
import { getPlanConfig, getElapsedMonths } from "@/lib/utils";
import { PHASE_LABELS, type Phase } from "@/lib/types";
import type { Milestone } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function MilestonesPage() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const data = useLiveQuery(async () => {
    const milestones = await db.milestones.orderBy("month").toArray();
    const config = getPlanConfig();
    const elapsedMonths = getElapsedMonths(config.startDate);
    return { milestones, elapsedMonths };
  });

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const { milestones, elapsedMonths } = data;
  const completedCount = milestones.filter((m) => m.completed).length;

  const grouped = milestones.reduce(
    (acc, m) => {
      const phase = m.phase as Phase;
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(m);
      return acc;
    },
    {} as Record<Phase, Milestone[]>
  );

  async function toggleMilestone(milestone: Milestone) {
    const newCompleted = !milestone.completed;
    await db.milestones.update(milestone.id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Milestones</h1>
        <p className="text-sm text-muted-foreground">
          {completedCount} of {milestones.length} completed
        </p>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-0">
        {milestones.map((milestone, index) => {
          const isPast = elapsedMonths >= milestone.month;
          const isCurrent =
            !milestone.completed &&
            isPast &&
            (index === 0 || milestones[index - 1].completed);

          return (
            <div key={milestone.id} className="flex gap-4">
              {/* Timeline line + node */}
              <div className="flex flex-col items-center">
                <div className="flex size-8 shrink-0 items-center justify-center">
                  {milestone.completed ? (
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  ) : isCurrent ? (
                    <div className="size-4 rounded-full border-2 border-primary bg-primary animate-pulse" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/40" />
                  )}
                </div>
                {index < milestones.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-4 ${
                      milestone.completed
                        ? "bg-emerald-500/40"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <Card className="flex-1 mb-3">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Month {milestone.month}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {PHASE_LABELS[milestone.phase as Phase]}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          milestone.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {milestone.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {milestone.description}
                      </p>
                    </div>
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={() => toggleMilestone(milestone)}
                      className="mt-1 shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
