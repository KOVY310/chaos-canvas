import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Rocket } from 'lucide-react';
import type { Contribution } from '@shared/schema';

interface ContributionWithUser extends Contribution {
  username: string;
  userAvatar?: string;
}

interface ContributionFeedProps {
  contributions: ContributionWithUser[];
  onBoost?: (contributionId: string) => void;
  className?: string;
}

export function ContributionFeed({ contributions, onBoost, className }: ContributionFeedProps) {
  const { t } = useApp();

  const renderContribution = (contribution: ContributionWithUser) => {
    const contentData = contribution.contentData as any;
    const timeAgo = getTimeAgo(new Date(contribution.createdAt));

    return (
      <div
        key={contribution.id}
        className="p-3 rounded-lg border border-border bg-card hover-elevate mb-3"
        data-testid={`contribution-card-${contribution.id}`}
      >
        {/* User info */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={contribution.userAvatar} />
            <AvatarFallback>{contribution.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{contribution.username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-2">
          {contribution.contentType === 'image' && contentData.url && (
            <img
              src={contentData.url}
              alt={contentData.prompt || 'Contribution'}
              className="w-full rounded-md object-cover max-h-48"
            />
          )}
          {contribution.contentType === 'text' && contentData.text && (
            <p className="text-sm p-2 bg-muted rounded-md">{contentData.text}</p>
          )}
          {contentData.prompt && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{contentData.prompt}"</p>
          )}
        </div>

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              {contribution.boostCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {contribution.viewCount}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => onBoost?.(contribution.id)}
            data-testid={`button-boost-${contribution.id}`}
          >
            <Rocket className="w-3 h-3" />
            {t('common.boost')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full bg-sidebar border-l border-sidebar-border flex flex-col", className)}>
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-heading font-semibold text-base">Contributions</h2>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full grid grid-cols-4 mx-4 mt-3" data-testid="tabs-contribution-filter">
          <TabsTrigger value="all" className="text-xs" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="following" className="text-xs" data-testid="tab-following">Following</TabsTrigger>
          <TabsTrigger value="top" className="text-xs" data-testid="tab-top">Top</TabsTrigger>
          <TabsTrigger value="mine" className="text-xs" data-testid="tab-mine">Mine</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              {contributions.length > 0 ? (
                contributions.map(renderContribution)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No contributions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to add something!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="following" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Follow users to see their contributions</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="top" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              {contributions
                .sort((a, b) => b.boostCount - a.boostCount)
                .slice(0, 10)
                .map(renderContribution)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mine" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">Your contributions will appear here</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
