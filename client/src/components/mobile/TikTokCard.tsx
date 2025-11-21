import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Flame, Skull } from 'lucide-react';

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
        setTimeout(() => setReaction(null), 800);
      } else {
        // Swipe left = nuke
        setReaction('nuke');
        onReact?.('nuke');
        setTimeout(() => setReaction(null), 800);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-card to-background"
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Card Container */}
      <div className="w-full max-w-sm h-96 rounded-2xl overflow-hidden relative group">
        {/* Image */}
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <p className="text-white text-center px-4 font-heading font-bold">{title}</p>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-heading font-bold text-lg line-clamp-2">{title}</p>
          <p className="text-sm text-white/80">@{author}</p>
        </div>

        {/* Reaction Overlay */}
        {reaction && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none"
          >
            {reaction === 'fire' ? '🔥' : '💀'}
          </motion.div>
        )}

        {/* Like Animation */}
        {likeAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none"
          >
            ❤️
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-8 justify-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setLiked(!liked);
            onLike?.();
          }}
          className="flex flex-col items-center gap-1"
          data-testid="button-like"
        >
          <Heart
            className="w-7 h-7"
            fill={liked ? 'currentColor' : 'none'}
            color={liked ? '#ef4444' : 'currentColor'}
          />
          <span className="text-sm font-medium">{likes}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
          data-testid="button-share"
        >
          <Share2 className="w-7 h-7" />
          <span className="text-sm font-medium">Sdílet</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
