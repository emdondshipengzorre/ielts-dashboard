import type { Skill } from "./types";

export interface StudyMaterial {
  url?: string;
  label: string;
  instructions: string;
  phase?: number[];
}

type MaterialKey = string;

const MATERIALS: Record<MaterialKey, StudyMaterial> = {
  "bbc-6min": {
    url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
    label: "BBC 6 Minute English",
    instructions: "Listen to the latest episode. Note 3 new words. Try to summarize the topic in 2-3 sentences after listening.",
  },
  "anki-new": {
    label: "Anki — New Words",
    instructions: "Add 10 new words from today's study. Include example sentences. Review all due cards.",
  },
  "anki-review": {
    label: "Anki Review",
    instructions: "Complete all due reviews. Aim for 90%+ retention. Flag difficult cards for extra practice.",
  },
  "anki-catchup": {
    label: "Anki Catch-up",
    instructions: "Clear all overdue reviews. Re-study any lapsed cards. Add words from this week's activities.",
  },
  "english-file": {
    url: "https://elt.oup.com/student/englishfile/",
    label: "English File Textbook",
    instructions: "Work through the current unit. Complete grammar exercises and vocabulary sections. Check answers in the back.",
    phase: [1, 2],
  },
  "english-file-next": {
    url: "https://elt.oup.com/student/englishfile/",
    label: "English File — Next Unit",
    instructions: "Start the next unit. Focus on grammar rules first, then do the practice exercises.",
    phase: [1, 2],
  },
  "english-file-grammar": {
    url: "https://elt.oup.com/student/englishfile/",
    label: "English File — Grammar Exercises",
    instructions: "Complete the grammar review section. Write out the rules in your own words.",
    phase: [1, 2],
  },
  "english-file-ls": {
    url: "https://elt.oup.com/student/englishfile/",
    label: "English File — Listening & Speaking",
    instructions: "Do the listening exercises in the current unit. Practice the speaking prompts by recording yourself.",
    phase: [1, 2],
  },
  "italki": {
    url: "https://www.italki.com/dashboard",
    label: "italki Tutor Session",
    instructions: "Prepare 2-3 topics to discuss. Write down new corrections after the session. Review grammar points covered.",
  },
  "aiep-group": {
    label: "AIEP Group Class",
    instructions: "Attend the group class. Take notes on new grammar patterns. Ask at least one question during class.",
  },
  "aiep-writing": {
    label: "AIEP Group Class — Writing",
    instructions: "Focus on the writing task assigned. Practice paragraph structure: topic sentence, supporting details, conclusion.",
  },
  "oxford-bookworms": {
    url: "https://elt.oup.com/cat/subjects/graded_readers/",
    label: "Oxford Bookworms Graded Reader",
    instructions: "Read for 15-20 minutes. Underline unknown words (look up max 5). Write a 2-sentence summary of what you read.",
    phase: [1, 2],
  },
  "voa-news": {
    url: "https://learningenglish.voanews.com/",
    label: "VOA Learning English",
    instructions: "Listen to a slow news story. Read the transcript after. Note 3 new words and their context.",
  },
  "youtube-netflix": {
    label: "English YouTube / Netflix",
    instructions: "Watch with English subtitles. Pause to repeat difficult phrases. Note interesting expressions.",
  },
  "weekly-writing": {
    label: "Weekly Writing Practice",
    instructions: "Write a short paragraph (100-150 words) about your week. Focus on past tense and linking words. Time yourself: 15 minutes max.",
    phase: [1],
  },
  "cambridge-practice": {
    url: "https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/",
    label: "Cambridge IELTS Practice Test",
    instructions: "Complete one full section under timed conditions. Review all wrong answers. Note question patterns.",
    phase: [2, 3, 4],
  },
  "ielts-writing-task1": {
    url: "https://www.ielts.org/for-test-takers/test-format",
    label: "IELTS Writing Task 1",
    instructions: "Practice describing a chart/graph/table in 150+ words. Time: 20 minutes. Check for range of vocabulary and grammar accuracy.",
    phase: [3, 4],
  },
  "ielts-writing-task2": {
    url: "https://www.ielts.org/for-test-takers/test-format",
    label: "IELTS Writing Task 2",
    instructions: "Write a 250+ word essay on a practice topic. Time: 40 minutes. Focus on argument structure and cohesion.",
    phase: [3, 4],
  },
  "ielts-speaking": {
    label: "IELTS Speaking Practice",
    instructions: "Practice Part 1 (4-5 min intro questions), Part 2 (2-min monologue with 1 min prep), Part 3 (discussion). Record yourself.",
    phase: [3, 4],
  },
};

const ACTIVITY_MATERIAL_MAP: Record<string, MaterialKey> = {
  "BBC 6 Minute English — commute": "bbc-6min",
  "Anki — 10 new words + review": "anki-new",
  "Anki review": "anki-review",
  "Anki catch-up": "anki-catchup",
  "English File textbook": "english-file",
  "English File textbook — next unit": "english-file-next",
  "English File — grammar exercises": "english-file-grammar",
  "English File — listening + speaking": "english-file-ls",
  "italki tutor — conversation + grammar": "italki",
  "AIEP group class": "aiep-group",
  "AIEP group class — writing": "aiep-writing",
  "Graded reader — Oxford Bookworms": "oxford-bookworms",
  "VOA Learning English — slow news": "voa-news",
  "English YouTube/Netflix with subtitles": "youtube-netflix",
  "Write a short paragraph about the week": "weekly-writing",
};

export function getMaterial(activity: string): StudyMaterial | null {
  const key = ACTIVITY_MATERIAL_MAP[activity];
  if (!key) return null;
  return MATERIALS[key] ?? null;
}

export function getMaterialBySkill(skill: Skill, phase?: number): StudyMaterial[] {
  return Object.values(MATERIALS).filter((m) => {
    if (m.phase && phase && !m.phase.includes(phase)) return false;
    return true;
  });
}
