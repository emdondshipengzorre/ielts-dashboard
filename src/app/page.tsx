"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Clock, Flame, TrendingUp } from "lucide-react";
import { PhaseIndicator } from "@/components/dashboard/phase-indicator";
import { StatCard } from "@/components/dashboard/stat-card";
import { SkillChart } from "@/components/dashboard/skill-chart";
import { MilestoneCountdown } from "@/components/dashboard/milestone-countdown";
import { QuickLogButton } from "@/components/dashboard/quick-log-button";
import { DailyPlanWidget } from "@/components/dashboard/daily-plan";
import { AnkiStatsWidget } from "@/components/dashboard/anki-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/storage";
import { seedDatabase } from "@/lib/seed";
import { useAnki } from "@/lib/hooks/use-anki";
import { useDailyPlan } from "@/lib/hooks/use-daily-plan";
import {
  getPlanConfig,
  getCurrentPhase,
  getWeekStart,
  getElapsedMonths,
  formatHours,
  computeStreak,
} from "@/lib/utils";

export default function DashboardPage() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const { stats: ankiStats, isLoading: ankiLoading, refresh: refreshAnki } = useAnki();
  const { plan, isLoading: planLoading, error: planError, regenerate } = useDailyPlan(ankiStats);

  const stats = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray();
    const config = getPlanConfig();
    const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
    const streak = computeStreak(sessions);
    const weekStart = getWeekStart(new Date());
    const weeklyHours = sessions
      .filter((s) => s.date >= weekStart)
      .reduce((sum, s) => sum + s.hours, 0);
    const hoursBySkill: Record<string, number> = {};
    for (const s of sessions) {
      hoursBySkill[s.skill] = (hoursBySkill[s.skill] || 0) + s.hours;
    }
    const milestones = await db.milestones.orderBy("month").toArray();
    const nextMilestone = milestones.find((m) => !m.completed) || null;
    return {
      totalHours,
      targetHours: config.totalTargetHours,
      currentPhase: getCurrentPhase(config.startDate),
      currentStreak: streak,
      weeklyHours,
      weeklyTarget: config.weeklyTargetHours,
      hoursBySkill,
      nextMilestone,
      elapsedMonths: getElapsedMonths(config.startDate),
      totalMonths: config.totalMonths,
      startDate: config.startDate,
    };
  });

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totalProgressPct = Math.min(
    100,
    Math.round((stats.totalHours / stats.targetHours) * 100)
  );
  const weeklyProgressPct = Math.min(
    100,
    Math.round((stats.weeklyHours / stats.weeklyTarget) * 100)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IELTS Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your journey to Band 7.0+
          </p>
        </div>

        {/* Today's Plan */}
        <DailyPlanWidget
          plan={plan}
          isLoading={planLoading}
          error={planError}
          onRegenerate={regenerate}
        />

        {/* Phase Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Study Phase Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseIndicator
              currentPhase={stats.currentPhase}
              elapsedMonths={stats.elapsedMonths}
              totalMonths={stats.totalMonths}
            />
          </CardContent>
        </Card>

        {/* Stat Cards + Anki */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Hours"
            value={formatHours(stats.totalHours)}
            subtitle={`of ${formatHours(stats.targetHours)} target`}
            icon={Clock}
            progress={totalProgressPct}
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`}
            subtitle={stats.currentStreak > 0 ? "Keep it up!" : "Start studying today!"}
            icon={Flame}
          />
          <StatCard
            title="This Week"
            value={formatHours(stats.weeklyHours)}
            subtitle={`of ${formatHours(stats.weeklyTarget)} weekly target`}
            icon={TrendingUp}
            progress={weeklyProgressPct}
          />
          <AnkiStatsWidget stats={ankiStats} isLoading={ankiLoading} onRefresh={refreshAnki} />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hours by Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillChart hoursBySkill={stats.hoursBySkill} />
            </CardContent>
          </Card>

          <MilestoneCountdown
            milestone={stats.nextMilestone}
            startDate={stats.startDate}
          />
        </div>
      </div>

      <QuickLogButton />
    </div>
  );
}
