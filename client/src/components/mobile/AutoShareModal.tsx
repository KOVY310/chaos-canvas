import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AutoShareModalProps {
  open: boolean;
  onClose: () => void;
  contentTitle: string;
  imageUrl?: string;
}

export function AutoShareModal({ open, onClose, contentTitle, imageUrl }: AutoShareModalProps) {
  const [displayTitle, setDisplayTitle] = useState('');

  // Update displayTitle whenever contentTitle changes or modal opens
  useEffect(() => {
    console.log('[AUTOSHARE] useEffect triggered - open:', open, 'contentTitle:', contentTitle);
    if (open) {
      if (contentTitle && contentTitle.trim()) {
        const title = contentTitle.trim();
        setDisplayTitle(title);
        console.log('[AUTOSHARE] ✅ Set title from contentTitle:', title);
      } else {
        // Fallback if no contentTitle
        setDisplayTitle('můj chaos');
        console.log('[AUTOSHARE] ⚠️ No contentTitle, using fallback: můj chaos');
      }
    }
  }, [open, contentTitle]);

  const handleShare = (platform: string) => {
    // Use state-managed displayTitle
    const finalTitle = displayTitle || 'můj chaos';
    const text = `Právě jsem přidal svou verzi "${finalTitle}" 😭🔥 chaos.canvas`;
    const baseUrl = window.location.origin;
    
    // Build share URL with image for OG meta tags
    let shareUrl = `${baseUrl}?ref=${platform}`;
    if (imageUrl) {
      const encodedImg = encodeURIComponent(imageUrl);
      shareUrl += `&og_image=${encodedImg}&og_title=${encodeURIComponent(finalTitle)}`;
      console.log('[SHARE] Share URL with image:', shareUrl);
    }
    console.log('[SHARE] Platform:', platform, 'Title:', finalTitle, 'Image:', imageUrl);

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
        twitter: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
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
            role="dialog"
            aria-labelledby="share-title"
            aria-describedby="share-description"
          >
            {/* Header */}
            <h2 id="share-title" className="text-xl font-heading font-bold text-white mb-6">Sdílet můj chaos</h2>
            <p id="share-description" className="sr-only">Sdíley svůj obsah na sociálních sítích</p>

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
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/20"
                data-testid="button-share-twitter"
              >
                𝕏 Sdílet na X
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
