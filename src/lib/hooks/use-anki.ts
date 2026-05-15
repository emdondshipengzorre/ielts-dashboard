"use client";

import { useState, useEffect, useCallback } from "react";
import { isAnkiRunning, getDeckNames, getNumCardsReviewedToday, findDueCards } from "@/lib/anki";
import type { AnkiStats } from "@/lib/types";

export function useAnki(pollIntervalMs = 60000) {
  const [stats, setStats] = useState<AnkiStats>({
    isConnected: false,
    dueCards: 0,
    reviewedToday: 0,
    retentionPercent: 0,
    decks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const connected = await isAnkiRunning();
      if (!connected) {
        setStats((prev) => ({ ...prev, isConnected: false }));
        setError(null);
        return;
      }

      const [decks, reviewedToday, dueCards] = await Promise.all([
        getDeckNames(),
        getNumCardsReviewedToday(),
        findDueCards(),
      ]);

      setStats({
        isConnected: true,
        dueCards,
        reviewedToday,
        retentionPercent: 0,
        decks,
      });
      setError(null);
    } catch (err) {
      setStats((prev) => ({ ...prev, isConnected: false }));
      setError(err instanceof Error ? err.message : "Failed to connect to Anki");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchStats, pollIntervalMs]);

  return { stats, isLoading, error, refresh: fetchStats };
}
