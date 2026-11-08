"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn, COLOR_MAP, type AuroraEvent } from "@/lib/utils";

interface DayViewProps {
  currentDate: Date;
  events: AuroraEvent[];
  onSelectSlot: (start: Date, end: Date) => void;
  onSelectEvent: (event: AuroraEvent) => void;
}

const HOUR_HEIGHT = 64; // px par heure
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function isAllDayEvent(ev: AuroraEvent): boolean {
  const s = new Date(ev.start);
  const e = new Date(ev.end);
  return (
    getHours(s) === 0 &&
    getMinutes(s) === 0 &&
    getHours(e) === 23 &&
    getMinutes(e) === 59
  );
}

/**
 * Vue journalière : une colonne unique avec une grille horaire
 * 00:00 → 23:00 (64 px / heure), une ligne "journée entière" en haut,
 * et un indicateur d'heure courante si on est sur aujourd'hui.
 */
export function DayView({
  currentDate,
  events,
  onSelectSlot,
  onSelectEvent,
}: DayViewProps) {
  const dayEvents = useMemo(
    () =>
      events
        .filter((ev) => isSameDay(new Date(ev.start), currentDate))
        .sort((a, b) => a.start.localeCompare(b.start)),
    [events, currentDate]
  );

  const allDayEvents = useMemo(
    () => dayEvents.filter(isAllDayEvent),
    [dayEvents]
  );

  const timedEvents = useMemo(
    () => dayEvents.filter((ev) => !isAllDayEvent(ev)),
    [dayEvents]
  );

  // Indicateur d'heure courante (rafraîchi toutes les minutes)
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const showIndicator = isToday(currentDate);
  const nowMinutes = getHours(now) * 60 + getMinutes(now);
  const nowTop = (nowMinutes * HOUR_HEIGHT) / 60;

  const handleSlotClick = (hour: number) => {
    const start = new Date(currentDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(currentDate);
    end.setHours(hour + 1, 0, 0, 0);
    onSelectSlot(start, end);
  };

  return (
    <div className="glass overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
      {/* En-tête : date complète */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {isToday(currentDate)
            ? "Aujourd'hui"
            : format(currentDate, "EEEE", { locale: fr })}
        </p>
        <p className="font-display text-xl font-semibold capitalize text-[var(--text)]">
          {format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Ligne "journée entière" */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-2 py-2 sm:px-4">
        <span className="w-12 shrink-0 text-right text-[10px] font-medium uppercase text-[var(--text-muted)] sm:w-20 sm:text-xs">
          Journée
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {allDayEvents.length === 0 ? (
            <span className="text-xs text-[var(--text-muted)]">
              Aucun événement sur la journée
            </span>
          ) : (
            allDayEvents.map((ev) => {
              const color = COLOR_MAP[ev.color];
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelectEvent(ev)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium transition hover:brightness-110",
                    color.bg,
                    color.text
                  )}
                >
                  {ev.title}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Grille horaire */}
      <div className="grid max-h-[72vh] grid-cols-[56px_1fr] overflow-y-auto sm:grid-cols-[80px_1fr]">
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

        {/* Colonne du jour */}
        <div
          className="relative"
          style={{ height: `${HOUR_HEIGHT * 24}px` }}
        >
          {/* Lignes / créneaux horaires cliquables */}
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => handleSlotClick(h)}
              aria-label={`Créneau ${h}:00`}
              className="absolute left-0 right-0 cursor-pointer border-t border-[var(--border)]/50 transition hover:bg-[var(--surface-2)]/50"
              style={{
                top: `${h * HOUR_HEIGHT}px`,
                height: `${HOUR_HEIGHT}px`,
              }}
            />
          ))}

          {/* Événements positionnés */}
          {timedEvents.map((ev) => {
            const start = new Date(ev.start);
            const end = new Date(ev.end);
            const startMin = getHours(start) * 60 + getMinutes(start);
            const endMin = getHours(end) * 60 + getMinutes(end);
            const top = (startMin * HOUR_HEIGHT) / 60;
            const height = Math.max(
              ((endMin - startMin) * HOUR_HEIGHT) / 60,
              26
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
                  "absolute left-1 right-1 z-10 flex flex-col overflow-hidden rounded-lg border-l-2 px-2 py-1 text-left transition hover:brightness-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]",
                  color.bg,
                  color.text,
                  color.border
                )}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <p className="truncate text-xs font-semibold">{ev.title}</p>
                {height > 40 && (
                  <p className="truncate text-[10px] opacity-80 sm:text-xs">
                    {format(start, "H:mm", { locale: fr })} –{" "}
                    {format(end, "H:mm", { locale: fr })}
                  </p>
                )}
                {height > 56 && ev.location && (
                  <p className="truncate text-[10px] opacity-70">
                    {ev.location}
                  </p>
                )}
              </button>
            );
          })}

          {/* Indicateur d'heure courante */}
          {showIndicator && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${nowTop}px` }}
              aria-hidden
            >
              <span className="-ml-1 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" />
              <div className="h-px flex-1 bg-rose-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
