import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareChaosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareChaosModal({ open, onOpenChange }: ShareChaosModalProps) {
  const handleShare = async () => {
    const text = 'Právě jsem přidal tenhle chaos do ChaosCanvas 😂🇨🇿 chaos.canvas';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ChaosCanvas',
          text,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:hidden">
        <DialogHeader>
          <DialogTitle>Sdílet tvůj chaos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Právě jsem přidal tenhle chaos do ChaosCanvas 😂🇨🇿
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-close-share"
            >
              Zrušit
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-share-now"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Sdílet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
