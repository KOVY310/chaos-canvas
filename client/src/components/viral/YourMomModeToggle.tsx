import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChaosLogo } from '@/components/ChaosLogo';

export function YourMomModeToggle() {
  const [isEnabled, setIsEnabled] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chaos-your-mom-mode');
    setIsEnabled(saved === 'true');
  }, []);

  // Save to localStorage
  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem('chaos-your-mom-mode', checked ? 'true' : 'false');
  };

  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50" data-testid="your-mom-mode-toggle">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Label className="text-base font-heading font-bold cursor-pointer">
            Your Mom Mode 🤣
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Every post becomes "Yo mama so..." (1 hour/month only)
          </p>
        </div>

        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          data-testid="your-mom-mode-switch"
        />
      </div>

      {isEnabled && (
        <div className="mt-4 p-3 bg-yellow-100 rounded space-y-3">
          <div className="text-sm font-bold text-yellow-800">
            Active: "Yo Mama's Canvas" Mode
          </div>
          <div className="flex justify-center">
            <ChaosLogo variant="yo-mama" size="sm" />
          </div>
          <div className="text-xs text-yellow-700 text-center">
            Your posts gain +50% viral multiplier • Resets at midnight
          </div>
        </div>
      )}
    </Card>
  );
}
