"use client";

import { Moon, Sun } from "lucide-react";

interface CalendarHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

/**
 * En-tête de l'application : logo Aurora (cercle dégradé + lettre "A"),
 * titre, et bouton de bascule de thème clair / sombre.
 */
export function CalendarHeader({ theme, onToggleTheme }: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="relative h-11 w-11 shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 aurora-glow" />
          <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-[var(--surface)]">
            <span className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-500 bg-clip-text font-display text-lg font-bold text-transparent">
              A
            </span>
          </div>
        </div>

        {/* Titre */}
        <div className="leading-tight">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
            Aurora
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Agenda moderne</p>
        </div>
      </div>

      {/* Bascule de thème */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Changer de thème"
        className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text)] hover:shadow-md"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </header>
  );
}
