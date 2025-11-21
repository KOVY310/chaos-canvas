import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

interface SaveYourChaosPromptProps {
  contributionCount: number;
  onProceed?: () => void;
}

export function SaveYourChaosPrompt({ contributionCount, onProceed }: SaveYourChaosPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUserId } = useApp();

  useEffect(() => {
    // Show after 3rd contribution for anonymous users
    if (contributionCount === 3 && currentUserId) {
      const userKey = `saved-chaos-${currentUserId}`;
      if (!localStorage.getItem(userKey)) {
        setIsOpen(true);
      }
    }
  }, [contributionCount, currentUserId]);

  const handleSave = () => {
    localStorage.setItem(`saved-chaos-${currentUserId}`, 'true');
    setIsOpen(false);
    onProceed?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Your Chaos Is Taking Off! 🚀</DialogTitle>
          <DialogDescription>You've created 3 pieces of pure chaos</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-primary/10 rounded-lg space-y-2">
            <div className="text-sm font-medium">Your Anonymous ID</div>
            <div className="font-mono text-xs bg-card p-2 rounded break-all">{currentUserId}</div>
            <div className="text-xs text-muted-foreground">
              This ID tracks all your contributions, votes, and earnings
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Next Steps:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Continue creating anonymously</li>
              <li>Claim your profile later with 1 click</li>
              <li>All your chaos stays with you</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Keep Anonymous
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Got It! Keep Creating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
