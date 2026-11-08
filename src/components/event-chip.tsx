"use client";

import { cn, COLOR_MAP, type AuroraEvent } from "@/lib/utils";

interface EventChipProps {
  event: AuroraEvent;
  onClick?: (event: AuroraEvent) => void;
  className?: string;
}

/**
 * Petit composant "chip" utilisé dans la vue mensuelle.
 * Affiche un point coloré + le titre (tronqué), le tout sur fond teinté.
 */
export function EventChip({ event, onClick, className }: EventChipProps) {
  const color = COLOR_MAP[event.color];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      title={`${event.title}${event.location ? ` · ${event.location}` : ""}`}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight transition hover:brightness-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]",
        color.bg,
        color.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color.dot)} />
      <span className="truncate">{event.title}</span>
    </button>
  );
}
