"use client";

import { useMemo } from "react";
import {
  addDays,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn, type AuroraEvent } from "@/lib/utils";
import { EventChip } from "./event-chip";

interface MonthViewProps {
  currentDate: Date;
  events: AuroraEvent[];
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: AuroraEvent) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Vue mensuelle : grille de 7 colonnes × 6 lignes (42 cellules).
 * Chaque cellule affiche le numéro du jour et jusqu'à 3 chips d'événements.
 */
export function MonthView({
  currentDate,
  events,
  onSelectDay,
  onSelectEvent,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [currentDate]);

  // Indexe les événements par jour (clé "yyyy-MM-dd")
  const eventsByDay = useMemo(() => {
    const map = new Map<string, AuroraEvent[]>();
    for (const ev of events) {
      const key = format(new Date(ev.start), "yyyy-MM-dd");
      const arr = map.get(key);
      if (arr) arr.push(ev);
      else map.set(key, [ev]);
    }
    map.forEach((arr) =>
      arr.sort((a, b) => a.start.localeCompare(b.start))
    );
    return map;
  }, [events]);

  return (
    <div className="glass overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
      {/* En-tête : jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-2)]/40">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:text-xs"
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((day, idx) => {
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const visible = dayEvents.slice(0, 3);
          const remaining = dayEvents.length - visible.length;
          const colIndex = idx % 7;
          const rowIndex = Math.floor(idx / 7);
          const isWeekend = colIndex >= 5;

          return (
            <div
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                "group relative min-h-[84px] cursor-pointer border-b border-r border-[var(--border)] p-1.5 transition hover:bg-[var(--surface-2)]/60 sm:min-h-[112px]",
                !inMonth && "bg-[var(--surface-2)]/30",
                isWeekend && "bg-[var(--surface-2)]/20",
                colIndex === 6 && "border-r-0",
                rowIndex === 5 && "border-b-0"
              )}
            >
              {/* Numéro du jour */}
              <div className="mb-1 flex items-center justify-end">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition",
                    today
                      ? "bg-[var(--primary)] font-semibold text-white"
                      : inMonth
                        ? "text-[var(--text)]"
                        : "text-[var(--text-muted)]"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Chips d'événements */}
              <div className="flex flex-col gap-0.5">
                {visible.map((ev) => (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    onClick={onSelectEvent}
                  />
                ))}
                {remaining > 0 && (
                  <span className="px-1 text-[10px] font-medium text-[var(--text-muted)]">
                    +{remaining} autres
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
