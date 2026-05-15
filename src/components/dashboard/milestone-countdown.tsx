"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Milestone } from "@/lib/types";

interface MilestoneCountdownProps {
  milestone: Milestone | null;
  startDate: string;
}

function getTargetDate(startDate: string, targetMonth: number): Date {
  const start = new Date(startDate);
  const target = new Date(start);
  target.setMonth(target.getMonth() + targetMonth - 1);
  return target;
}

function getDaysRemaining(targetDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function MilestoneCountdown({ milestone, startDate }: MilestoneCountdownProps) {
  if (!milestone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <span className="text-4xl">🎉</span>
            <p className="font-semibold text-foreground">All milestones completed!</p>
            <p className="text-sm text-muted-foreground">Outstanding work on your IELTS journey.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const targetDate = getTargetDate(startDate, milestone.month);
  const daysRemaining = getDaysRemaining(targetDate);
  const monthsRemaining = Math.ceil(daysRemaining / 30);
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining >= 0 && daysRemaining <= 30;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>Next Milestone</CardTitle>
          <Badge variant="outline">Month {milestone.month}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold text-foreground">{milestone.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            Target date: {targetDate.toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
          {isOverdue ? (
            <p className="text-sm font-medium text-destructive">
              Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? "s" : ""}
            </p>
          ) : daysRemaining === 0 ? (
            <p className="text-sm font-semibold text-primary">Due today!</p>
          ) : (
            <p className={`text-sm font-medium ${isUrgent ? "text-amber-500" : "text-foreground"}`}>
              {daysRemaining < 60
                ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`
                : `~${monthsRemaining} month${monthsRemaining !== 1 ? "s" : ""} remaining`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
