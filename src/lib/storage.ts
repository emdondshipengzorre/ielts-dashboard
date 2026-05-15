import Dexie, { type EntityTable } from "dexie";
import type { StudySession, Milestone, ScheduleItem, WeeklyCheckoff } from "./types";

class IeltsDatabase extends Dexie {
  sessions!: EntityTable<StudySession, "id">;
  milestones!: EntityTable<Milestone, "id">;
  scheduleItems!: EntityTable<ScheduleItem, "id">;
  weeklyCheckoffs!: EntityTable<WeeklyCheckoff, "id">;

  constructor() {
    super("ielts-dashboard");
    this.version(1).stores({
      sessions: "id, date, skill, location, phase, createdAt",
      milestones: "id, month, phase, completed",
      scheduleItems: "id, dayOfWeek, location",
      weeklyCheckoffs: "id, weekStart, scheduleItemId, [weekStart+scheduleItemId]",
    });
    this.version(2).stores({
      sessions: "id, date, skill, location, phase, createdAt, sourceCheckoffId",
      milestones: "id, month, phase, completed",
      scheduleItems: "id, dayOfWeek, location",
      weeklyCheckoffs: "id, weekStart, scheduleItemId, [weekStart+scheduleItemId]",
    });
    this.version(3).stores({
      sessions: "id, date, skill, location, phase, createdAt, sourceCheckoffId, sourceDailyPlan",
      milestones: "id, month, phase, completed",
      scheduleItems: "id, dayOfWeek, location",
      weeklyCheckoffs: "id, weekStart, scheduleItemId, [weekStart+scheduleItemId]",
    });
  }
}

export const db = new IeltsDatabase();
