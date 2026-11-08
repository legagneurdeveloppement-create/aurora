"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuroraEvent } from "@/lib/utils";
import { genId } from "@/lib/utils";

const STORAGE_KEY = "aurora-events-v1";

const SEED_EVENTS: AuroraEvent[] = [
  {
    id: genId(),
    title: "Réunion d'équipe",
    description: "Point hebdomadaire sur l'avancement des projets",
    start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    color: "indigo",
    location: "Visio",
  },
  {
    id: genId(),
    title: "Déjeuner avec Léa",
    start: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    color: "pink",
    location: "Café du Centre",
  },
  {
    id: genId(),
    title: "Session code — Aurora v2",
    description: "Refonte du composant calendrier mensuel",
    start: new Date(
      new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)
    ).toISOString(),
    end: new Date(
      new Date(Date.now() + 86400000).setHours(17, 30, 0, 0)
    ).toISOString(),
    color: "violet",
  },
  {
    id: genId(),
    title: "Sport — Running",
    start: new Date(
      new Date(Date.now() + 86400000).setHours(18, 0, 0, 0)
    ).toISOString(),
    end: new Date(
      new Date(Date.now() + 86400000).setHours(19, 0, 0, 0)
    ).toISOString(),
    color: "emerald",
    location: "Parc",
  },
  {
    id: genId(),
    title: "Webdesign — Maquettes",
    start: new Date(
      new Date(Date.now() + 2 * 86400000).setHours(10, 0, 0, 0)
    ).toISOString(),
    end: new Date(
      new Date(Date.now() + 2 * 86400000).setHours(12, 0, 0, 0)
    ).toISOString(),
    color: "amber",
  },
];

export function useEvents() {
  const [events, setEvents] = useState<AuroraEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuroraEvent[];
        if (Array.isArray(parsed)) setEvents(parsed);
        else setEvents(SEED_EVENTS);
      } else {
        setEvents(SEED_EVENTS);
      }
    } catch {
      setEvents(SEED_EVENTS);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events, loaded]);

  const addEvent = useCallback(
    (event: Omit<AuroraEvent, "id">) => {
      const newEvent: AuroraEvent = { ...event, id: genId() };
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    []
  );

  const updateEvent = useCallback((event: AuroraEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, addEvent, updateEvent, deleteEvent, loaded };
}
