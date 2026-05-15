"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";
import { getPlanConfig, getCurrentPhase, getElapsedMonths, getWeekStart, computeStreak } from "@/lib/utils";
import { SKILLS } from "@/lib/types";
import type { DailyPlan, AnkiStats, Location } from "@/lib/types";

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

  const toggleTask = useCallback(async (taskIndex: number, checked: boolean) => {
    if (!plan) return;

    const task = plan.tasks[taskIndex];
    if (!task) return;

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();
    const config = getPlanConfig();
    const currentPhase = getCurrentPhase(config.startDate);
    const location: Location = new Date().getTimezoneOffset() <= -420 ? "beijing" : "manila";

    // Parse duration string to hours (e.g. "30 min" -> 0.5, "1 hour" -> 1.0, "1.5 hours" -> 1.5)
    const parseDuration = (dur: string): number => {
      const lower = dur.toLowerCase().trim();
      const hourMatch = lower.match(/([\d.]+)\s*h/);
      const minMatch = lower.match(/([\d.]+)\s*m/);
      let hours = 0;
      if (hourMatch) hours += parseFloat(hourMatch[1]);
      if (minMatch) hours += parseFloat(minMatch[1]) / 60;
      if (hours === 0) hours = 0.5; // fallback
      return Math.round(hours * 100) / 100;
    };

    if (checked) {
      // Create a StudySession
      await db.sessions.add({
        id: crypto.randomUUID(),
        date: today,
        skill: task.skill,
        activity: task.activity,
        hours: parseDuration(task.duration),
        location,
        phase: currentPhase,
        sourceDailyPlan: today,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Delete the auto-logged session for this task
      const sessions = await db.sessions
        .where("sourceDailyPlan")
        .equals(today)
        .toArray();
      const match = sessions.find((s) => s.activity === task.activity);
      if (match) await db.sessions.delete(match.id);
    }

    // Update completedTasks in state and localStorage
    const prev = plan.completedTasks ?? [];
    const next = checked
      ? [...prev, taskIndex]
      : prev.filter((i) => i !== taskIndex);

    const updatedPlan: DailyPlan = { ...plan, completedTasks: next };
    setPlan(updatedPlan);
    cachePlan(updatedPlan);
  }, [plan]);

  return {
    plan,
    isLoading,
    error,
    regenerate: () => generate(true),
    toggleTask,
  };
}
