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
  totalCards: number;
  errors: string[];
}

export type SetupProgressCallback = (deckName: string, added: number, total: number) => void;

export async function setupIeltsDecks(
  onProgress?: SetupProgressCallback,
): Promise<AnkiDeckSetupResult> {
  const { IELTS_DECKS } = await import("@/lib/vocabulary");
  const totalCards = IELTS_DECKS.reduce((sum, d) => sum + d.cards.length, 0);
  const result: AnkiDeckSetupResult = { decksCreated: [], cardsAdded: 0, totalCards, errors: [] };

  for (const deck of IELTS_DECKS) {
    try {
      await createDeck(deck.name);
      result.decksCreated.push(deck.name);

      const BATCH_SIZE = 50;
      for (let i = 0; i < deck.cards.length; i += BATCH_SIZE) {
        const batch = deck.cards.slice(i, i + BATCH_SIZE);
        const ids = await addNotes(deck.name, batch, deck.tags);
        const added = ids.filter((id) => id !== null).length;
        result.cardsAdded += added;
        onProgress?.(deck.name, result.cardsAdded, totalCards);
      }
    } catch (err) {
      result.errors.push(`${deck.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
