import { WRITING_TASK1, WRITING_TASK2, type VocabCard } from "./writing";
import { SPEAKING_PHRASES, COLLOCATIONS } from "./speaking";
import {
  TOPIC_EDUCATION,
  TOPIC_ENVIRONMENT,
  TOPIC_TECHNOLOGY,
  TOPIC_HEALTH,
  TOPIC_SOCIETY,
  TOPIC_ECONOMY,
  TOPIC_CRIME,
  TOPIC_MEDIA,
  TOPIC_CULTURE,
  TOPIC_GOVERNMENT,
} from "./topics";
import {
  AWL_SUBLIST_1,
  AWL_SUBLIST_2,
  AWL_SUBLIST_3,
  AWL_SUBLIST_4,
  AWL_SUBLIST_5,
  AWL_SUBLIST_6_10,
} from "./awl";

export type { VocabCard };

export interface DeckDefinition {
  name: string;
  cards: VocabCard[];
  tags: string[];
}

export const IELTS_DECKS: DeckDefinition[] = [
  { name: "IELTS::Writing-Task1", cards: WRITING_TASK1, tags: ["ielts", "writing", "task1"] },
  { name: "IELTS::Writing-Task2", cards: WRITING_TASK2, tags: ["ielts", "writing", "task2"] },
  { name: "IELTS::Speaking", cards: SPEAKING_PHRASES, tags: ["ielts", "speaking"] },
  { name: "IELTS::Collocations", cards: COLLOCATIONS, tags: ["ielts", "collocations"] },
  { name: "IELTS::Topics-Education", cards: TOPIC_EDUCATION, tags: ["ielts", "topics", "education"] },
  { name: "IELTS::Topics-Environment", cards: TOPIC_ENVIRONMENT, tags: ["ielts", "topics", "environment"] },
  { name: "IELTS::Topics-Technology", cards: TOPIC_TECHNOLOGY, tags: ["ielts", "topics", "technology"] },
  { name: "IELTS::Topics-Health", cards: TOPIC_HEALTH, tags: ["ielts", "topics", "health"] },
  { name: "IELTS::Topics-Society", cards: TOPIC_SOCIETY, tags: ["ielts", "topics", "society"] },
  { name: "IELTS::Topics-Economy", cards: TOPIC_ECONOMY, tags: ["ielts", "topics", "economy"] },
  { name: "IELTS::Topics-Crime", cards: TOPIC_CRIME, tags: ["ielts", "topics", "crime"] },
  { name: "IELTS::Topics-Media", cards: TOPIC_MEDIA, tags: ["ielts", "topics", "media"] },
  { name: "IELTS::Topics-Culture", cards: TOPIC_CULTURE, tags: ["ielts", "topics", "culture"] },
  { name: "IELTS::Topics-Government", cards: TOPIC_GOVERNMENT, tags: ["ielts", "topics", "government"] },
  { name: "IELTS::AWL-1", cards: AWL_SUBLIST_1, tags: ["ielts", "awl", "sublist1"] },
  { name: "IELTS::AWL-2", cards: AWL_SUBLIST_2, tags: ["ielts", "awl", "sublist2"] },
  { name: "IELTS::AWL-3", cards: AWL_SUBLIST_3, tags: ["ielts", "awl", "sublist3"] },
  { name: "IELTS::AWL-4", cards: AWL_SUBLIST_4, tags: ["ielts", "awl", "sublist4"] },
  { name: "IELTS::AWL-5", cards: AWL_SUBLIST_5, tags: ["ielts", "awl", "sublist5"] },
  { name: "IELTS::AWL-6-10", cards: AWL_SUBLIST_6_10, tags: ["ielts", "awl", "sublist6-10"] },
];

export function getTotalCardCount(): number {
  return IELTS_DECKS.reduce((sum, d) => sum + d.cards.length, 0);
}
