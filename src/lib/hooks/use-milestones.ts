"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";

export function useMilestones() {
  const milestones = useLiveQuery(
    () => db.milestones.orderBy("month").toArray(),
    []
  );

  async function toggleMilestone(id: string) {
    const milestone = await db.milestones.get(id);
    if (!milestone) return;

    const nowCompleted = !milestone.completed;
    await db.milestones.update(id, {
      completed: nowCompleted,
      completedAt: nowCompleted ? new Date().toISOString() : undefined,
    });
  }

  return { milestones, toggleMilestone };
}
