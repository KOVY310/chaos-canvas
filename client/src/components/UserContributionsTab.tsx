import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function UserContributionsTab() {
  const { currentUserId } = useApp();

  const { data: contributions, isLoading } = useQuery({
    queryKey: ['/api/contributions/user', currentUserId],
    queryFn: () => 
      fetch(`/api/contributions/user/${currentUserId}`).then(r => r.json()),
    enabled: !!currentUserId,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!contributions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">No contributions yet</div>
        <div className="text-sm text-muted-foreground mt-1">
          Go to Global Canvas and add your first piece of chaos!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="user-contributions-list">
      {contributions.map((contrib: any) => (
        <Card key={contrib.id} className="p-4 hover-elevate cursor-pointer" data-testid={`contrib-${contrib.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-medium text-sm truncate">{contrib.contentType.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Boosts: {contrib.boostCount} • Views: {contrib.viewCount}
              </div>
            </div>
            <Badge variant="default" className="shrink-0">
              {parseInt(contrib.marketPrice)} pts
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
