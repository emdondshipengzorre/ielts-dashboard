"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { seedDatabase } from "@/lib/seed";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogForm } from "@/components/log/log-form";
import { LogTable } from "@/components/log/log-table";
import { db } from "@/lib/storage";
import {
  SKILLS,
  SKILL_LABELS,
  LOCATIONS,
  LOCATION_LABELS,
  type Skill,
  type Location,
  type StudySession,
} from "@/lib/types";

export default function LogPage() {
  useEffect(() => {
    seedDatabase();
  }, []);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [skillFilter, setSkillFilter] = useState<Skill | "">("");
  const [locationFilter, setLocationFilter] = useState<Location | "">("");

  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const allSessions = useLiveQuery(
    () => db.sessions.orderBy("date").reverse().toArray(),
    []
  ) ?? [];

  const filteredSessions = allSessions.filter((s) => {
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    if (skillFilter && s.skill !== skillFilter) return false;
    if (locationFilter && s.location !== locationFilter) return false;
    return true;
  });

  function handleEdit(session: StudySession) {
    setEditingSession(session);
    setEditDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this session? This cannot be undone."
    );
    if (confirmed) {
      await db.sessions.delete(id);
    }
  }

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setSkillFilter("");
    setLocationFilter("");
  }

  const hasFilters = dateFrom || dateTo || skillFilter || locationFilter;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Study Log</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {allSessions.length} session{allSessions.length !== 1 ? "s" : ""} recorded
            </p>
          </div>

          {/* Mobile/compact: add via dialog */}
          <Button size="sm" className="gap-1.5" onClick={() => setAddDialogOpen(true)}>
            <PlusIcon className="size-4" />
            Log Session
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log a Study Session</DialogTitle>
              </DialogHeader>
              <LogForm onSuccess={() => setAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Desktop inline form */}
        <Card className="hidden lg:block">
          <CardHeader className="border-b pb-4">
            <CardTitle>New Session</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <LogForm />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Filter Sessions</CardTitle>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-from">From</Label>
                <Input
                  id="filter-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-to">To</Label>
                <Input
                  id="filter-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Skill</Label>
                <Select
                  value={skillFilter || null}
                  onValueChange={(v) => setSkillFilter((v as Skill) || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All skills" />
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
                <Label>Location</Label>
                <Select
                  value={locationFilter || null}
                  onValueChange={(v) => setLocationFilter((v as Location) || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All locations" />
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
            </div>
          </CardContent>
        </Card>

        {/* Results table */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>
              {hasFilters
                ? `${filteredSessions.length} result${filteredSessions.length !== 1 ? "s" : ""}`
                : "All Sessions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LogTable
              sessions={filteredSessions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          {editingSession && (
            <LogForm
              initialData={editingSession}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditingSession(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
