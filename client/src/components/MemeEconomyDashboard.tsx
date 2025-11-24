import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/i18n';

interface MemeStockItem {
  contributionId: string;
  title: string;
  currentPrice: number;
  priceChange: number;
  boostCount: number;
  thumbnail?: string;
  userInvestment?: number;
}

interface MemeEconomyDashboardProps {
  stocks: MemeStockItem[];
  userPortfolio: MemeStockItem[];
  onInvest?: (contributionId: string, amount: number) => void;
  onSell?: (contributionId: string) => void;
  className?: string;
}

export function MemeEconomyDashboard({ stocks, userPortfolio, onInvest, onSell, className }: MemeEconomyDashboardProps) {
  const { t, currency, locale } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const renderStockRow = (stock: MemeStockItem, isPortfolio = false) => (
    <div
      key={stock.contributionId}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover-elevate mb-2"
      data-testid={`stock-${stock.contributionId}`}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
        {stock.thumbnail ? (
          <img src={stock.thumbnail} alt={stock.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{stock.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold">{stock.currentPrice} CC</span>
          <Badge
            variant={stock.priceChange >= 0 ? "default" : "destructive"}
            className="text-xs px-1 py-0"
          >
            {stock.priceChange >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-0.5" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5" />
            )}
            {Math.abs(stock.priceChange)}%
          </Badge>
        </div>
      </div>

      {/* Action */}
      {isPortfolio ? (
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Invested: {stock.userInvestment} CC</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onSell?.(stock.contributionId)}
            data-testid={`button-sell-${stock.contributionId}`}
          >
            Sell
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="default"
          onClick={() => onInvest?.(stock.contributionId, 10)}
          data-testid={`button-invest-${stock.contributionId}`}
        >
          Invest
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-meme-economy">
          <TrendingUp className="w-4 h-4" />
          {t('memeEconomy.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-w-2xl max-h-[80vh] flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('memeEconomy.title')}
          </DialogTitle>
          <DialogDescription>Investuj do trendujících příspěvků a sleduj jejich cenu v reálném čase</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Trending Stocks */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Trending Stocks</h3>
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stocks.length}
              </Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="pr-4">
                {stocks.length > 0 ? (
                  stocks.map((stock) => renderStockRow(stock, false))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No stocks yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* User Portfolio */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">My Portfolio</h3>
              <Badge variant="secondary">
                <Wallet className="w-3 h-3 mr-1" />
                {userPortfolio.length}
              </Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="pr-4">
                {userPortfolio.length > 0 ? (
                  userPortfolio.map((stock) => renderStockRow(stock, true))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Wallet className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No investments yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start investing to grow your portfolio!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
