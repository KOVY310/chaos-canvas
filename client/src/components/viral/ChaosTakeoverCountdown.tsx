import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TakeoverData {
  nextTakeoverAt: string;
  currentBid?: number;
  isLive: boolean;
  winner?: string;
  description: string;
}

export function ChaosTakeoverCountdown() {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const { data } = useQuery({
    queryKey: ['/api/chaos-takeover'],
    queryFn: () => fetch('/api/chaos-takeover').then(r => r.json()),
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (!data?.nextTakeoverAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(data.nextTakeoverAt);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('LIVE NOW!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [data?.nextTakeoverAt]);

  if (!data) return null;

  return (
    <Card
      className={`p-6 border-2 ${data.isLive ? 'border-red-500 bg-red-50' : 'border-primary'}`}
      data-testid="chaos-takeover-countdown"
    >
      <div className="text-center space-y-4">
        <h3 className="font-heading text-xl font-bold">Chaos Takeover 🎮</h3>
        <p className="text-sm text-muted-foreground">{data.description}</p>

        <div className="text-4xl font-bold font-heading text-primary" data-testid="countdown-timer">
          {timeLeft}
        </div>

        {data.isLive && (
          <div className="space-y-2">
            <div className="text-lg font-bold text-red-600">LIVE RIGHT NOW!</div>
            {data.currentBid && (
              <div className="text-sm">Current highest bid: {data.currentBid.toLocaleString()} ChaosCoins</div>
            )}
            <Button disabled className="w-full">
              Bid now (Coming soon)
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
