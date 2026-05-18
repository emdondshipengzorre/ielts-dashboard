"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { db } from "@/lib/storage";
import { seedDatabase } from "@/lib/seed";
import { getPlanConfig, formatHours, getWeekStart } from "@/lib/utils";
import { SKILLS, SKILL_LABELS, SKILL_COLORS, LOCATION_LABELS } from "@/lib/types";
import type { Location } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const data = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray();
    const config = getPlanConfig();

    const hoursBySkill: Record<string, number> = {};
    for (const skill of SKILLS) hoursBySkill[skill] = 0;

    const hoursByLocation: Record<string, number> = { manila: 0, beijing: 0 };
    const hoursByMonth: Record<string, number> = {};

    for (const s of sessions) {
      hoursBySkill[s.skill] = (hoursBySkill[s.skill] ?? 0) + s.hours;
      hoursByLocation[s.location] = (hoursByLocation[s.location] ?? 0) + s.hours;
      const month = s.date.slice(0, 7);
      hoursByMonth[month] = (hoursByMonth[month] ?? 0) + s.hours;
    }

    const sortedMonths = Object.keys(hoursByMonth).sort();
    let cumulative = 0;
    const cumulativeData = sortedMonths.map((month) => {
      cumulative += hoursByMonth[month];
      const monthIndex = sortedMonths.indexOf(month);
      const targetAtMonth =
        (config.totalTargetHours / config.totalMonths) * (monthIndex + 1);
      return { month, actual: Math.round(cumulative * 10) / 10, target: Math.round(targetAtMonth) };
    });

    const weeklyMap: Record<string, number> = {};
    for (const s of sessions) {
      const ws = getWeekStart(new Date(s.date));
      weeklyMap[ws] = (weeklyMap[ws] ?? 0) + s.hours;
    }
    const sortedWeeks = Object.keys(weeklyMap).sort();
    const last12Weeks = sortedWeeks.slice(-12);
    const weeklyData = last12Weeks.map((ws) => ({
      week: ws.slice(5),
      hours: Math.round(weeklyMap[ws] * 10) / 10,
    }));

    const skillData = SKILLS.filter((s) => (hoursBySkill[s] ?? 0) > 0).map((s) => ({
      name: SKILL_LABELS[s],
      value: hoursBySkill[s],
      color: SKILL_COLORS[s],
    }));

    const today = new Date();
    const dailyHistory: Record<string, Record<string, number>>[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry: Record<string, number> = {};
      for (const skill of SKILLS) entry[skill] = 0;
      for (const s of sessions) {
        if (s.date === dateStr) {
          entry[s.skill] = (entry[s.skill] ?? 0) + s.hours;
        }
      }
      dailyHistory.push({ date: dateStr, label: `${d.getMonth() + 1}/${d.getDate()}`, ...entry } as any);
    }
    const activeSkillsInHistory = SKILLS.filter((skill) =>
      dailyHistory.some((d: any) => (d[skill] ?? 0) > 0)
    );

    return {
      cumulativeData,
      weeklyData,
      skillData,
      hoursByLocation,
      weeklyTarget: config.weeklyTargetHours,
      totalHours: sessions.reduce((sum, s) => sum + s.hours, 0),
      dailyHistory: dailyHistory as any[],
      activeSkillsInHistory,
    };
  });

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--card-foreground))",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col gap-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {formatHours(data.totalHours)} total study hours
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cumulative Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {data.cumulativeData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Log study sessions to see your progress.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    fill="none"
                    strokeDasharray="5 5"
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(210, 80%, 60%)"
                    fill="hsl(210, 80%, 60%)"
                    fillOpacity={0.15}
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {data.weeklyData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No weekly data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine
                    y={data.weeklyTarget}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ value: `${data.weeklyTarget}h target`, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Bar dataKey="hours" name="Hours" radius={[4, 4, 0, 0]}>
                    {data.weeklyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.hours >= data.weeklyTarget
                            ? "hsl(150, 70%, 50%)"
                            : "hsl(45, 90%, 55%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Daily Study History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Study History</CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyHistory.every((d: any) => data.activeSkillsInHistory.every((s) => d[s] === 0)) ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No study data in the last 28 days.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    interval={Math.floor(data.dailyHistory.length / 7) - 1}
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="h" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [
                      `${value}h`,
                      SKILL_LABELS[name as keyof typeof SKILL_LABELS] ?? name,
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend
                    formatter={(value) => SKILL_LABELS[value as keyof typeof SKILL_LABELS] ?? value}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  {data.activeSkillsInHistory.map((skill) => (
                    <Bar
                      key={skill}
                      dataKey={skill}
                      stackId="daily"
                      fill={SKILL_COLORS[skill]}
                      radius={0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.skillData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.skillData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="75%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.skillData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatHours(Number(value)), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Location Split */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(["manila", "beijing"] as Location[]).map((loc) => (
                <div key={loc} className="flex flex-col items-center gap-1 rounded-lg border p-4">
                  <span className="text-2xl font-bold tabular-nums">
                    {formatHours(data.hoursByLocation[loc] ?? 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {LOCATION_LABELS[loc]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
