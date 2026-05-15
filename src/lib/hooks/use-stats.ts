"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";
import { SKILLS, type Skill, type Phase, type Milestone } from "@/lib/types";
import {
  getPlanConfig,
  getCurrentPhase,
  computeStreak,
  getWeekStart,
} from "@/lib/utils";

interface Stats {
  totalHours: number;
  currentPhase: Phase;
  currentStreak: number;
  weeklyHours: number;
  weeklyTarget: number;
  targetHours: number;
  hoursBySkill: Record<Skill, number>;
  nextMilestone: Milestone | undefined;
}

export function useStats(): Stats | undefined {
  return useLiveQuery(async () => {
    const [sessions, milestones] = await Promise.all([
      db.sessions.toArray(),
      db.milestones.orderBy("month").toArray(),
    ]);

    const config = getPlanConfig();

    const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
    const currentPhase = getCurrentPhase(config.startDate);
    const currentStreak = computeStreak(sessions);

    const weekStart = getWeekStart(new Date());
    const weeklyHours = sessions
      .filter((s) => s.date >= weekStart)
      .reduce((sum, s) => sum + s.hours, 0);

    const weeklyTarget = config.weeklyTargetHours;
    const targetHours = config.totalTargetHours;

    const hoursBySkill = SKILLS.reduce((acc, skill) => {
      acc[skill] = sessions
        .filter((s) => s.skill === skill)
        .reduce((sum, s) => sum + s.hours, 0);
      return acc;
    }, {} as Record<Skill, number>);

    const nextMilestone = milestones.find((m) => !m.completed);

    return {
      totalHours,
      currentPhase,
      currentStreak,
      weeklyHours,
      weeklyTarget,
      targetHours,
      hoursBySkill,
      nextMilestone,
    };
  });
}
