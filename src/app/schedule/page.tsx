"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeeklyChecklist } from "@/components/schedule/weekly-checklist";
import { db } from "@/lib/storage";
import { seedDatabase } from "@/lib/seed";
import { type Location } from "@/lib/types";
import { getWeekStart } from "@/lib/utils";
import { toggleCheckoffWithAutoLog } from "@/lib/hooks/use-schedule";

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

  const [activeLocation, setActiveLocation] = useState<Location>("manila");
  const weekStart = getWeekStart(new Date());

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">This Week&apos;s Progress</CardTitle>
              <span className="text-sm font-medium tabular-nums">
                {completedItems} / {totalItems} tasks
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Progress value={progressPct} />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeLocation}
          onValueChange={(v) => setActiveLocation(v as Location)}
        >
          <TabsList>
            <TabsTrigger value="manila">Manila Week</TabsTrigger>
            <TabsTrigger value="beijing">Beijing Week</TabsTrigger>
          </TabsList>

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
