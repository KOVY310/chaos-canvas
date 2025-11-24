import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { useEffect, useState } from 'react';

const DAILY_PROMPT = "Létající svíčková nad Prahou";
const DAILY_STYLE = "surreal,vibrant,chaotic";

export default function TodayPage() {
  const [, setLocation] = useLocation();
  const { t } = useApp();
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Check for referral tracking
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref === 'tiktok') {
      // Trigger confetti + welcome
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAAA=');
      audio.play().catch(() => {});
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-purple-900 to-black overflow-hidden flex flex-col items-center justify-center relative">
      {/* Full-screen animated background */}
      <motion.div
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
          backgroundPosition: '0% 0%',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen opacity-20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen opacity-20 blur-3xl"
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-12"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold">
            C
          </div>
        </motion.div>

        {/* Daily prompt - animated */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p className="text-sm text-pink-300 font-bold mb-4 tracking-widest">DNESKA NA CANVAS</p>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-8 leading-tight">
            {DAILY_PROMPT}
          </h1>
        </motion.div>

        {/* Animated prompt tagline */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-lg text-gray-300 mb-12"
        >
          ✨ Tisíce lidí už tvoří. Přidej svou verzi. ✨
        </motion.p>

        {/* Massive CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button
            onClick={() => {
              // Pass prompt to creator and navigate
              localStorage.setItem('creatorPrompt', DAILY_PROMPT);
              localStorage.setItem('creatorStyle', DAILY_STYLE);
              setLocation('/');
            }}
            className="w-full md:w-96 h-20 text-2xl font-heading font-black bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-3xl shadow-2xl neon-glow transition-all"
            data-testid="button-add-chaos-daily"
          >
            🎨 PŘIDEJ SVŮJ CHAOS
          </Button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-400 mb-4">Joined by:</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-300">4.2M</p>
              <p className="text-xs text-gray-400">tvůrců</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-300">892K</p>
              <p className="text-xs text-gray-400">denní příspěvků</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-300">$4.2M</p>
              <p className="text-xs text-gray-400">vyplaceno</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
