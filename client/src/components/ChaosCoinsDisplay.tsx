import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins, Plus, History, Crown } from 'lucide-react';
import { formatPrice } from '@/lib/i18n';

interface ChaosCoinsDisplayProps {
  balance: number;
  subscriptionTier?: 'pro' | 'god' | null;
  onPurchase?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

export function ChaosCoinsDisplay({ 
  balance, 
  subscriptionTier,
  onPurchase, 
  onViewHistory,
  className 
}: ChaosCoinsDisplayProps) {
  const { t, currency, locale } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2 font-medium", className)}
          data-testid="button-chaos-coins"
        >
          <Coins className="w-4 h-4 text-primary" />
          <span>{balance.toLocaleString()}</span>
          {subscriptionTier && (
            <Badge variant="default" className="ml-1">
              {subscriptionTier === 'god' ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  GOD
                </>
              ) : (
                'PRO'
              )}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>{t('chaosCoins')}</span>
            <span className="font-heading text-lg">{balance}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onPurchase && (
          <>
            <DropdownMenuItem onClick={onPurchase} data-testid="menu-item-purchase">
              <Plus className="w-4 h-4 mr-2" />
              Purchase Credits
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Credit Packages
        </DropdownMenuLabel>
        <DropdownMenuItem className="flex justify-between" data-testid="menu-item-package-100">
          <span>100 Credits</span>
          <span className="text-muted-foreground">{formatPrice(1, currency, locale)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between" data-testid="menu-item-package-500">
          <span>500 Credits</span>
          <span className="text-muted-foreground">{formatPrice(4.99, currency, locale)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between" data-testid="menu-item-package-1000">
          <span>1000 Credits</span>
          <span className="text-muted-foreground">{formatPrice(8.99, currency, locale)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between" data-testid="menu-item-package-2000">
          <span>2000 Credits</span>
          <span className="text-muted-foreground">{formatPrice(14.99, currency, locale)}</span>
        </DropdownMenuItem>

        {onViewHistory && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onViewHistory} data-testid="menu-item-history">
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
