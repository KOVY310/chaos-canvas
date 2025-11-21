import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, RotateCcw } from 'lucide-react';
import type { Contribution } from '@shared/schema';

interface MobileTikTokCanvasProps {
  contributions: Contribution[];
  onAddContribution?: (data: any) => void;
  isLoading?: boolean;
}

export function MobileTikTokCanvas({
  contributions,
  onAddContribution,
  isLoading,
}: MobileTikTokCanvasProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [pullRefresh, setPullRefresh] = useState(0);
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);
  const startY = useRef(0);

  const currentContribution = contributions[currentIndex];

  // Haptic feedback
  const vibrate = (pattern: number[] = [100]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Confetti burst
  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    vibrate([100, 50, 100]);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullRefresh(Math.min(diff / 100, 1));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY.current;

    // Swipe up/down for navigation
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // Swipe up = next
        setCurrentIndex((i) => (i + 1) % contributions.length);
        triggerConfetti();
      } else {
        // Swipe down = previous
        setCurrentIndex((i) => (i - 1 + contributions.length) % contributions.length);
        triggerConfetti();
      }
    }

    // Pull-to-refresh
    if (pullRefresh > 0.5) {
      triggerConfetti();
      // Trigger refresh logic
    }
    setPullRefresh(0);
  };

  // Double tap to boost
  const handleDoubleClick = () => {
    if (currentContribution) {
      setLikeAnimation(currentContribution.id);
      vibrate([50, 30, 50, 30, 200]);
      triggerConfetti();
      setTimeout(() => setLikeAnimation(null), 600);
    }
  };

  const toggleLike = () => {
    if (!currentContribution) return;
    const newLiked = new Set(liked);
    if (newLiked.has(currentContribution.id)) {
      newLiked.delete(currentContribution.id);
    } else {
      newLiked.add(currentContribution.id);
      triggerConfetti();
      vibrate([100, 50, 100]);

      // Heart animation
      setLikeAnimation(currentContribution.id);
      setTimeout(() => setLikeAnimation(null), 600);
    }
    setLiked(newLiked);
  };

  if (!contributions.length) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Ještě nic tady není...</p>
          <p className="text-sm text-muted-foreground mt-2">Přidej první věc!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen bg-background overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <motion.div
          style={{ scaleY: pullRefresh }}
          className="h-12 bg-primary/20 flex items-center justify-center"
        >
          <RotateCcw className="w-6 h-6 text-primary" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer bg-gradient-to-br from-card to-background"
        onDoubleClick={handleDoubleClick}
      >
          {/* Content Preview */}
          {currentContribution?.imageUrl && (
            <img
              src={currentContribution.imageUrl}
              alt="contribution"
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
          )}

          {/* Contribution Info */}
          <div className="w-full space-y-2">
            <p className="font-heading font-bold text-lg">
              {currentContribution?.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentContribution?.description}
            </p>
            {currentContribution?.tags && (
              <div className="flex gap-2 flex-wrap">
                {currentContribution.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Like Animation */}
          {likeAnimation === currentContribution?.id && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute text-6xl"
            >
              ❤️
            </motion.div>
          )}
      </motion.div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-24 space-y-4 z-20">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleLike}
          className={`flex flex-col items-center gap-1 ${
            liked.has(currentContribution?.id || '') ? 'text-red-500' : ''
          }`}
          data-testid="button-like"
        >
          <Heart
            className="w-6 h-6 fill-current"
            fill={liked.has(currentContribution?.id || '') ? 'currentColor' : 'none'}
          />
          <span className="text-xs">{Math.floor(Math.random() * 1000)}</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center gap-1 text-foreground"
          data-testid="button-share-action"
          onClick={() => {
            vibrate([100, 50, 100]);
            // Will handle share in parent
          }}
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs">Sdílet</span>
        </motion.button>

        {/* Remix (Long Press) */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center gap-1 text-foreground"
          data-testid="button-remix"
          onContextMenu={(e) => {
            e.preventDefault();
            vibrate([50, 30, 50]);
            // Remix logic
          }}
        >
          <RotateCcw className="w-6 h-6" />
          <span className="text-xs">Remix</span>
        </motion.button>
      </div>

      {/* Indicator */}
      <div className="absolute bottom-32 left-4 text-xs text-muted-foreground">
        {currentIndex + 1} / {contributions.length}
      </div>
    </div>
  );
}
