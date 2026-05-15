"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";
import { getPlanConfig, getCurrentPhase, getElapsedMonths, getWeekStart, computeStreak } from "@/lib/utils";
import { SKILLS } from "@/lib/types";
import type { DailyPlan, AnkiStats } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function cacheKey(): string {
  return `ielts:dailyPlan:${new Date().toISOString().slice(0, 10)}`;
}

function getCachedPlan(): DailyPlan | null {
  try {
    const raw = localStorage.getItem(cacheKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cachePlan(plan: DailyPlan): void {
  localStorage.setItem(cacheKey(), JSON.stringify(plan));
}

export function useDailyPlan(ankiStats: AnkiStats | null) {
  const [plan, setPlan] = useState<DailyPlan | null>(getCachedPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studyContext = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray();
    const config = getPlanConfig();
    const hoursBySkill: Record<string, number> = {};
    for (const skill of SKILLS) hoursBySkill[skill] = 0;
    for (const s of sessions) {
      hoursBySkill[s.skill] = (hoursBySkill[s.skill] ?? 0) + s.hours;
    }
    const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
    const weekStart = getWeekStart(new Date());
    const weeklyHours = sessions
      .filter((s) => s.date >= weekStart)
      .reduce((sum, s) => sum + s.hours, 0);
    const streak = computeStreak(sessions);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);
    const recentActivities = sessions
      .filter((s) => s.date >= threeDaysAgoStr)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map((s) => `${s.activity} (${s.skill}, ${s.hours}h)`);

    const milestones = await db.milestones.orderBy("month").toArray();
    const nextMilestone = milestones.find((m) => !m.completed) ?? null;

    return {
      currentPhase: getCurrentPhase(config.startDate),
      elapsedMonths: getElapsedMonths(config.startDate),
      hoursBySkill,
      totalHours,
      targetHours: config.totalTargetHours,
      weeklyHours,
      weeklyTarget: config.weeklyTargetHours,
      streak,
      recentActivities,
      upcomingMilestone: nextMilestone
        ? { title: nextMilestone.title, description: nextMilestone.description, month: nextMilestone.month }
        : null,
    };
  });

  const generate = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedPlan();
      if (cached) {
        setPlan(cached);
        return;
      }
    }

    if (!studyContext) return;

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const response = await fetch("/api/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studyContext,
          dayOfWeek: DAYS[now.getDay()],
          location: now.getTimezoneOffset() <= -420 ? "Beijing" : "Manila",
          ankiStats: ankiStats ? {
            dueCards: ankiStats.dueCards,
            reviewedToday: ankiStats.reviewedToday,
            isConnected: ankiStats.isConnected,
          } : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const newPlan: DailyPlan = await response.json();
      cachePlan(newPlan);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  }, [studyContext, ankiStats]);

  useEffect(() => {
    if (studyContext && !plan) {
      generate();
    }
  }, [studyContext, plan, generate]);

  return {
    plan,
    isLoading,
    error,
    regenerate: () => generate(true),
  };
}
