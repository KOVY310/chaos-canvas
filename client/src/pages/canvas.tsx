import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApp } from '@/context/AppContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { queryClient } from '@/lib/queryClient';
import * as api from '@/lib/api';
import { InfiniteCanvas, type CanvasContribution } from '@/components/InfiniteCanvas';
import { AICopilotPanel } from '@/components/AICopilotPanel';
import { LayerSwitcher } from '@/components/LayerSwitcher';
import { ChaosCoinsDisplay } from '@/components/ChaosCoinsDisplay';
import { ContributionFeed } from '@/components/ContributionFeed';
import { MemeEconomyDashboard } from '@/components/MemeEconomyDashboard';
import { PersonalBubblePanel } from '@/components/PersonalBubblePanel';
import { ExportPanel } from '@/components/ExportPanel';
import { LanguageCurrencySelector } from '@/components/LanguageCurrencySelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NationalChaosLeaderboard } from '@/components/viral/NationalChaosLeaderboard';
import { ChaosTakeoverCountdown } from '@/components/viral/ChaosTakeoverCountdown';
import { DailySeedDisplay } from '@/components/viral/DailySeedDisplay';
import { YourMomModeToggle } from '@/components/viral/YourMomModeToggle';
import { ShareButton } from '@/components/viral/ShareButton';
import { FloatingShareButton } from '@/components/viral/FloatingShareButton';
import { ConfettiEffect } from '@/components/viral/ConfettiEffect';
import { SaveYourChaosPrompt } from '@/components/SaveYourChaosPrompt';
import { UserContributionsTab } from '@/components/UserContributionsTab';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileFloatingAdd } from '@/components/mobile/MobileFloatingAdd';
import { MobileLeagueBanner } from '@/components/mobile/MobileLeagueBanner';
import { MobileAICopilotBubble } from '@/components/mobile/MobileAICopilotBubble';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import type { LayerType, Contribution } from '@shared/schema';

interface Layer {
  id: string;
  type: LayerType;
  name: string;
  regionCode: string;
}

export default function CanvasPage() {
  const { t, chaosCoins, setChaosCoins, currentUserId, setCurrentUserId, locale } = useApp();
  const { toast } = useToast();
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'league' | 'settings'
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<Layer>({
    id: 'global-1',
    type: 'global',
    name: 'Global Canvas',
    regionCode: 'global',
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Layer[]>([currentLayer]);
  const [contributionCount, setContributionCount] = useState(0);

  // Initialize anonymous user
  useEffect(() => {
    if (!currentUserId) {
      const guestId = `guest_${Date.now()}`;
      localStorage.setItem('chaos-guest-id', guestId);
      setCurrentUserId(guestId);
      setChaosCoins(100);
    }
  }, [currentUserId, setCurrentUserId, setChaosCoins]);

  // Fetch contributions for current layer
  const { data: contributions = [], isLoading: contributionsLoading } = useQuery({
    queryKey: ['/api/contributions/layer', currentLayer.id],
    queryFn: () => api.getContributionsByLayer(currentLayer.id),
    enabled: !!currentLayer.id,
  });

  // Fetch user investments
  const { data: userPortfolio = [] } = useQuery({
    queryKey: ['/api/investments/user', currentUserId],
    queryFn: () => api.getUserInvestments(currentUserId!),
    enabled: !!currentUserId,
  });

  // WebSocket for real-time updates (disabled for now - using polling instead)
  // TODO: Re-enable WebSocket when HMR is properly configured
  // const { isConnected, send } = useWebSocket(currentLayer.id, {
  //   onMessage: (message) => {
  //     if (message.type === 'new_contribution') {
  //       queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer', currentLayer.id] });
  //     } else if (message.type === 'contribution_updated') {
  //       queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer', currentLayer.id] });
  //     }
  //   },
  // });

  // Mutations
  const createContributionMutation = useMutation({
    mutationFn: (data: any) => api.createContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer', currentLayer.id] });
      toast({ title: 'Contribution added!', description: 'Your creation is now on the canvas' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add contribution', variant: 'destructive' });
    },
  });

  const boostMutation = useMutation({
    mutationFn: ({ contributionId, amount }: { contributionId: string; amount: number }) =>
      api.boostContribution(contributionId, currentUserId!, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer', currentLayer.id] });
      setChaosCoins(prev => prev - variables.amount);
      toast({ title: 'Boosted!', description: `Spent ${variables.amount} ChaosCoins` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to boost contribution', variant: 'destructive' });
    },
  });

  const generateAIMutation = useMutation({
    mutationFn: ({ prompt, style }: { prompt: string; style: string }) =>
      api.generateAIContent(prompt, style, currentUserId!),
    onSuccess: async (data, variables) => {
      // Create contribution with AI-generated content
      await createContributionMutation.mutateAsync({
        userId: currentUserId,
        layerId: currentLayer.id,
        contentType: 'image',
        contentData: {
          url: data.url,
          prompt: variables.prompt,
          style: variables.style,
        },
        positionX: Math.random() * 800,
        positionY: Math.random() * 600,
        width: 300,
        height: 200,
      });
    },
  });

  const investMutation = useMutation({
    mutationFn: ({ contributionId, amount }: { contributionId: string; amount: number }) =>
      api.createInvestment(currentUserId!, contributionId, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investments/user', currentUserId] });
      setChaosCoins(prev => prev - variables.amount);
      toast({ title: 'Investment made!', description: `Invested ${variables.amount} ChaosCoins` });
    },
  });

  // Mock data for meme stocks (would be fetched from API in production)
  const [memeStocks] = useState<any[]>([
    {
      contributionId: 's1',
      title: 'Epic Dragon Meme',
      currentPrice: 25,
      priceChange: 15.3,
      boostCount: 45,
    },
    {
      contributionId: 's2',
      title: 'Confused Cat',
      currentPrice: 18,
      priceChange: -5.2,
      boostCount: 32,
    },
  ]);

  // Convert contributions to canvas format
  const canvasContributions: CanvasContribution[] = contributions.map((c: Contribution) => ({
    id: c.id,
    x: c.positionX,
    y: c.positionY,
    width: c.width,
    height: c.height,
    type: c.contentType as 'image' | 'text',
    data: c.contentData as any,
    author: c.userId,
    boostCount: c.boostCount,
  }));

  // Convert contributions to feed format (latest first)
  const contributionFeed = [...contributions]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 20)
    .map((c: Contribution) => ({
      id: c.id,
      userId: c.userId,
      username: c.userId.substring(0, 10),
      contentType: c.contentType,
      contentData: c.contentData,
      positionX: c.positionX,
      positionY: c.positionY,
      width: c.width,
      height: c.height,
      boostCount: c.boostCount,
      viewCount: c.viewCount,
      marketPrice: c.marketPrice || '0',
      createdAt: c.createdAt || new Date().toISOString(),
    }));

  const handleLayerChange = (layer: Layer) => {
    setCurrentLayer(layer);
    // Update breadcrumbs based on layer hierarchy
    const index = breadcrumbs.findIndex(b => b.id === layer.id);
    if (index >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const handleAddContribution = async (x: number, y: number) => {
    // For now, just show a message prompting user to use AI Co-Pilot
    toast({
      title: 'Use AI Co-Pilot',
      description: 'Use the AI Co-Pilot panel on the left to generate content!',
    });
  };

  const handleGenerateContent = async (prompt: string, style: string) => {
    if (!currentUserId) {
      toast({ title: 'Error', description: 'Please login first', variant: 'destructive' });
      return;
    }
    
    generateAIMutation.mutate({ prompt, style });
  };

  const handleBoost = (contributionId: string) => {
    if (!currentUserId) {
      toast({ title: 'Error', description: 'Please login first', variant: 'destructive' });
      return;
    }
    
    const boostAmount = 10; // Standard boost cost
    if (chaosCoins < boostAmount) {
      toast({ title: 'Insufficient ChaosCoins', description: 'You need more coins to boost!', variant: 'destructive' });
      return;
    }
    
    boostMutation.mutate({ contributionId, amount: boostAmount });
  };

  const handleInvest = (contributionId: string, amount: number) => {
    if (!currentUserId) {
      toast({ title: 'Error', description: 'Please login first', variant: 'destructive' });
      return;
    }
    
    if (chaosCoins < amount) {
      toast({ title: 'Insufficient ChaosCoins', description: 'You need more coins to invest!', variant: 'destructive' });
      return;
    }
    
    investMutation.mutate({ contributionId, amount });
  };

  return (
    <>
      <SaveYourChaosPrompt contributionCount={contributionCount} />
      <ConfettiEffect trigger={showConfetti} />
      <FloatingShareButton />

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex h-screen w-full overflow-hidden">
        {/* AI Co-Pilot Panel (Left) */}
        <AICopilotPanel
          isCollapsed={isCopilotCollapsed}
          onToggleCollapse={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
          onGenerateContent={handleGenerateContent}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h1 className="font-heading font-bold text-xl text-primary">{t('appName')}</h1>
              <p className="text-sm text-muted-foreground">{t('tagline')}</p>
            </div>

            <div className="flex items-center gap-2">
              <ExportPanel />
              <PersonalBubblePanel />
              <MemeEconomyDashboard
                stocks={memeStocks}
                userPortfolio={userPortfolio}
                onInvest={handleInvest}
              />
              <ChaosCoinsDisplay
                balance={chaosCoins}
                subscriptionTier={null}
              />
              <LanguageCurrencySelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Tabs for Canvas vs League */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none border-b" data-testid="main-tabs">
              <TabsTrigger value="canvas">Global Canvas</TabsTrigger>
              <TabsTrigger value="league">National League 🔥</TabsTrigger>
              <TabsTrigger value="settings">Settings ⚙️</TabsTrigger>
            </TabsList>

            {/* Canvas Tab */}
            <TabsContent value="canvas" className="flex-1 overflow-hidden flex flex-col" data-testid="canvas-tab">
              <LayerSwitcher
                currentLayer={currentLayer}
                breadcrumbs={breadcrumbs}
                onLayerChange={handleLayerChange}
              />

              <div className="flex-1 overflow-hidden">
                <InfiniteCanvas
                  layerId={currentLayer.id}
                  contributions={canvasContributions}
                  onAddContribution={handleAddContribution}
                  isLoading={contributionsLoading}
                />
              </div>
            </TabsContent>

            {/* League Tab */}
            <TabsContent value="league" className="flex-1 overflow-y-auto p-4 space-y-6" data-testid="league-tab">
              <DailySeedDisplay />
              <ChaosTakeoverCountdown />
              <NationalChaosLeaderboard />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="settings-tab">
              <h2 className="font-heading text-2xl font-bold">Settings & Profile</h2>
              <YourMomModeToggle />
              <div className="pt-4 border-t space-y-4">
                <ShareButton />
                <UserContributionsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Contribution Feed (Right) */}
        {activeTab === 'canvas' && (
          <div className="w-80 hidden lg:block">
            <ContributionFeed
              contributions={contributionFeed}
              onBoost={handleBoost}
            />
          </div>
        )}
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex flex-col h-screen w-full overflow-hidden bg-background">
        {/* Mobile League Banner (Stories style) */}
        {activeTab === 'league' && <MobileLeagueBanner />}

        {/* Content Area with pb-20 for bottom nav space */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'canvas' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-card border-b border-border p-3">
                <div className="flex items-center justify-between">
                  <h1 className="font-heading font-bold text-lg">{t('appName')}</h1>
                  <div className="flex gap-2">
                    <ChaosCoinsDisplay balance={chaosCoins} subscriptionTier={null} />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
              <div className="h-96 overflow-hidden">
                <InfiniteCanvas
                  layerId={currentLayer.id}
                  contributions={canvasContributions}
                  onAddContribution={handleAddContribution}
                  isLoading={contributionsLoading}
                />
              </div>
            </div>
          )}

          {activeTab === 'league' && (
            <div className="p-4 space-y-6">
              <DailySeedDisplay />
              <ChaosTakeoverCountdown />
              <NationalChaosLeaderboard />
            </div>
          )}

          {activeTab === 'mine' && (
            <div className="p-4 space-y-4">
              <h2 className="font-heading text-lg font-bold">My Contributions</h2>
              <UserContributionsTab />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-4">
              <h2 className="font-heading text-lg font-bold">Settings</h2>
              <YourMomModeToggle />
              <LanguageCurrencySelector />
              <div className="pt-4 border-t space-y-4">
                <Button className="w-full" data-testid="button-share-tiktok">
                  <Share2 className="w-4 h-4 mr-2" />
                  Sdílet na TikTok
                </Button>
                <ShareButton />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating UI */}
        <MobileAICopilotBubble
          onGenerate={handleGenerateContent}
          isLoading={generateAIMutation.isPending}
        />
        <MobileFloatingAdd
          onAddContent={handleAddContribution}
          isLoading={createContributionMutation.isPending}
        />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}
