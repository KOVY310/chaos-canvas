import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function StoriesBannerSwipe() {
  const [story, setStory] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setStory((s) => (s + 1) % stories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const stories = [
    { title: 'Daily Prompt', desc: 'Létající svíčková nad Prahou 🇨🇿', emoji: '✨' },
    { title: 'National League', desc: 'Filipíny vedou o 520k 🇵🇭 CZ #2', emoji: '🔥' },
    { title: 'Takeover', desc: 'Chaos Takeover za 2d 15h 32m', emoji: '💣' },
  ];

  const current = stories[story];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="md:hidden sticky top-0 z-40 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent"
    >
      {/* Glassmorphism card */}
      <motion.div
        className="glassmorphism rounded-md p-4 space-y-3"
        key={story}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setStory((s) => (s - 1 + stories.length) % stories.length);
              setAutoPlay(false);
            }}
            className="p-1 hover:bg-white/10 rounded-sm transition-all active:scale-75"
            data-testid="button-story-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-2xl mb-1">{current.emoji}</p>
            <p className="text-xs font-medium text-muted-foreground">{current.title}</p>
            <p className="font-heading font-bold text-sm line-clamp-1 text-foreground">
              {current.desc}
            </p>
          </div>

          <button
            onClick={() => {
              setStory((s) => (s + 1) % stories.length);
              setAutoPlay(false);
            }}
            className="p-1 hover:bg-white/10 rounded-sm transition-all active:scale-75"
            data-testid="button-story-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-1 justify-center">
          {stories.map((_, i) => (
            <motion.div
              key={i}
              className="h-0.5 bg-primary/40 rounded-full cursor-pointer hover:bg-primary/60 transition-all"
              animate={{ width: i === story ? 24 : 8 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setStory(i);
                setAutoPlay(false);
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
