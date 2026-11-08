import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ViewMode = "day" | "week" | "month";

export interface AuroraEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  color: EventColor;
  location?: string;
}

export type EventColor =
  | "indigo"
  | "pink"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "violet"
  | "slate";

export const COLOR_MAP: Record<
  EventColor,
  { bg: string; text: string; border: string; dot: string }
> = {
  indigo: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-l-indigo-500",
    dot: "bg-indigo-500",
  },
  pink: {
    bg: "bg-pink-500/15",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-l-pink-500",
    dot: "bg-pink-500",
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-l-rose-500",
    dot: "bg-rose-500",
  },
  sky: {
    bg: "bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-l-sky-500",
    dot: "bg-sky-500",
  },
  violet: {
    bg: "bg-violet-500/15",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-l-violet-500",
    dot: "bg-violet-500",
  },
  slate: {
    bg: "bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-l-slate-500",
    dot: "bg-slate-500",
  },
};

export function genId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
