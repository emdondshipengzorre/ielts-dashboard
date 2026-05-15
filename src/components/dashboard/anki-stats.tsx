"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setupIeltsDecks } from "@/lib/anki";
import type { AnkiStats } from "@/lib/types";

interface AnkiStatsProps {
  stats: AnkiStats;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function AnkiStatsWidget({ stats, isLoading, onRefresh }: AnkiStatsProps) {
  const [setupStatus, setSetupStatus] = useState<string | null>(null);
  const [settingUp, setSettingUp] = useState(false);
  const [progress, setProgress] = useState<{ added: number; total: number } | null>(null);

  const ieltsDecks = stats.decks.filter((d) => d.startsWith("IELTS::"));
  const hasFullSetup = ieltsDecks.length >= 15;

  async function handleSetupDecks() {
    setSettingUp(true);
    setSetupStatus(null);
    setProgress(null);
    try {
      const result = await setupIeltsDecks((_, added, total) => {
        setProgress({ added, total });
      });
      const skipped = result.totalCards - result.cardsAdded;
      setSetupStatus(
        `${result.decksCreated.length} decks, ${result.cardsAdded} cards added` +
        (skipped > 0 ? ` (${skipped} duplicates skipped)` : "")
      );
      onRefresh?.();
    } catch (err) {
      setSetupStatus(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setSettingUp(false);
      setProgress(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Anki Review</CardTitle>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 rounded-full ${
                stats.isConnected ? "bg-emerald-500" : "bg-destructive"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {stats.isConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : stats.isConnected ? (
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold tabular-nums leading-none">
                {stats.dueCards}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Cards Due</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xl font-semibold tabular-nums">{stats.reviewedToday}</p>
                <p className="text-xs text-muted-foreground">Reviewed Today</p>
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums">{stats.decks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.decks.length === 1 ? "Deck" : "Decks"}
                </p>
              </div>
            </div>
            {!hasFullSetup && (
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={handleSetupDecks}
                  disabled={settingUp}
                >
                  <BookOpen className="size-3.5" />
                  {settingUp ? "Loading cards…" : ieltsDecks.length > 0 ? "Load All IELTS Decks" : "Setup IELTS Decks"}
                </Button>
                {progress && (
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((progress.added / progress.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {progress.added} / {progress.total} cards
                    </p>
                  </div>
                )}
              </div>
            )}
            {setupStatus && (
              <p className="text-xs text-muted-foreground">{setupStatus}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Start Anki Desktop to see review stats
          </p>
        )}
      </CardContent>
    </Card>
  );
}
