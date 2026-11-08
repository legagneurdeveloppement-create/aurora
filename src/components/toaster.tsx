"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

let toastListeners: ((toast: Toast) => void)[] = [];
let toastId = 0;

export function toast(opts: Omit<Toast, "id">) {
  const t: Toast = { id: `t_${++toastId}`, ...opts };
  toastListeners.forEach((l) => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-scale-in glass min-w-[280px] max-w-sm",
            "border-[var(--border)]"
          )}
        >
          <div className="mt-0.5">
            {t.variant === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : t.variant === "error" ? (
              <AlertCircle className="h-5 w-5 text-rose-500" />
            ) : (
              <Info className="h-5 w-5 text-indigo-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">
              {t.title}
            </p>
            {t.description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
