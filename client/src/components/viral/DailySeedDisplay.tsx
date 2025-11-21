import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export function DailySeedDisplay() {
  const { locale } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/daily-seed-prompts', locale],
    queryFn: () => fetch(`/api/daily-seed-prompts?locale=${locale}`).then(r => r.json()),
    refetchInterval: 60000, // Update every minute
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading today's prompt...</div>;
  }

  if (!data) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-primary" data-testid="daily-seed-display">
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-bold text-primary">Today's Chaos Prompt ✨</h3>
        
        <p className="text-2xl font-bold leading-tight" data-testid="seed-prompt-text">
          {data.globalPrompt}
        </p>

        <div className="flex gap-2 flex-wrap">
          <div className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            Style: {data.style}
          </div>
          <div className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
            Expires at midnight
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Join creators worldwide! Add your interpretation to the global canvas.
        </p>
      </div>
    </Card>
  );
}
