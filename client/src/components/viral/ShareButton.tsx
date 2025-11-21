import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ShareButton() {
  const { toast } = useToast();

  const handleShare = () => {
    const referralUrl = 'https://chaoscanvas.replit.dev/?ref=tiktok-viral';
    
    try {
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: 'Zkopírován!',
        description: 'Odkaz je připraven ke sdílení 🚀',
      });
    } catch (err) {
      // Fallback
      prompt('Zkopíruj odkaz:', referralUrl);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="default"
      className="w-full gap-2"
      data-testid="button-share-chaos"
    >
      <Share2 className="w-4 h-4" />
      Sdílej tento chaos
    </Button>
  );
}
