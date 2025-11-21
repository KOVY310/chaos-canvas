import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function MobileLeagueBanner() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="md:hidden sticky top-0 z-30 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-border p-4 space-y-2"
      data-testid="banner-league"
    >
      <div className="flex items-center gap-2 justify-center">
        <Sparkles className="w-5 h-5 text-orange-500 animate-spin" />
        <div className="text-center">
          <p className="font-heading font-bold text-lg">
            🇵🇭 Filipíny vedou o 420k!
          </p>
          <p className="text-sm text-muted-foreground">
            Česko #2 🇨🇿
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
      {showConfetti && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: -100, opacity: 0 }}
              transition={{ duration: 2, delay: i * 0.1 }}
              className="text-xl"
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
