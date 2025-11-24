import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (provider: 'google' | 'apple' | 'tiktok') => void;
}

export function LoginModal({ open, onOpenChange, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  const handleLogin = async (provider: 'google' | 'apple' | 'tiktok') => {
    setIsLoading(true);
    try {
      // Simulate auth - in production would call OAuth endpoints
      onLogin?.(provider);
      
      // Redirect to auth endpoint after short delay for effect
      setTimeout(() => {
        // In production: window.location.href = `/api/auth/${provider}`;
        console.log(`Login with ${provider}`);
        setIsLoading(false);
        onOpenChange(false);
      }, 500);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-end md:items-center md:justify-center"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:w-96 bg-gradient-to-b from-slate-900 to-black rounded-t-3xl md:rounded-3xl p-6 border border-purple-500/20"
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold text-white">
                Staň se legendou
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Přihlaste se a dostanete cool jméno + odznaky + 500 ChaosCoins
            </p>

            {/* Login Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-2xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                <span className="text-xl">🔵</span>
                Přihlášení přes Google
              </motion.button>

              {/* Apple */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin('apple')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-black border-2 border-white text-white font-bold py-3 rounded-2xl hover:bg-white/10 transition disabled:opacity-50"
              >
                <span className="text-xl">🍎</span>
                Přihlášení přes Apple
              </motion.button>

              {/* TikTok */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin('tiktok')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-black via-gray-900 to-black border-2 border-cyan-400 text-cyan-400 font-bold py-3 rounded-2xl hover:border-cyan-300 hover:text-cyan-300 transition disabled:opacity-50"
              >
                <span className="text-xl">🎵</span>
                Přihlášení přes TikTok
              </motion.button>
            </div>

            {/* Or divider */}
            <div className="my-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 h-px bg-gray-600" />
              <span>nebo</span>
              <div className="flex-1 h-px bg-gray-600" />
            </div>

            {/* Email Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-purple-600/20 border-2 border-purple-500 text-purple-300 font-bold py-3 rounded-2xl hover:bg-purple-600/30 transition"
            >
              <span className="text-xl">📧</span>
              Přihlášení e-mailem
            </motion.button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 mt-6 text-center">
              Vaše údaje jsou chráněny. Nikdy nebude prodána nebo sdílena.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
