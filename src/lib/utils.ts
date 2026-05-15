import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Phase, PlanConfig, StudySession } from "./types";
import { PHASE_MONTH_RANGES, PHASES } from "./types";

// ---------------------------------------------------------------------------
// Tailwind class merging
// ---------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Plan config (persisted in localStorage)
// ---------------------------------------------------------------------------

const PLAN_CONFIG_KEY = "ielts:planConfig";

const DEFAULT_PLAN_CONFIG: PlanConfig = {
  startDate: new Date().toISOString().slice(0, 10),
  totalTargetHours: 1250,
  totalMonths: 30,
  weeklyTargetHours: 10,
};

export function getPlanConfig(): PlanConfig {
  if (typeof window === "undefined") return DEFAULT_PLAN_CONFIG;

  const raw = localStorage.getItem(PLAN_CONFIG_KEY);
  if (!raw) return DEFAULT_PLAN_CONFIG;

  try {
    return JSON.parse(raw) as PlanConfig;
  } catch {
    return DEFAULT_PLAN_CONFIG;
  }
}

export function setPlanConfig(config: PlanConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_CONFIG_KEY, JSON.stringify(config));
}

// ---------------------------------------------------------------------------
// Date / phase helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of whole months elapsed since `startDate` (ISO date string).
 * Month 1 = the calendar month of startDate.
 * Returns at least 1 so callers never have to handle 0.
 */
export function getElapsedMonths(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();

  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const elapsed = years * 12 + months;

  // Add 1 because month 1 is the first calendar month, not month 0.
  return Math.max(1, elapsed + 1);
}

/**
 * Returns the current study phase based on elapsed months and PHASE_MONTH_RANGES.
 * Clamps to phase 4 if beyond the plan end.
 */
export function getCurrentPhase(startDate: string): Phase {
  const elapsed = getElapsedMonths(startDate);

  for (const phase of PHASES) {
    const [min, max] = PHASE_MONTH_RANGES[phase];
    if (elapsed >= min && elapsed <= max) return phase;
  }

  // Beyond the last phase — return phase 4.
  return 4;
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the week
 * containing `date`.
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  // getDay() returns 0 (Sun) … 6 (Sat). We want Monday = 0 offset.
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Formats a decimal hour value into a human-readable string.
 * Examples: 1.5 → "1h 30m", 0.5 → "30m", 2 → "2h", 0.33 → "20m"
 */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// ---------------------------------------------------------------------------
// Streak computation
// ---------------------------------------------------------------------------

/**
 * Returns the number of consecutive calendar days (ending today or yesterday)
 * on which at least one study session was logged.
 *
 * - If the most recent session date is neither today nor yesterday, streak = 0.
 * - Sessions are assumed to have an ISO `date` field (YYYY-MM-DD).
 */
export function computeStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;

  // Collect unique study dates as a Set<string> for O(1) lookup.
  const studiedDates = new Set(sessions.map((s) => s.date.slice(0, 10)));

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const isoOf = (d: Date) => d.toISOString().slice(0, 10);

  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const today = isoOf(todayDate);
  const yest = isoOf(yesterday);

  // Streak must end today or yesterday; otherwise it has already been broken.
  if (!studiedDates.has(today) && !studiedDates.has(yest)) return 0;

  // Walk backwards from today until we find a day with no session.
  const cursor = new Date(todayDate);
  let streak = 0;

  while (true) {
    const dateStr = isoOf(cursor);
    if (!studiedDates.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
