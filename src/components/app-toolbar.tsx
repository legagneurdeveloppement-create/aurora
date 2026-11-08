"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft, Download, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PORTFOLIO_URL = "https://legagneur-developpement.vercel.app";

/**
 * Barre d'outils flottante commune à toutes les apps LEGAGNEUR DÉVELOPPEMENT.
 * - Bouton "Retour au portfolio"
 * - Bouton "Installer sur PC" (déclenche l'invite native PWA via beforeinstallprompt)
 * - Bouton "Fermer" (window.close() — ne marche que si l'onglet a été ouvert par script,
 *   sinon affiche un lien vers le portfolio)
 *
 * Props optionnelles :
 *  - portfolioUrl : surcharge l'URL de retour (par défaut = portfolio officiel)
 *  - autoHideMs   : masque la barre après X ms (0 = jamais). 0 par défaut.
 */
export function AppToolbar({
  portfolioUrl = PORTFOLIO_URL,
  autoHideMs = 0,
}: {
  portfolioUrl?: string;
  autoHideMs?: number;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Détecte si déjà installé (mode standalone)
  useEffect(() => {
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true);
    if (standalone) {
      setInstalled(true);
      setVisible(false);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Auto-hide après autoHideMs
  useEffect(() => {
    if (!autoHideMs || !visible) return;
    const t = setTimeout(() => setVisible(false), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, visible]);

  // Échap pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback : on ouvre le portfolio qui contient le guide complet
      window.open(portfolioUrl, "_blank", "noopener,noreferrer");
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    // window.close() ne marche que si l'onglet a été ouvert par window.open()
    // Sinon on redirige vers le portfolio
    try {
      window.close();
    } catch {
      // ignore
    }
    // Si l'onglet n'a pas été fermé après 150ms, redirige vers le portfolio
    setTimeout(() => {
      if (!window.closed) {
        window.location.href = portfolioUrl;
      }
    }, 150);
  };

  const handleBack = () => {
    // Si on a un historique (venu du portfolio dans le même onglet)
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = portfolioUrl;
    }
  };

  if (installed) {
    // App déjà installée : juste un petit badge discret
    return null;
  }

  if (!visible) {
    // Ré-afficher via un petit bouton discret en bas à droite
    return (
      <button
        onClick={() => setVisible(true)}
        aria-label="Afficher la barre d'outils"
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-black/70 backdrop-blur text-white border border-white/20 shadow-lg flex items-center justify-center hover:bg-black/90 transition"
      >
        <Download className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed top-3 right-3 z-[9999] flex items-center gap-2 p-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl animate-fade-in">
      {/* Bouton retour portfolio */}
      <button
        onClick={handleBack}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition"
        aria-label="Retour au portfolio"
        title="Retour au portfolio LEGAGNEUR DÉVELOPPEMENT"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Portfolio</span>
      </button>

      {/* Séparateur */}
      <div className="w-px h-5 bg-white/20" />

      {/* Bouton Installer sur PC */}
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition"
        aria-label="Installer l'application"
        title="Installer cette application sur votre ordinateur"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Installer</span>
      </button>

      {/* Séparateur */}
      <div className="w-px h-5 bg-white/20" />

      {/* Bouton Fermer */}
      <button
        onClick={handleClose}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-white hover:bg-rose-500/30 transition"
        aria-label="Fermer"
        title="Fermer et revenir au portfolio"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default AppToolbar;
