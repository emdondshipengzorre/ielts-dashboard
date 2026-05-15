"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/storage";
import {
  SKILLS,
  SKILL_LABELS,
  LOCATIONS,
  LOCATION_LABELS,
  PHASES,
  PHASE_LABELS,
  type Skill,
  type Location,
  type Phase,
  type StudySession,
} from "@/lib/types";
import { getPlanConfig, getCurrentPhase } from "@/lib/utils";

interface LogFormProps {
  onSuccess?: () => void;
  initialData?: StudySession;
}

interface FormState {
  date: string;
  skill: Skill | "";
  activity: string;
  hours: string;
  location: Location | "";
  phase: string;
  notes: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDefault(initial?: StudySession): FormState {
  if (initial) {
    return {
      date: initial.date,
      skill: initial.skill,
      activity: initial.activity,
      hours: String(initial.hours),
      location: initial.location,
      phase: String(initial.phase),
      notes: initial.notes ?? "",
    };
  }
  const config = getPlanConfig();
  const currentPhase = getCurrentPhase(config.startDate);
  return {
    date: todayISO(),
    skill: "",
    activity: "",
    hours: "",
    location: "",
    phase: String(currentPhase),
    notes: "",
  };
}

export function LogForm({ onSuccess, initialData }: LogFormProps) {
  const [form, setForm] = useState<FormState>(() => buildDefault(initialData));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(initialData);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.skill) { setError("Please select a skill."); return; }
    if (!form.activity.trim()) { setError("Activity is required."); return; }
    const parsedHours = parseFloat(form.hours);
    if (!form.hours || isNaN(parsedHours) || parsedHours <= 0) {
      setError("Please enter valid hours (e.g. 1.5).");
      return;
    }
    if (!form.location) { setError("Please select a location."); return; }
    if (!form.phase) { setError("Please select a phase."); return; }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        date: form.date,
        skill: form.skill as Skill,
        activity: form.activity.trim(),
        hours: parsedHours,
        location: form.location as Location,
        phase: Number(form.phase) as Phase,
        notes: form.notes.trim() || undefined,
        updatedAt: now,
      };

      if (isEditing && initialData) {
        await db.sessions.update(initialData.id, payload);
      } else {
        await db.sessions.add({
          ...payload,
          id: crypto.randomUUID(),
          createdAt: now,
        });
        setForm(buildDefault());
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lf-date">Date</Label>
          <Input
            id="lf-date"
            type="date"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lf-hours">Hours</Label>
          <Input
            id="lf-hours"
            type="number"
            step={0.25}
            min={0.25}
            max={12}
            placeholder="e.g. 1.5"
            value={form.hours}
            onChange={(e) => setField("hours", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Skill</Label>
        <Select
          value={form.skill || undefined}
          onValueChange={(v) => setField("skill", v as Skill)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a skill" />
          </SelectTrigger>
          <SelectContent>
            {SKILLS.map((s) => (
              <SelectItem key={s} value={s}>
                {SKILL_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lf-activity">Activity</Label>
        <Input
          id="lf-activity"
          placeholder="e.g. Cambridge Practice Test 1"
          value={form.activity}
          onChange={(e) => setField("activity", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <Select
            value={form.location || undefined}
            onValueChange={(v) => setField("location", v as Location)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {LOCATION_LABELS[loc]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Phase</Label>
          <Select
            value={form.phase || undefined}
            onValueChange={(v) => setField("phase", v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Phase" />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {PHASE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lf-notes">Notes (optional)</Label>
        <textarea
          id="lf-notes"
          rows={3}
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Saving..." : isEditing ? "Update Session" : "Log Session"}
      </Button>
    </form>
  );
}
