const ANKI_URL = "http://localhost:8765";

interface AnkiResponse<T> {
  result: T;
  error: string | null;
}

async function ankiInvoke<T>(action: string, params?: Record<string, unknown>): Promise<T> {
  const response = await fetch(ANKI_URL, {
    method: "POST",
    body: JSON.stringify({ action, version: 6, params }),
  });
  const data: AnkiResponse<T> = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export async function isAnkiRunning(): Promise<boolean> {
  try {
    await ankiInvoke("version");
    return true;
  } catch {
    return false;
  }
}

export async function getDeckNames(): Promise<string[]> {
  return ankiInvoke<string[]>("deckNames");
}

export async function getNumCardsReviewedToday(): Promise<number> {
  return ankiInvoke<number>("getNumCardsReviewedToday");
}

export async function findDueCards(deckName?: string): Promise<number> {
  const query = deckName ? `"deck:${deckName}" is:due` : "is:due";
  const cards = await ankiInvoke<number[]>("findCards", { query });
  return cards.length;
}

export async function getCollectionStats(): Promise<{ reviewCount: number; newCount: number }> {
  const stats = await ankiInvoke<Record<string, { review_count: number; new_count: number }>>("getDeckStats", { decks: ["Default"] });
  let reviewCount = 0;
  let newCount = 0;
  for (const deck of Object.values(stats)) {
    reviewCount += deck.review_count ?? 0;
    newCount += deck.new_count ?? 0;
  }
  return { reviewCount, newCount };
}

export async function createDeck(name: string): Promise<number> {
  return ankiInvoke<number>("createDeck", { deck: name });
}

export async function addNote(
  deckName: string,
  front: string,
  back: string,
  tags: string[] = [],
): Promise<number | null> {
  return ankiInvoke<number | null>("addNote", {
    note: {
      deckName,
      modelName: "Basic",
      fields: { Front: front, Back: back },
      tags,
    },
  });
}

export async function addNotes(
  deckName: string,
  cards: { front: string; back: string }[],
  tags: string[] = [],
): Promise<(number | null)[]> {
  const notes = cards.map((c) => ({
    deckName,
    modelName: "Basic",
    fields: { Front: c.front, Back: c.back },
    tags,
  }));
  return ankiInvoke<(number | null)[]>("addNotes", { notes });
}

export async function getModelNames(): Promise<string[]> {
  return ankiInvoke<string[]>("modelNames");
}

export interface AnkiDeckSetupResult {
  decksCreated: string[];
  cardsAdded: number;
  errors: string[];
}

const IELTS_STARTER_DECKS: Record<string, { front: string; back: string }[]> = {
  "IELTS::Phase1-Foundation": [
    { front: "Hello / Hi", back: "你好 — A common greeting" },
    { front: "Thank you", back: "谢谢 — Expressing gratitude" },
    { front: "Excuse me", back: "打扰一下 — Getting someone's attention" },
    { front: "How much is this?", back: "这个多少钱？ — Asking the price" },
    { front: "Where is the bathroom?", back: "洗手间在哪里？ — Asking for directions" },
    { front: "I don't understand", back: "我不明白 — When you need clarification" },
    { front: "Can you repeat that?", back: "你能重复一遍吗？ — Asking someone to repeat" },
    { front: "appointment", back: "预约 (n.) — a scheduled meeting. 'I have a doctor's appointment.'" },
    { front: "available", back: "可用的 (adj.) — free to use or meet. 'Is this seat available?'" },
    { front: "recommend", back: "推荐 (v.) — to suggest something good. 'Can you recommend a restaurant?'" },
    { front: "environment", back: "环境 (n.) — the natural world. 'We must protect the environment.'" },
    { front: "comfortable", back: "舒适的 (adj.) — providing ease. 'This chair is very comfortable.'" },
    { front: "experience", back: "经验/经历 (n.) — knowledge from doing something. 'I have work experience.'" },
    { front: "improve", back: "改善 (v.) — to make better. 'I want to improve my English.'" },
    { front: "opportunity", back: "机会 (n.) — a chance. 'This is a great opportunity.'" },
    { front: "describe", back: "描述 (v.) — to tell about something. 'Describe your hometown.'" },
    { front: "advantage", back: "优势 (n.) — a benefit. 'One advantage of living here is the weather.'" },
    { front: "disadvantage", back: "劣势 (n.) — a drawback. 'A disadvantage is the high cost.'" },
    { front: "significant", back: "重要的 (adj.) — important, meaningful. 'A significant change occurred.'" },
    { front: "approximately", back: "大约 (adv.) — about, roughly. 'Approximately 50% of students passed.'" },
  ],
  "IELTS::Phase2-Academic": [
    { front: "analyze / analyse", back: "分析 (v.) — to examine in detail. 'We need to analyze the data.'" },
    { front: "approach", back: "方法 (n./v.) — a way of dealing with something. 'A new approach to learning.'" },
    { front: "concept", back: "概念 (n.) — an abstract idea. 'The concept of freedom varies.'" },
    { front: "context", back: "背景/语境 (n.) — the setting or situation. 'Words change meaning in different contexts.'" },
    { front: "distribute", back: "分配 (v.) — to spread or give out. 'Distribute the resources equally.'" },
    { front: "establish", back: "建立 (v.) — to set up. 'The company was established in 2010.'" },
    { front: "factor", back: "因素 (n.) — an element contributing to a result. 'Cost is an important factor.'" },
    { front: "indicate", back: "表明 (v.) — to show or point out. 'The graph indicates a rise.'" },
    { front: "interpret", back: "解释 (v.) — to explain the meaning. 'How do you interpret these results?'" },
    { front: "method", back: "方法 (n.) — a way of doing something. 'The scientific method is systematic.'" },
    { front: "participate", back: "参与 (v.) — to take part. 'Students are encouraged to participate.'" },
    { front: "proportion", back: "比例 (n.) — a part relative to the whole. 'A large proportion of the budget...'" },
    { front: "respond", back: "回应 (v.) — to reply or react. 'Please respond to the email.'" },
    { front: "strategy", back: "策略 (n.) — a plan to achieve a goal. 'We need a new marketing strategy.'" },
    { front: "structure", back: "结构 (n./v.) — the arrangement of parts. 'The essay needs a clear structure.'" },
  ],
};

export async function setupIeltsDecks(): Promise<AnkiDeckSetupResult> {
  const result: AnkiDeckSetupResult = { decksCreated: [], cardsAdded: 0, errors: [] };

  for (const [deckName, cards] of Object.entries(IELTS_STARTER_DECKS)) {
    try {
      await createDeck(deckName);
      result.decksCreated.push(deckName);

      const ids = await addNotes(deckName, cards, ["ielts", deckName.split("::")[1].toLowerCase()]);
      const added = ids.filter((id) => id !== null).length;
      result.cardsAdded += added;
    } catch (err) {
      result.errors.push(`${deckName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
