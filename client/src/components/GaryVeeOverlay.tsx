import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GaryVeeOverlayProps {
  onCTAClick: () => void;
  onClose: () => void;
}

export function GaryVeeOverlay({ onCTAClick, onClose }: GaryVeeOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4"
      data-testid="overlay-gary-vee"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-gradient-to-br from-purple-900 via-black to-pink-900 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(45deg, #FF006E, #00F5FF, #FF006E)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Icon with pulse */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
          >
            <div className="text-4xl">🎨</div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl md:text-5xl font-heading font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 mb-4"
          >
            PŘIDEJ SVOU VERZI!
          </motion.h1>

          {/* Subtext */}
          <p className="text-lg text-cyan-300 font-bold mb-2">
            Jsi součástí něčeho velkého 🔥
          </p>
          <p className="text-sm text-gray-300 mb-8">
            Přidej svůj chaos. Vítězí ty nejcreativnější.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="bg-black/40 rounded-xl p-3 border border-cyan-400/30"
            >
              <div className="text-2xl font-heading font-black text-cyan-400">892K</div>
              <div className="text-xs text-gray-400">Příspěvků dnes</div>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="bg-black/40 rounded-xl p-3 border border-pink-400/30"
            >
              <div className="text-2xl font-heading font-black text-pink-400">4.2M</div>
              <div className="text-xs text-gray-400">Tvůrců online</div>
            </motion.div>
          </div>

          {/* CTA Button - MASSIVE */}
          <Button
            onClick={onCTAClick}
            className="w-full h-16 text-xl font-heading font-black bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-2xl shadow-2xl"
            data-testid="button-add-version-gary"
          >
            <Plus className="w-6 h-6 mr-2" />
            PŘIDEJ SVŮJ CHAOS!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
