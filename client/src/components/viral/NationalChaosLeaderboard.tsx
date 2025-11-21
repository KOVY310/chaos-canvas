import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queryClient } from '@/lib/queryClient';

interface LeaderboardEntry {
  countryCode: string;
  countryName: string;
  score: number;
  contributionCount: number;
  rank: number;
  borderColor?: string;
}

export function NationalChaosLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/national-chaos-league'],
    queryFn: () => fetch('/api/national-chaos-league').then(r => r.json()),
    refetchInterval: 5000, // Update every 5 seconds
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading League...</div>;
  }

  const leaderboard: LeaderboardEntry[] = data?.leaderboard || [];

  return (
    <div className="w-full space-y-4" data-testid="national-chaos-leaderboard">
      <h2 className="font-heading text-2xl font-bold text-primary">National Chaos League 🔥</h2>
      
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <Card
            key={entry.countryCode}
            className={`p-4 flex items-center justify-between transition-all ${
              entry.borderColor ? `border-2 border-[${entry.borderColor}]` : ''
            }`}
            data-testid={`leaderboard-entry-${index}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-3xl font-bold text-muted-foreground w-8">#{entry.rank}</div>
              <div className="flex-1">
                <div className="font-heading text-lg font-bold">{entry.countryName}</div>
                <div className="text-sm text-muted-foreground">{entry.contributionCount} contributions</div>
              </div>
            </div>

            <div className="text-right">
              <Badge className="bg-primary text-primary-foreground px-3 py-1.5" data-testid={`score-${entry.countryCode}`}>
                {entry.score.toLocaleString()} pts
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center pt-4">
        Updated every 5 seconds • Top 3 countries get special border on Global Canvas
      </div>
    </div>
  );
}
