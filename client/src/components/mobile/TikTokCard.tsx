import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2 } from 'lucide-react';

interface TikTokCardProps {
  id: string;
  imageUrl?: string;
  title: string;
  author: string;
  likes: number;
  onLike?: () => void;
  onReact?: (type: 'fire' | 'nuke') => void;
}

export function TikTokCard({
  id,
  imageUrl,
  title,
  author,
  likes,
  onLike,
  onReact,
}: TikTokCardProps) {
  const [liked, setLiked] = useState(false);
  const [reaction, setReaction] = useState<'fire' | 'nuke' | null>(null);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const startX = useRef(0);

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      setLikeAnimation(true);
      onLike?.();
      if ('vibrate' in navigator) navigator.vibrate([10, 5, 20]);
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      }
      setTimeout(() => setLikeAnimation(false), 600);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe right = fire
        setReaction('fire');
        onReact?.('fire');
        if ('vibrate' in navigator) navigator.vibrate([15, 10, 15]);
        setTimeout(() => setReaction(null), 800);
      } else {
        // Swipe left = nuke
        setReaction('nuke');
        onReact?.('nuke');
        if ('vibrate' in navigator) navigator.vibrate([20, 5, 20]);
        setTimeout(() => setReaction(null), 800);
      }
    }
  };

  console.log('[TIKTOKCARD] Rendering with imageUrl:', imageUrl, 'title:', title);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-screen flex flex-col items-center justify-center p-3 bg-background"
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Card Container - 20px rounded, subtle shadow, 12px gaps */}
      <motion.div
        className="w-full h-[calc(100vh-140px)] rounded-md bg-gradient-to-br from-purple-600/40 to-pink-600/40 overflow-hidden relative group shadow-lg"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
      >
        {/* Image */}
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              style={{ backgroundColor: '#f3f4f6' }}
              onError={(e) => {
                console.error('[TIKTOK] Image FAILED:', imageUrl, e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log('[TIKTOK] Image LOADED OK:', imageUrl);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-6">
            <p className="text-white text-center font-heading font-bold text-2xl line-clamp-4">
              {title}
            </p>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-heading font-bold text-lg line-clamp-2">{title}</p>
          <p className="text-sm text-white/70 mt-1">@{author}</p>
        </div>

        {/* Reaction Overlay */}
        {reaction && (
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center text-7xl pointer-events-none"
          >
            {reaction === 'fire' ? '🔥' : '💀'}
          </motion.div>
        )}

        {/* Like Animation - Flying hearts */}
        {likeAnimation && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: 0,
                  x: Math.cos((i / 8) * Math.PI * 2) * 30,
                }}
                animate={{
                  opacity: 0,
                  y: -200,
                  x: Math.cos((i / 8) * Math.PI * 2) * 60,
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 text-4xl pointer-events-none"
              >
                ❤️
              </motion.div>
            ))}
          </>
        )}

        {/* Actions - RIGHT SIDE of image (overlay on bottom-right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              setLiked(!liked);
              onLike?.();
              if ('vibrate' in navigator) navigator.vibrate([5, 5, 10]);
            }}
            className="flex flex-col items-center gap-0.5 group"
            data-testid="button-like"
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              <Heart
                className="w-5 h-5 transition-all group-hover:text-red-500 text-white drop-shadow-md"
                fill={liked ? 'currentColor' : 'none'}
                color={liked ? '#ef4444' : 'white'}
              />
            </motion.div>
            <span className="text-xs font-medium text-white drop-shadow-md">
              {likes.toLocaleString()}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            className="flex flex-col items-center gap-0.5 group"
            data-testid="button-share"
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              <Share2 className="w-5 h-5 transition-all group-hover:text-primary text-white drop-shadow-md" />
            </motion.div>
            <span className="text-xs font-medium text-white drop-shadow-md">Sdílet</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
