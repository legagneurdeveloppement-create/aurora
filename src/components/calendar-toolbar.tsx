"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn, type ViewMode } from "@/lib/utils";

interface CalendarToolbarProps {
  currentDate: Date;
  view: ViewMode;
  label: string;
  onViewChange: (view: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
}

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
];

/**
 * Barre d'outils : bouton "Aujourd'hui", navigation précédent / suivant,
 * libellé de la période courante, onglets de vue (Jour | Semaine | Mois)
 * et bouton "Nouvel événement".
 */
export function CalendarToolbar({
  currentDate: _currentDate,
  view,
  label,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
}: CalendarToolbarProps) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2.5 shadow-sm sm:gap-3">
      <button
        type="button"
        onClick={onToday}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] hover:shadow-sm"
      >
        Aujourd&apos;hui
      </button>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Période précédente"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Période suivante"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="min-w-0 flex-1 truncate text-sm font-semibold capitalize text-[var(--text)] sm:text-base">
        {label}
      </p>

      {/* Onglets de vue */}
      <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "rounded-lg px-3 py-1 text-sm font-medium transition",
              view === tab.id
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNewEvent}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nouvel événement</span>
        <span className="sm:hidden">Nouveau</span>
      </button>
    </div>
  );
}
