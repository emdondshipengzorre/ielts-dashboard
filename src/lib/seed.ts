import { db } from "./storage";
import { MILESTONES_SEED, MANILA_SCHEDULE, BEIJING_SCHEDULE } from "./constants";

/**
 * Populate the database with seed data if the relevant tables are empty.
 * Safe to call on every app start — it is idempotent.
 */
export async function seedDatabase(): Promise<void> {
  await seedMilestones();
  await seedScheduleItems();
}

async function seedMilestones(): Promise<void> {
  const count = await db.milestones.count();
  if (count > 0) return;

  const records = MILESTONES_SEED.map((m) => ({
    ...m,
    id: crypto.randomUUID(),
  }));

  await db.milestones.bulkAdd(records);
}

async function seedScheduleItems(): Promise<void> {
  const count = await db.scheduleItems.count();
  if (count > 0) return;

  const allItems = [...MANILA_SCHEDULE, ...BEIJING_SCHEDULE].map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }));

  await db.scheduleItems.bulkAdd(allItems);
}
