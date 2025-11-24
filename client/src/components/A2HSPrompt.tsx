import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function A2HSPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem('a2hsPromptDismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setDismissed(true);
      }
    };

    checkInstalled();
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDismissed(true);
      sessionStorage.setItem('a2hsPromptDismissed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  // Trigger prompt after first contribution
  useEffect(() => {
    const handleContribution = () => {
      if (!dismissed && deferredPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('contribution-added', handleContribution);
    return () => window.removeEventListener('contribution-added', handleContribution);
  }, [dismissed, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
        sessionStorage.setItem('a2hsPromptDismissed', 'true');
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('a2hsPromptDismissed', 'true');
  };

  // Don't show if no prompt available, dismissed, or not mobile-like environment
  if (!showPrompt || !deferredPrompt || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-32 md:bottom-8 left-4 right-4 z-50 bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-2xl shadow-2xl overflow-hidden"
          data-testid="a2hs-prompt"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 p-[2px]">
            <div className="absolute inset-[2px] bg-black/40 rounded-2xl" />
          </div>

          {/* Content */}
          <div className="relative px-6 py-5 md:py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-white font-heading font-bold text-lg md:text-base">
                  ⚡ Přidej ChaosCanvas na plochu!
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Přístup za 1 klik • Bez internetu • Offline režim
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors mt-1"
                aria-label="Dismiss"
                data-testid="button-a2hs-dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white text-pink-600 hover:bg-gray-100 font-heading font-bold text-sm md:text-xs h-9"
                data-testid="button-install-app"
              >
                Instalovat
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 text-white border-white/30 hover:bg-white/10 font-heading font-bold text-sm md:text-xs h-9"
                data-testid="button-a2hs-later"
              >
                Později
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
