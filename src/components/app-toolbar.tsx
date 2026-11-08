"use client";

import { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  Download,
  Check,
  Share,
  MoreVertical,
  PlusCircle,
  Monitor,
  Smartphone,
  Apple,
  Chrome,
  Info,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PORTFOLIO_URL = "https://legagneur-developpement.vercel.app";

type Browser =
  | "opera"
  | "chrome"
  | "edge"
  | "firefox"
  | "safari"
  | "ios-safari"
  | "android-chrome"
  | "other";

function detectBrowser(): Browser {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  if (isIOS) {
    // Sur iOS, Chrome/Firefox utilisent WebKit mais l'installation PWA ne marche que via Safari
    return "ios-safari";
  }
  if (isAndroid) {
    if (/OPR\/|Opera/.test(ua)) return "android-chrome"; // Opera Android supporte l'install
    return "android-chrome";
  }
  // Desktop
  if (/OPR\/|Opera/.test(ua)) return "opera";
  if (/Edg\//.test(ua)) return "edge";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "chrome";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "safari";
  return "other";
}

interface InstallStep {
  num: number;
  title: string;
  detail: string;
  icon?: React.ReactNode;
}

function getInstallSteps(browser: Browser): {
  steps: InstallStep[];
  supported: boolean;
  heading: string;
} {
  switch (browser) {
    case "chrome":
    case "edge":
      return {
        supported: true,
        heading: "Installation sur Chrome / Edge",
        steps: [
          {
            num: 1,
            title: "Cliquez sur l'icône Installer",
            detail:
              "Une icône avec un + ou « Installer » apparaît à droite de la barre d'adresse (près de l'étoile favoris).",
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            num: 2,
            title: "Confirmez en cliquant « Installer »",
            detail:
              "Une fenêtre apparaît — cliquez sur « Installer ». L'app s'ouvre dans sa propre fenêtre, comme un vrai logiciel.",
          },
          {
            num: 3,
            title: "C'est prêt !",
            detail:
              "Aurora est maintenant dans votre menu Démarrer / Bureau / Dock. Elle fonctionne même sans internet.",
            icon: <Check className="w-4 h-4 text-emerald-400" />,
          },
        ],
      };
    case "opera":
      return {
        supported: true,
        heading: "Installation sur Opera",
        steps: [
          {
            num: 1,
            title: "Ouvrez le menu Opera",
            detail:
              "Cliquez sur le bouton « O » rouge en haut à gauche de la fenêtre Opera.",
          },
          {
            num: 2,
            title: "Allez dans « Page » → « Créer un raccourci… »",
            detail:
              "Dans le menu, descendez jusqu'à « Page » puis choisissez « Créer un raccourci… » (ou « Installer l'application » selon votre version d'Opera).",
            icon: <MoreVertical className="w-4 h-4" />,
          },
          {
            num: 3,
            title: "Cochez « Ouvrir comme fenêtre »",
            detail:
              "Dans la boîte de dialogue, cochez « Ouvrir comme fenêtre » pour qu'Aurora s'ouvre dans sa propre fenêtre dédiée.",
            icon: <Monitor className="w-4 h-4" />,
          },
          {
            num: 4,
            title: "Cliquez « Créer »",
            detail:
              "Un raccourci Aurora est créé sur votre bureau et dans le menu Démarrer. L'app s'ouvre dans une fenêtre dédiée.",
            icon: <Check className="w-4 h-4 text-emerald-400" />,
          },
        ],
      };
    case "firefox":
      return {
        supported: false,
        heading: "Installation sur Firefox",
        steps: [
          {
            num: 1,
            title: "Firefox ne supporte pas l'installation PWA native",
            detail:
              "Pour installer Aurora comme une vraie application, utilisez plutôt Google Chrome ou Microsoft Edge.",
            icon: <Info className="w-4 h-4" />,
          },
          {
            num: 2,
            title: "Alternative : ajoutez aux favoris",
            detail:
              "Appuyez sur Ctrl+D pour ajouter Aurora à vos favoris — vous y accéderez rapidement depuis la barre personnelle.",
          },
        ],
      };
    case "safari":
      return {
        supported: false,
        heading: "Installation sur Safari (Mac)",
        steps: [
          {
            num: 1,
            title: "Safari ne supporte pas l'installation PWA native",
            detail:
              "Pour installer Aurora comme une vraie application, utilisez Google Chrome ou Microsoft Edge sur Mac.",
            icon: <Info className="w-4 h-4" />,
          },
          {
            num: 2,
            title: "Alternative : ajoutez au Dock",
            detail:
              "Faites glisser l'URL depuis la barre d'adresse vers le Dock (à droite de la ligne de séparation) pour un accès rapide.",
          },
        ],
      };
    case "ios-safari":
      return {
        supported: true,
        heading: "Installation sur iPhone / iPad",
        steps: [
          {
            num: 1,
            title: "Appuyez sur le bouton Partager",
            detail:
              "L'icône carrée avec une flèche vers le haut, en bas de l'écran Safari.",
            icon: <Share className="w-4 h-4" />,
          },
          {
            num: 2,
            title: "Sélectionnez « Sur l'écran d'accueil »",
            detail:
              "Faites défiler vers le bas et appuyez sur « Sur l'écran d'accueil ».",
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            num: 3,
            title: "Appuyez sur « Ajouter »",
            detail:
              "Aurora apparaît sur votre écran d'accueil comme une vraie app. Elle fonctionne en plein écran, sans la barre Safari.",
            icon: <Check className="w-4 h-4 text-emerald-400" />,
          },
        ],
      };
    case "android-chrome":
      return {
        supported: true,
        heading: "Installation sur Android",
        steps: [
          {
            num: 1,
            title: "Appuyez sur les 3 points",
            detail: "En haut à droite de Chrome / Opera mobile.",
            icon: <MoreVertical className="w-4 h-4" />,
          },
          {
            num: 2,
            title: "Sélectionnez « Ajouter à l'écran d'accueil »",
            detail: "Ou « Installer l'application » si proposé.",
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            num: 3,
            title: "Confirmez avec « Installer »",
            detail:
              "Aurora s'installe comme une app native. Elle fonctionne même hors-ligne.",
            icon: <Check className="w-4 h-4 text-emerald-400" />,
          },
        ],
      };
    default:
      return {
        supported: false,
        heading: "Installer Aurora",
        steps: [
          {
            num: 1,
            title: "Utilisez Chrome ou Edge pour une installation native",
            detail:
              "Les navigateurs basés sur Chromium (Chrome, Edge) permettent d'installer Aurora comme une vraie application.",
            icon: <Info className="w-4 h-4" />,
          },
        ],
      };
  }
}

/**
 * Barre d'outils flottante commune à toutes les apps LEGAGNEUR DÉVELOPPEMENT.
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
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)").matches ||
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

  useEffect(() => {
    if (!autoHideMs || !visible) return;
    const t = setTimeout(() => setVisible(false), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showInstallModal) {
          setShowInstallModal(false);
        } else {
          setVisible((v) => !v);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showInstallModal]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Navigateur compatible (Chrome/Edge) : invite native
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Navigateur sans support natif (Opera/Firefox/Safari) : modal in-app
      setShowInstallModal(true);
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch {
      // ignore
    }
    setTimeout(() => {
      if (!window.closed) {
        window.location.href = portfolioUrl;
      }
    }, 150);
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = portfolioUrl;
    }
  };

  if (installed) return null;

  if (!visible) {
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

  const browser = detectBrowser();
  const { steps, supported, heading } = getInstallSteps(browser);

  return (
    <>
      <div className="fixed top-3 right-3 z-[9999] flex items-center gap-2 p-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl animate-fade-in">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition"
          aria-label="Retour au portfolio"
          title="Retour au portfolio LEGAGNEUR DÉVELOPPEMENT"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Portfolio</span>
        </button>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition"
          aria-label="Installer l'application"
          title="Installer cette application sur votre appareil"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Installer</span>
        </button>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-white hover:bg-rose-500/30 transition"
          aria-label="Fermer"
          title="Fermer et revenir au portfolio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal d'installation in-app */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0e0e16] border border-gray-200 dark:border-white/15 shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">Installer l'application</h3>
                  <p className="text-xs text-white/80">{heading}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-white/80 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {!supported && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Votre navigateur ne supporte pas l'installation PWA native.
                    Suivez les étapes ci-dessous ou utilisez Chrome / Edge pour
                    une expérience optimale.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-white/70">
                Aurora est 100% gratuite et fonctionne même sans internet après
                installation. Suivez ces étapes simples :
              </p>

              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="rounded-xl bg-gray-100 dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                          {step.num}
                        </span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
                        {step.title}
                        {step.icon}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white/60 ml-10">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-white/40">
                  Navigateur détecté :{" "}
                  <span className="font-semibold capitalize">{browser}</span>
                </p>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white/10 text-white text-xs font-semibold hover:bg-gray-800 dark:hover:bg-white/20 transition"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppToolbar;
