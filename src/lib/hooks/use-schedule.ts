"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";
import type { Location } from "@/lib/types";
import { getWeekStart, getPlanConfig, getCurrentPhase } from "@/lib/utils";

export async function toggleCheckoffWithAutoLog(scheduleItemId: string) {
  const weekStart = getWeekStart(new Date());
  const scheduleItem = await db.scheduleItems.get(scheduleItemId);
  if (!scheduleItem) return;

  const existing = await db.weeklyCheckoffs
    .where("[weekStart+scheduleItemId]")
    .equals([weekStart, scheduleItemId])
    .first();

  const now = new Date().toISOString();
  const config = getPlanConfig();
  const currentPhase = getCurrentPhase(config.startDate);

  if (existing) {
    const nowCompleted = !existing.completed;
    await db.transaction("rw", db.weeklyCheckoffs, db.sessions, async () => {
      await db.weeklyCheckoffs.update(existing.id, {
        completed: nowCompleted,
        completedAt: nowCompleted ? now : undefined,
      });

      if (nowCompleted) {
        await db.sessions.add({
          id: crypto.randomUUID(),
          date: new Date().toISOString().slice(0, 10),
          skill: scheduleItem.skill,
          activity: scheduleItem.activity,
          hours: scheduleItem.targetHours,
          location: scheduleItem.location,
          phase: currentPhase,
          sourceCheckoffId: existing.id,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const autoSession = await db.sessions
          .where("sourceCheckoffId")
          .equals(existing.id)
          .first();
        if (autoSession) await db.sessions.delete(autoSession.id);
      }
    });
  } else {
    const checkoffId = crypto.randomUUID();
    await db.transaction("rw", db.weeklyCheckoffs, db.sessions, async () => {
      await db.weeklyCheckoffs.add({
        id: checkoffId,
        weekStart,
        scheduleItemId,
        completed: true,
        completedAt: now,
      });

      await db.sessions.add({
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        skill: scheduleItem.skill,
        activity: scheduleItem.activity,
        hours: scheduleItem.targetHours,
        location: scheduleItem.location,
        phase: currentPhase,
        sourceCheckoffId: checkoffId,
        createdAt: now,
        updatedAt: now,
      });
    });
  }
}

export function useSchedule(location: Location) {
  const weekStart = getWeekStart(new Date());

  const items = useLiveQuery(
    () => db.scheduleItems.where("location").equals(location).toArray(),
    [location]
  );

  const checkoffs = useLiveQuery(
    () => db.weeklyCheckoffs.where("weekStart").equals(weekStart).toArray(),
    [weekStart]
  );

  const totalCount = items?.length ?? 0;
  const completedCount =
    checkoffs?.filter((c) => c.completed).length ?? 0;

  return {
    items: items ?? [],
    checkoffs: checkoffs ?? [],
    toggleCheckoff: toggleCheckoffWithAutoLog,
    completedCount,
    totalCount,
  };
}
