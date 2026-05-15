"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage";
import type { Skill, Location, Phase } from "@/lib/types";

interface SessionFilters {
  dateRange?: [string, string];
  skills?: Skill[];
  location?: Location;
  phase?: Phase;
}

export function useStudySessions(filters?: SessionFilters) {
  return useLiveQuery(async () => {
    let results = await db.sessions.orderBy("date").reverse().toArray();

    if (filters?.dateRange) {
      const [start, end] = filters.dateRange;
      results = results.filter((s) => s.date >= start && s.date <= end);
    }

    if (filters?.skills?.length) {
      results = results.filter((s) => filters.skills!.includes(s.skill));
    }

    if (filters?.location) {
      results = results.filter((s) => s.location === filters.location);
    }

    if (filters?.phase) {
      results = results.filter((s) => s.phase === filters.phase);
    }

    return results;
  }, [
    filters?.dateRange?.[0],
    filters?.dateRange?.[1],
    filters?.skills?.join(","),
    filters?.location,
    filters?.phase,
  ]);
}
