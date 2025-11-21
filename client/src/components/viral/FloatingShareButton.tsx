import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

export function FloatingShareButton() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'ChaosCanvas',
      text: "Česko je právě #1 v ChaosCanvas! Pojď nám pomoct udržet to 🇨🇿😂",
      url: 'https://chaoscanvas.replit.dev/?ref=tiktok-viral',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.text + '\n' + shareData.url);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (!isMobile) return null;

  return (
    <Button
      onClick={handleShare}
      size="lg"
      className="fixed bottom-20 right-4 rounded-full shadow-lg gap-2 z-40"
      data-testid="button-floating-share"
    >
      <Share2 className="w-5 h-5" />
      Sdílej chaos
    </Button>
  );
}
