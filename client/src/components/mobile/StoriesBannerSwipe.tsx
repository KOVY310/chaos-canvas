import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function StoriesBannerSwipe() {
  const [story, setStory] = useState(0);

  const stories = [
    { title: 'Daily Prompt', desc: 'Létající svíčková nad Prahou 🇨🇿' },
    { title: 'National League', desc: 'Filipíny vedou o 520k 🇵🇭 CZ #2' },
    { title: 'Takeover', desc: 'Chaos Takeover za 2d 15h 32m' },
  ];

  const current = stories[story];

  return (
    <div className="md:hidden sticky top-0 z-40 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between gap-2"
      >
        <button
          onClick={() => setStory((s) => (s - 1 + stories.length) % stories.length)}
          className="p-1 hover:bg-primary/20 rounded-lg transition-all"
          data-testid="button-story-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-xs font-medium text-muted-foreground">{current.title}</p>
          <p className="font-heading font-bold text-sm line-clamp-1">{current.desc}</p>
        </div>

        <button
          onClick={() => setStory((s) => (s + 1) % stories.length)}
          className="p-1 hover:bg-primary/20 rounded-lg transition-all"
          data-testid="button-story-next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="flex gap-1 justify-center mt-2">
        {stories.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 bg-primary/30 rounded-full cursor-pointer"
            animate={{ width: i === story ? 32 : 8 }}
            transition={{ duration: 0.3 }}
            onClick={() => setStory(i)}
          />
        ))}
      </div>
    </div>
  );
}
