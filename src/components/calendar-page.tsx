"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { AuroraEvent, ViewMode } from "@/lib/utils";
import { useEvents } from "@/hooks/use-events";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "@/components/toaster";
import { CalendarHeader } from "./calendar-header";
import { CalendarToolbar } from "./calendar-toolbar";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { EventModal } from "./event-modal";
import { AppToolbar } from "./app-toolbar";

/** Met la première lettre en majuscule (les locales date-fns renvoient du minuscule). */
function cap(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Page principale : orchestre l'état (date courante, mode de vue, modal),
 * branche les hooks useEvents / useTheme, et rend la vue active.
 */
export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { theme, toggleTheme, mounted } = useTheme();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuroraEvent | null>(null);
  const [prefill, setPrefill] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Libellé de la période courante affiché dans la barre d'outils
  const label = useMemo(() => {
    if (view === "month") {
      return cap(format(currentDate, "MMMM yyyy", { locale: fr }));
    }
    if (view === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      return `Semaine du ${format(ws, "d MMM", { locale: fr })}`;
    }
    return cap(format(currentDate, "EEEE d MMM", { locale: fr }));
  }, [currentDate, view]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return subMonths(d, 1);
      if (view === "week") return subDays(d, 7);
      return subDays(d, 1);
    });
  }, [view]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return addMonths(d, 1);
      if (view === "week") return addDays(d, 7);
      return addDays(d, 1);
    });
  }, [view]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  // Ouvre la modal en mode création avec un créneau par défaut :
  // heure courante arrondie à l'heure suivante + 1 heure.
  const openNewEvent = useCallback(() => {
    const now = new Date();
    const needsRoundUp =
      now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0;
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    if (needsRoundUp) start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setSelectedEvent(null);
    setPrefill({ start: start.toISOString(), end: end.toISOString() });
    setModalOpen(true);
  }, []);

  const openNewEventAt = useCallback((start: Date, end: Date) => {
    setSelectedEvent(null);
    setPrefill({ start: start.toISOString(), end: end.toISOString() });
    setModalOpen(true);
  }, []);

  const openEditEvent = useCallback((event: AuroraEvent) => {
    setSelectedEvent(event);
    setPrefill(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(null);
    setPrefill(null);
  }, []);

  const handleSave = useCallback(
    (payload: Omit<AuroraEvent, "id"> | AuroraEvent) => {
      if ("id" in payload) {
        updateEvent(payload);
        toast({
          title: "Événement mis à jour",
          description: payload.title,
          variant: "success",
        });
      } else {
        const created = addEvent(payload);
        toast({
          title: "Événement créé",
          description: created.title,
          variant: "success",
        });
      }
      closeModal();
    },
    [addEvent, updateEvent, closeModal]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteEvent(id);
      toast({ title: "Événement supprimé", variant: "success" });
      closeModal();
    },
    [deleteEvent, closeModal]
  );

  // Clic sur un jour de la vue mensuelle → ouverture pré-remplie 09:00-10:00
  const handleSelectDay = useCallback(
    (day: Date) => {
      const start = new Date(day);
      start.setHours(9, 0, 0, 0);
      const end = new Date(day);
      end.setHours(10, 0, 0, 0);
      openNewEventAt(start, end);
    },
    [openNewEventAt]
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
      <AppToolbar />
      <CalendarHeader
        theme={mounted ? theme : "light"}
        onToggleTheme={toggleTheme}
      />

      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        label={label}
        onViewChange={setView}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onNewEvent={openNewEvent}
      />

      <main className="flex-1">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onSelectDay={handleSelectDay}
            onSelectEvent={openEditEvent}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onSelectSlot={openNewEventAt}
            onSelectEvent={openEditEvent}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={events}
            onSelectSlot={openNewEventAt}
            onSelectEvent={openEditEvent}
          />
        )}
      </main>

      <EventModal
        open={modalOpen}
        event={selectedEvent}
        prefill={prefill}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <footer className="pt-2 text-center text-xs text-[var(--text-muted)]">
        Aurora · par LEGAGNEUR DÉVELOPPEMENT
      </footer>
    </div>
  );
}
