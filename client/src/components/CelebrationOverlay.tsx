import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
  show: boolean;
  text: string;
}

export function CelebrationOverlay({ show, text }: CelebrationOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 10 }}
            className="text-center"
          >
            {/* Celebration text */}
            <motion.h1
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="font-heading text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-500 drop-shadow-2xl"
            >
              {text}
            </motion.h1>

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 100,
                  y: Math.sin((i / 8) * Math.PI * 2) * 100 - 50,
                  opacity: 0,
                }}
                transition={{ duration: 1, delay: 0.1 }}
                className="absolute text-3xl"
              >
                {i % 2 === 0 ? '✨' : '🎉'}
              </motion.div>
            ))}
          </motion.div>

          {/* Rainbow flash background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-500"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
