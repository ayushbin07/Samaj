"use client";

import * as React from "react";
import { Download, X, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  installPwa: () => Promise<void>;
}

const PwaContext = React.createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  installPwa: async () => {},
});

export const usePwa = () => React.useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [showIOSModal, setShowIOSModal] = React.useState(false);

  React.useEffect(() => {
    // 1. Register Service Worker in supported browsers
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA Service Worker registration failed:", error);
          });
      });
    }

    // 2. Detect if already running in standalone mode (installed app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capture beforeinstallprompt event for Chromium / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Check if user previously dismissed banner in this session
      const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowBanner(false);
      console.log("PWA was installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("Error during PWA installation:", err);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa_banner_dismissed", "true");
  };

  return (
    <PwaContext.Provider value={{ isInstallable, isInstalled, isIOS, installPwa }}>
      {children}

      {/* Floating PWA Install Notification Banner */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] p-4 rounded-2xl bg-[var(--color-surface-2)]/95 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#09090b] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src="/icons/icon-192x192.png"
                alt="Community App Icon"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                  Install Community
                </h4>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full transition-colors cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                Add to your home screen for quick access, offline reading, and standalone app experience.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={installPwa}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--color-accent)] text-[#09090B] font-semibold text-xs hover:bg-[var(--color-accent-hover)] transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Download size={13} className="stroke-[2.5]" />
                  <span>Install App</span>
                </button>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-[var(--color-accent)]" />
                <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                  Install on iOS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              To install Community on your iPhone or iPad, follow these simple steps in Safari:
            </p>
            <ol className="text-xs text-[var(--color-text-primary)] space-y-2.5 list-decimal list-inside bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] leading-relaxed">
              <li>Tap the <strong className="text-[var(--color-accent)]">Share button</strong> (square with arrow up) at the bottom of Safari.</li>
              <li>Scroll down and select <strong className="text-[var(--color-accent)]">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-[var(--color-accent)]">Add</strong> in the top right corner.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-full bg-[var(--color-accent)] text-[#09090B] font-semibold text-xs hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
