"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Trash2, X } from "lucide-react";
import {
  cn,
  COLOR_MAP,
  type AuroraEvent,
  type EventColor,
} from "@/lib/utils";

interface EventModalProps {
  open: boolean;
  event: AuroraEvent | null;
  prefill: { start: string; end: string } | null;
  onClose: () => void;
  onSave: (event: Omit<AuroraEvent, "id"> | AuroraEvent) => void;
  onDelete: (id: string) => void;
}

const COLOR_OPTIONS: EventColor[] = [
  "indigo",
  "pink",
  "amber",
  "emerald",
  "rose",
  "sky",
  "violet",
  "slate",
];

/** Convertit un ISO string vers la valeur attendue par <input datetime-local>. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Modal de création / édition d'événement.
 * - Fermeture via Échap ou clic sur le backdrop.
 * - Validation : titre obligatoire + date de fin après date de début.
 */
export function EventModal({
  open,
  event,
  prefill,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const isEditing = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("indigo");
  const [error, setError] = useState<string | null>(null);

  // Synchronise le formulaire à l'ouverture ou au changement de cible
  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setStart(toDatetimeLocal(event.start));
      setEnd(toDatetimeLocal(event.end));
      setLocation(event.location ?? "");
      setColor(event.color);
    } else if (prefill) {
      setTitle("");
      setDescription("");
      setStart(toDatetimeLocal(prefill.start));
      setEnd(toDatetimeLocal(prefill.end));
      setLocation("");
      setColor("indigo");
    } else {
      // Fallback : maintenant arrondi à l'heure suivante + 1 h
      const now = new Date();
      const s = new Date(now);
      s.setSeconds(0, 0);
      s.setMinutes(0);
      if (now.getMinutes() > 0 || now.getSeconds() > 0) {
        s.setHours(now.getHours() + 1);
      }
      const e = new Date(s.getTime() + 60 * 60 * 1000);
      setTitle("");
      setDescription("");
      setStart(toDatetimeLocal(s.toISOString()));
      setEnd(toDatetimeLocal(e.toISOString()));
      setLocation("");
      setColor("indigo");
    }
    setError(null);
  }, [open, event, prefill]);

  // Fermeture via Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Le titre est obligatoire.");
      return;
    }
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      setError("Les dates saisies sont invalides.");
      return;
    }
    if (endMs <= startMs) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    const payload = {
      title: trimmed,
      description: description.trim() || undefined,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      color,
      location: location.trim() || undefined,
    };

    if (event) {
      onSave({ ...payload, id: event.id });
    } else {
      onSave(payload);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Modifier l'événement" : "Nouvel événement"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Carte */}
      <div className="animate-scale-in glass relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border)] p-5 shadow-2xl sm:p-6">
        {/* En-tête */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[var(--text)]">
            {isEditing ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          {/* Titre */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'événement"
            autoFocus
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base font-medium text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />

          {/* Dates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5" /> Début
              </span>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5" /> Fin
              </span>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Lieu */}
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5" /> Lieu
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ajouter un lieu"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description"
              rows={3}
              className="resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </label>

          {/* Sélecteur de couleur */}
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
              Couleur
            </p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const map = COLOR_MAP[c];
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Couleur ${c}`}
                    aria-pressed={selected}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition",
                      map.bg,
                      selected
                        ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]"
                        : "hover:scale-110"
                    )}
                  >
                    <span className={cn("h-3 w-3 rounded-full", map.dot)} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="mt-6 flex items-center justify-between gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={() => onDelete(event!.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] hover:shadow-md"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
