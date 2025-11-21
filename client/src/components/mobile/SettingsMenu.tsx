import { useState } from 'react';
import { MoreVertical, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LanguageCurrencySelector } from '@/components/LanguageCurrencySelector';
import { YourMomModeToggle } from '@/components/viral/YourMomModeToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="md:hidden fixed top-4 right-4 z-50 p-2 hover:bg-accent rounded-lg transition-all"
          data-testid="button-settings-menu"
        >
          <MoreVertical className="w-6 h-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="md:hidden w-48">
        <div className="space-y-3">
          <LanguageCurrencySelector />
          <YourMomModeToggle />
          <ThemeToggle />
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
