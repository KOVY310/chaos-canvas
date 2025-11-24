import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (provider: 'google' | 'apple' | 'tiktok' | 'email') => void;
}

export function LoginModal({ open, onOpenChange, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailLogin, setEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulate email auth
      onLogin?.('email');
      
      // Show success state
      setTimeout(() => {
        setLoginSuccess(true);
        setIsLoading(false);
        
        // Close modal after success animation
        setTimeout(() => {
          setLoginSuccess(false);
          setEmail('');
          setEmailLogin(false);
          onOpenChange(false);
        }, 1500);
      }, 500);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const handleOAuthClick = () => {
    // Show tooltip or toast that OAuth is coming soon
    console.log('OAuth coming soon');
  };

  // Success screen
  if (loginSuccess) {
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
              className="w-full md:w-96 bg-gradient-to-b from-green-900/20 to-black rounded-t-3xl md:rounded-3xl p-6 border border-green-500/50 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              </motion.div>
              
              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                Vítej v Chaos legendě!
              </h3>
              <p className="text-sm text-green-300 mb-4">
                Tvůj profil byl úspěšně aktivován
              </p>
              <p className="text-xs text-gray-400">
                Získáváš 500 ChaosCoins a cool jméno
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Email login form
  if (emailLogin) {
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-white">
                  Přihlášení e-mailem
                </h2>
                <button
                  onClick={() => {
                    setEmailLogin(false);
                    setEmail('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Email adresa
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvuj@email.cz"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="input-email-login"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Na tvůj e-mail pošleme ověřovací kód
                </p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
                  data-testid="button-email-login-submit"
                >
                  {isLoading ? 'Ověřuji...' : 'Pokračovat'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin(false);
                    setEmail('');
                  }}
                  className="w-full text-gray-400 hover:text-white text-sm py-2 transition"
                >
                  Zpět
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Main modal
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
              {/* Google - Coming Soon */}
              <div className="relative">
                <button
                  disabled
                  onClick={handleOAuthClick}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 text-gray-400 font-bold py-3 rounded-2xl opacity-50 cursor-not-allowed"
                >
                  <span className="text-xl">🔵</span>
                  Přihlášení přes Google
                </button>
                <span className="absolute top-1 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Brzy
                </span>
              </div>

              {/* Apple - Coming Soon */}
              <div className="relative">
                <button
                  disabled
                  onClick={handleOAuthClick}
                  className="w-full flex items-center justify-center gap-3 bg-black/50 border-2 border-gray-500 text-gray-400 font-bold py-3 rounded-2xl opacity-50 cursor-not-allowed"
                >
                  <span className="text-xl">🍎</span>
                  Přihlášení přes Apple
                </button>
                <span className="absolute top-1 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Brzy
                </span>
              </div>

              {/* TikTok - Coming Soon */}
              <div className="relative">
                <button
                  disabled
                  onClick={handleOAuthClick}
                  className="w-full flex items-center justify-center gap-3 bg-black/50 border-2 border-gray-500 text-gray-400 font-bold py-3 rounded-2xl opacity-50 cursor-not-allowed"
                >
                  <span className="text-xl">🎵</span>
                  Přihlášení přes TikTok
                </button>
                <span className="absolute top-1 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Brzy
                </span>
              </div>
            </div>

            {/* Or divider */}
            <div className="my-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 h-px bg-gray-600" />
              <span>nebo</span>
              <div className="flex-1 h-px bg-gray-600" />
            </div>

            {/* Email Option - WORKING */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEmailLogin(true)}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-2xl transition neon-glow"
              data-testid="button-email-login"
            >
              <Mail className="w-5 h-5" />
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
