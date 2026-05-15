"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  progress?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, progress }: StatCardProps) {
  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-2", progress !== undefined ? "pb-2" : "")}>
        <p className="text-3xl font-bold tabular-nums leading-none">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        {progress !== undefined && (
          <Progress value={progress} className="mt-1" />
        )}
      </CardContent>
    </Card>
  );
}
