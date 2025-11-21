import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function StoriesBanner() {
  const [story, setStory] = useState(0);

  const stories = [
    { text: 'Létající svíčková nad Prahou', confetti: false },
    { text: 'Filipíny vedou o 520k příspěvků - CZ #2', confetti: true },
    { text: 'Chaos Takeover za 3d 12h 45m', confetti: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStory((s) => (s + 1) % stories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stories[story].confetti) {
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 360,
          origin: { y: 0.2 },
        });
      }
    }
  }, [story]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-border p-3 text-center"
      data-testid="banner-stories"
    >
      <motion.p
        key={story}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading font-bold text-sm"
      >
        {stories[story].text}
      </motion.p>
      <div className="flex gap-1 justify-center mt-2">
        {stories.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 bg-primary/30 rounded-full"
            animate={{ width: i === story ? 24 : 8 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
