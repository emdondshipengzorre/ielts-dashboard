"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SKILL_COLORS, SKILL_LABELS, type Skill } from "@/lib/types";
import { formatHours } from "@/lib/utils";

interface SkillChartProps {
  hoursBySkill: Record<string, number>;
}

export function SkillChart({ hoursBySkill }: SkillChartProps) {
  const data = Object.entries(hoursBySkill)
    .filter(([, hours]) => hours > 0)
    .map(([skill, hours]) => ({
      skill,
      hours,
      label: SKILL_LABELS[skill as Skill] ?? skill,
      color: SKILL_COLORS[skill as Skill] ?? "hsl(0, 0%, 60%)",
    }));

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No sessions logged yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="hours"
              nameKey="label"
            >
              {data.map((entry) => (
                <Cell key={entry.skill} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatHours(Number(value)), "Hours"]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">
            {formatHours(totalHours)}
          </span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry) => (
          <div key={entry.skill} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
