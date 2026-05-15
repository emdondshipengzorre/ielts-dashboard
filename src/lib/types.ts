export const SKILLS = [
  "listening", "speaking", "reading", "writing",
  "vocabulary", "grammar", "mock-test", "tutor-session",
] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<Skill, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  "mock-test": "Mock Test",
  "tutor-session": "Tutor Session",
};

export const SKILL_COLORS: Record<Skill, string> = {
  listening: "hsl(210, 80%, 60%)",
  speaking: "hsl(150, 70%, 50%)",
  reading: "hsl(270, 70%, 60%)",
  writing: "hsl(30, 90%, 55%)",
  vocabulary: "hsl(60, 80%, 50%)",
  grammar: "hsl(340, 75%, 55%)",
  "mock-test": "hsl(0, 70%, 55%)",
  "tutor-session": "hsl(200, 60%, 50%)",
};

export const LOCATIONS = ["manila", "beijing"] as const;
export type Location = (typeof LOCATIONS)[number];

export const LOCATION_LABELS: Record<Location, string> = {
  manila: "Manila",
  beijing: "Beijing",
};

export const PHASES = [1, 2, 3, 4] as const;
export type Phase = (typeof PHASES)[number];

export const PHASE_LABELS: Record<Phase, string> = {
  1: "Foundation",
  2: "Intermediate",
  3: "IELTS Prep",
  4: "Test Ready",
};

export const PHASE_MONTH_RANGES: Record<Phase, [number, number]> = {
  1: [1, 12],
  2: [13, 20],
  3: [21, 26],
  4: [27, 30],
};

export interface StudySession {
  id: string;
  date: string;
  skill: Skill;
  activity: string;
  hours: number;
  location: Location;
  phase: Phase;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sourceCheckoffId?: string;
  sourceDailyPlan?: string;  // ISO date string of the daily plan this came from
}

export interface Milestone {
  id: string;
  month: number;
  phase: Phase;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  skill: Skill;
  activity: string;
  targetHours: number;
  location: Location;
}

export interface WeeklyCheckoff {
  id: string;
  weekStart: string;
  scheduleItemId: string;
  completed: boolean;
  completedAt?: string;
}

export interface PlanConfig {
  startDate: string;
  totalTargetHours: number;
  totalMonths: number;
  weeklyTargetHours: number;
}

export interface DailyTask {
  time: string;
  skill: Skill;
  activity: string;
  duration: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface DailyPlan {
  greeting: string;
  tasks: DailyTask[];
  ankiReminder?: string;
  motivationalNote: string;
  totalPlannedHours: number;
  generatedAt: string;
  completedTasks?: number[];  // indices of completed tasks
}

export interface AnkiStats {
  isConnected: boolean;
  dueCards: number;
  reviewedToday: number;
  retentionPercent: number;
  decks: string[];
}
