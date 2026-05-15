"use client";

import { PHASE_LABELS, PHASE_MONTH_RANGES, PHASES, type Phase } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PhaseIndicatorProps {
  currentPhase: Phase;
  elapsedMonths: number;
  totalMonths: number;
}

export function PhaseIndicator({ currentPhase, elapsedMonths }: PhaseIndicatorProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {PHASES.map((phase) => {
          const [min, max] = PHASE_MONTH_RANGES[phase];
          const phaseLength = max - min + 1;

          // Calculate fill fraction for this segment
          let fill = 0;
          if (elapsedMonths > max) {
            fill = 1;
          } else if (elapsedMonths >= min) {
            fill = (elapsedMonths - min + 1) / phaseLength;
          }

          const isPast = elapsedMonths > max;
          const isCurrent = currentPhase === phase;

          return (
            <div
              key={phase}
              className="relative flex-1 overflow-hidden rounded-full"
              style={{ flexBasis: `${(phaseLength / 30) * 100}%` }}
              title={`Phase ${phase}: ${PHASE_LABELS[phase]} (Months ${min}–${max})`}
            >
              {/* Background track */}
              <div className="h-2 w-full rounded-full bg-muted" />
              {/* Fill */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                  isPast
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
                style={{ width: `${fill * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {PHASES.map((phase) => {
          const [min, max] = PHASE_MONTH_RANGES[phase];
          const phaseLength = max - min + 1;
          const isCurrent = currentPhase === phase;

          return (
            <div
              key={phase}
              className="text-center"
              style={{ flexBasis: `${(phaseLength / 30) * 100}%` }}
            >
              <span
                className={cn(
                  "text-xs",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Phase {phase} — {PHASE_LABELS[phase]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
