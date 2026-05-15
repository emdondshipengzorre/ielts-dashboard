import type { Milestone, ScheduleItem } from "./types";

// ---------------------------------------------------------------------------
// Milestones seed data
// ---------------------------------------------------------------------------

export const MILESTONES_SEED: Omit<Milestone, "id">[] = [
  {
    month: 3,
    phase: 1,
    title: "Basic Conversation",
    description:
      "Can order food, ask directions, and introduce yourself in English",
    completed: false,
  },
  {
    month: 6,
    phase: 1,
    title: "Foundation Check",
    description:
      "Hold a 5-min conversation, understand BBC 6 Minute English, know 800+ words",
    completed: false,
  },
  {
    month: 12,
    phase: 1,
    title: "B1 Level Reached",
    description:
      "Hold 15-min conversation, write 150-word paragraph, 2,000+ vocabulary, B1 on British Council test",
    completed: false,
  },
  {
    month: 16,
    phase: 2,
    title: "First Mock Test",
    description: "IELTS mock test score 5.0–5.5 overall",
    completed: false,
  },
  {
    month: 20,
    phase: 2,
    title: "Second Mock Test",
    description: "IELTS mock test score 5.5–6.0, Writing 5.5+",
    completed: false,
  },
  {
    month: 23,
    phase: 3,
    title: "Third Mock Test",
    description: "Mock test score 6.0–6.5 overall, Writing 6.0+",
    completed: false,
  },
  {
    month: 26,
    phase: 3,
    title: "Fourth Mock Test",
    description: "Mock test score 6.5+, no section below 6.0",
    completed: false,
  },
  {
    month: 29,
    phase: 4,
    title: "First Real Exam",
    description: "Take IELTS Academic exam, target Band 7.0+",
    completed: false,
  },
  {
    month: 30,
    phase: 4,
    title: "Target Achieved",
    description: "Band 7.0+ confirmed, or retake with targeted prep",
    completed: false,
  },
];

// ---------------------------------------------------------------------------
// Weekly schedule seed data
// dayOfWeek: 1 = Monday … 7 = Sunday (ISO convention)
// ---------------------------------------------------------------------------

// Helper to build a ScheduleItem without requiring the caller to supply an id.
function item(
  dayOfWeek: number,
  skill: ScheduleItem["skill"],
  activity: string,
  targetHours: number,
  location: ScheduleItem["location"],
): Omit<ScheduleItem, "id"> {
  return { dayOfWeek, skill, activity, targetHours, location };
}

export const MANILA_SCHEDULE: Omit<ScheduleItem, "id">[] = [
  // Monday
  item(1, "listening",      "BBC 6 Minute English — commute",             0.5,  "manila"),
  item(1, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "manila"),
  item(1, "vocabulary",     "Anki — 10 new words + review",               0.33, "manila"),
  item(1, "grammar",        "English File textbook",                       0.5,  "manila"),
  // Tuesday
  item(2, "listening",      "BBC 6 Minute English — commute",             0.5,  "manila"),
  item(2, "grammar",        "AIEP group class",                            1.5,  "manila"),
  item(2, "vocabulary",     "Anki review",                                 0.33, "manila"),
  // Wednesday
  item(3, "listening",      "BBC 6 Minute English — commute",             0.5,  "manila"),
  item(3, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "manila"),
  item(3, "vocabulary",     "Anki review",                                 0.33, "manila"),
  item(3, "reading",        "Graded reader — Oxford Bookworms",           0.25, "manila"),
  // Thursday
  item(4, "listening",      "BBC 6 Minute English — commute",             0.5,  "manila"),
  item(4, "writing",        "AIEP group class — writing",                 1.5,  "manila"),
  item(4, "vocabulary",     "Anki review",                                 0.33, "manila"),
  // Friday
  item(5, "listening",      "BBC 6 Minute English — commute",             0.5,  "manila"),
  item(5, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "manila"),
  item(5, "vocabulary",     "Anki review",                                 0.33, "manila"),
  item(5, "reading",        "Graded reader — Oxford Bookworms",           0.25, "manila"),
  // Saturday
  item(6, "vocabulary",     "Anki review",                                 0.33, "manila"),
  item(6, "writing",        "Write a short paragraph about the week",     0.5,  "manila"),
  item(6, "grammar",        "English File textbook — next unit",           1.0,  "manila"),
  // Sunday
  item(7, "vocabulary",     "Anki catch-up",                               0.33, "manila"),
  item(7, "listening",      "English YouTube/Netflix with subtitles",      0.5,  "manila"),
];

export const BEIJING_SCHEDULE: Omit<ScheduleItem, "id">[] = [
  // Monday
  item(1, "listening",      "BBC 6 Minute English — commute",             0.5,  "beijing"),
  item(1, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "beijing"),
  item(1, "vocabulary",     "Anki — 10 new words + review",               0.33, "beijing"),
  item(1, "grammar",        "English File textbook",                       0.5,  "beijing"),
  // Tuesday
  item(2, "listening",      "BBC 6 Minute English — commute",             0.5,  "beijing"),
  item(2, "grammar",        "English File — grammar exercises",            0.75, "beijing"),
  item(2, "vocabulary",     "Anki review",                                 0.33, "beijing"),
  item(2, "reading",        "Graded reader — Oxford Bookworms",           0.25, "beijing"),
  // Wednesday
  item(3, "listening",      "BBC 6 Minute English — commute",             0.5,  "beijing"),
  item(3, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "beijing"),
  item(3, "vocabulary",     "Anki review",                                 0.33, "beijing"),
  item(3, "listening",      "VOA Learning English — slow news",           0.25, "beijing"),
  // Thursday
  item(4, "listening",      "BBC 6 Minute English — commute",             0.5,  "beijing"),
  item(4, "grammar",        "English File — listening + speaking",         0.75, "beijing"),
  item(4, "vocabulary",     "Anki review",                                 0.33, "beijing"),
  item(4, "reading",        "Graded reader — Oxford Bookworms",           0.25, "beijing"),
  // Friday
  item(5, "listening",      "BBC 6 Minute English — commute",             0.5,  "beijing"),
  item(5, "tutor-session",  "italki tutor — conversation + grammar",      0.75, "beijing"),
  item(5, "vocabulary",     "Anki review",                                 0.33, "beijing"),
  // Saturday
  item(6, "vocabulary",     "Anki review",                                 0.33, "beijing"),
  item(6, "writing",        "Write a short paragraph about the week",     0.5,  "beijing"),
  item(6, "grammar",        "English File textbook — next unit",           1.0,  "beijing"),
  // Sunday
  item(7, "vocabulary",     "Anki catch-up",                               0.33, "beijing"),
  item(7, "listening",      "English YouTube/Netflix with subtitles",      0.5,  "beijing"),
];
