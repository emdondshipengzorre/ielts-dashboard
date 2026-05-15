"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SKILL_LABELS, LOCATION_LABELS, type StudySession } from "@/lib/types";
import { formatHours } from "@/lib/utils";

interface LogTableProps {
  sessions: StudySession[];
  onEdit: (session: StudySession) => void;
  onDelete: (id: string) => void;
}

export function LogTable({ sessions, onEdit, onDelete }: LogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Skill</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No sessions logged yet.
            </TableCell>
          </TableRow>
        ) : (
          sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="tabular-nums">{session.date}</TableCell>
              <TableCell>
                <Badge variant="secondary">{SKILL_LABELS[session.skill]}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <span className="truncate">{session.activity}</span>
                {session.sourceCheckoffId && (
                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                    Auto
                  </span>
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatHours(session.hours)}
              </TableCell>
              <TableCell>{LOCATION_LABELS[session.location]}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(session)}
                    aria-label="Edit session"
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(session.id)}
                    aria-label="Delete session"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
