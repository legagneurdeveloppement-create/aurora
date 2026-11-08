"use client";

import { useMemo } from "react";
import {
  addDays,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn, COLOR_MAP, type AuroraEvent } from "@/lib/utils";

interface WeekViewProps {
  currentDate: Date;
  events: AuroraEvent[];
  onSelectSlot: (start: Date, end: Date) => void;
  onSelectEvent: (event: AuroraEvent) => void;
}

const HOUR_HEIGHT = 56; // px par heure
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Vue hebdomadaire : une colonne par jour (Lun → Dim) avec une grille
 * horaire verticale de 00:00 à 23:00. Les événements sont positionnés
 * de façon absolue selon leur heure de début / fin.
 */
export function WeekView({
  currentDate,
  events,
  onSelectSlot,
  onSelectEvent,
}: WeekViewProps) {
  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Indexe les événements par jour de la semaine
  const eventsByDay = useMemo(() => {
    const map = new Map<string, AuroraEvent[]>();
    for (const d of days) {
      map.set(format(d, "yyyy-MM-dd"), []);
    }
    for (const ev of events) {
      const evDate = new Date(ev.start);
      const key = format(evDate, "yyyy-MM-dd");
      const arr = map.get(key);
      if (arr) arr.push(ev);
    }
    map.forEach((arr) =>
      arr.sort((a, b) => a.start.localeCompare(b.start))
    );
    return map;
  }, [events, days]);

  const handleSlotClick = (day: Date, hour: number) => {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(day);
    end.setHours(hour + 1, 0, 0, 0);
    onSelectSlot(start, end);
  };

  return (
    <div className="glass overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
      {/* En-tête : jours de la semaine */}
      <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-[var(--border)] bg-[var(--surface-2)]/40 sm:grid-cols-[64px_repeat(7,1fr)]">
        <div className="border-r border-[var(--border)]" />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center gap-0.5 px-1 py-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:text-xs">
                {format(day, "EEEEEE", { locale: fr })}
              </span>
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition",
                  today
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text)]"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Corps : grille horaire */}
      <div className="grid max-h-[72vh] grid-cols-[44px_repeat(7,1fr)] overflow-y-auto sm:grid-cols-[64px_repeat(7,1fr)]">
        {/* Gouttière des heures */}
        <div className="relative border-r border-[var(--border)]">
          {HOURS.map((h) => (
            <div
              key={h}
              className="relative pr-1 text-right text-[10px] font-medium text-[var(--text-muted)] sm:pr-2 sm:text-xs"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <span className="absolute right-1 top-0 -translate-y-1/2 sm:right-2">
                {format(new Date(1970, 0, 1, h, 0), "H:mm", { locale: fr })}
              </span>
            </div>
          ))}
        </div>

        {/* Colonnes de jours */}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const today = isToday(day);

          return (
            <div
              key={key}
              className="relative border-r border-[var(--border)] last:border-r-0"
              style={{ height: `${HOUR_HEIGHT * 24}px` }}
            >
              {/* Lignes / créneaux horaires cliquables */}
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleSlotClick(day, h)}
                  aria-label={`Créneau ${h}:00`}
                  className="absolute left-0 right-0 cursor-pointer border-t border-[var(--border)]/50 transition hover:bg-[var(--surface-2)]/50"
                  style={{
                    top: `${h * HOUR_HEIGHT}px`,
                    height: `${HOUR_HEIGHT}px`,
                  }}
                />
              ))}

              {/* Surlignage du jour courant */}
              {today && (
                <div className="pointer-events-none absolute inset-0 bg-[var(--primary)]/[0.04]" />
              )}

              {/* Événements positionnés */}
              {dayEvents.map((ev) => {
                const start = new Date(ev.start);
                const end = new Date(ev.end);
                const startMin = getHours(start) * 60 + getMinutes(start);
                const endMin = getHours(end) * 60 + getMinutes(end);
                const top = (startMin * HOUR_HEIGHT) / 60;
                const height = Math.max(
                  ((endMin - startMin) * HOUR_HEIGHT) / 60,
                  22
                );
                const color = COLOR_MAP[ev.color];

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                    className={cn(
                      "absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left text-[10px] leading-tight transition hover:brightness-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] sm:text-xs",
                      color.bg,
                      color.text,
                      color.border
                    )}
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <p className="truncate font-semibold">{ev.title}</p>
                    {height > 32 && (
                      <p className="truncate opacity-80">
                        {format(start, "H:mm", { locale: fr })} –{" "}
                        {format(end, "H:mm", { locale: fr })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
