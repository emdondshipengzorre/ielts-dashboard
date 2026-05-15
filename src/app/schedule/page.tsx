"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeeklyChecklist } from "@/components/schedule/weekly-checklist";
import { DailyPlanWidget } from "@/components/dashboard/daily-plan";
import { db } from "@/lib/storage";
import { seedDatabase } from "@/lib/seed";
import { type Location } from "@/lib/types";
import { getWeekStart } from "@/lib/utils";
import { toggleCheckoffWithAutoLog } from "@/lib/hooks/use-schedule";
import { useAnki } from "@/lib/hooks/use-anki";
import { useDailyPlan } from "@/lib/hooks/use-daily-plan";

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${fmt(start)} – ${fmt(end)}`;
}


export default function SchedulePage() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const [activeTab, setActiveTab] = useState<string>("manila");
  const weekStart = getWeekStart(new Date());

  const { stats: ankiStats } = useAnki();
  const { plan, isLoading: planLoading, error: planError, regenerate, toggleTask } = useDailyPlan(ankiStats);

  // Derive activeLocation from tab for schedule queries
  const activeLocation: Location = activeTab === "beijing" ? "beijing" : "manila";

  const scheduleItems = useLiveQuery(
    () =>
      db.scheduleItems
        .where("location")
        .equals(activeLocation)
        .toArray(),
    [activeLocation]
  ) ?? [];

  const weeklyCheckoffs = useLiveQuery(
    () =>
      db.weeklyCheckoffs
        .where("weekStart")
        .equals(weekStart)
        .toArray(),
    [weekStart]
  ) ?? [];

  const totalItems = scheduleItems.length;
  const completedItems = weeklyCheckoffs.filter(
    (c) =>
      c.completed &&
      scheduleItems.some((i) => i.id === c.scheduleItemId)
  ).length;

  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const dailyPlanTotal = plan?.tasks.length ?? 0;
  const dailyPlanCompleted = plan?.completedTasks?.length ?? 0;
  const dailyPlanPct = dailyPlanTotal > 0 ? Math.round((dailyPlanCompleted / dailyPlanTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Weekly Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Week of {formatWeekRange(weekStart)}
          </p>
        </div>

        {/* Progress card */}
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="space-y-2">
              {activeTab === "daily-plan" ? (
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Today&apos;s Plan Progress</CardTitle>
                  <span className="text-sm font-medium tabular-nums">
                    {dailyPlanCompleted} / {dailyPlanTotal} tasks
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">This Week&apos;s Progress</CardTitle>
                  <span className="text-sm font-medium tabular-nums">
                    {completedItems} / {totalItems} tasks
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Progress value={activeTab === "daily-plan" ? dailyPlanPct : progressPct} />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="daily-plan">Today&apos;s Plan</TabsTrigger>
            <TabsTrigger value="manila">Manila Week</TabsTrigger>
            <TabsTrigger value="beijing">Beijing Week</TabsTrigger>
          </TabsList>

          <TabsContent value="daily-plan">
            <div className="mt-4">
              <DailyPlanWidget
                plan={plan}
                isLoading={planLoading}
                error={planError}
                onRegenerate={regenerate}
                onToggleTask={toggleTask}
              />
            </div>
          </TabsContent>

          <TabsContent value="manila">
            <Card className="mt-4">
              <CardContent className="pt-4">
                <WeeklyChecklist
                  items={scheduleItems}
                  checkoffs={weeklyCheckoffs}
                  onToggle={toggleCheckoffWithAutoLog}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beijing">
            <Card className="mt-4">
              <CardContent className="pt-4">
                <WeeklyChecklist
                  items={scheduleItems}
                  checkoffs={weeklyCheckoffs}
                  onToggle={toggleCheckoffWithAutoLog}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
