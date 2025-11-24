import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AutoShareModalProps {
  open: boolean;
  onClose: () => void;
  contentTitle: string;
}

export function AutoShareModal({ open, onClose, contentTitle }: AutoShareModalProps) {
  const handleShare = (platform: string) => {
    const text = `Právě jsem přidal svou verzi "${contentTitle}" 😭🔥 chaos.canvas`;
    const url = window.location.origin;
    const shareUrl = `${url}?ref=${platform}`;

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: 'ChaosCanvas',
        text,
        url: shareUrl,
      }).catch(() => {});
    } else {
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(shareUrl);
      const links: Record<string, string> = {
        tiktok: `https://www.tiktok.com/upload?text=${encodedText}%20${encodedUrl}`,
        instagram: `https://www.instagram.com/`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      };
      if (links[platform]) window.open(links[platform]);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-t-3xl p-6 border-t border-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">Sdílet můj chaos</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="button-close-share"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleShare('tiktok')}
                className="w-full bg-black hover:bg-gray-900 border border-white/20 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                data-testid="button-share-tiktok"
              >
                🎵 Sdílet na TikToku
              </Button>

              <Button
                onClick={() => handleShare('instagram')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                data-testid="button-share-instagram"
              >
                📸 Sdílet na Instagramu
              </Button>

              <Button
                onClick={() => handleShare('twitter')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                data-testid="button-share-twitter"
              >
                𝕏 Sdílet na Twitteru
              </Button>

              {navigator.share && (
                <Button
                  onClick={() => handleShare('native')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  data-testid="button-share-native"
                >
                  ✨ Sdílet (obecně)
                </Button>
              )}
            </div>

            {/* Close hint */}
            <p className="text-xs text-gray-500 text-center mt-6">Můžeš také sdílet kdykoliv později v profilu</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
