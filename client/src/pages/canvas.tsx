import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { queryClient } from '@/lib/queryClient';
import * as api from '@/lib/api';
import { sounds } from '@/lib/sounds';
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
import { StoriesBannerSwipe } from '@/components/mobile/StoriesBannerSwipe';
import { TikTokCard } from '@/components/mobile/TikTokCard';
import { CreatorModal } from '@/components/mobile/CreatorModal';
import { MobileAICopilotBubble } from '@/components/mobile/MobileAICopilotBubble';
import { ShareChaosModal } from '@/components/mobile/ShareChaosModal';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { AutoShareModal } from '@/components/mobile/AutoShareModal';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Share2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LayerType, Contribution } from '@shared/schema';

interface Layer {
  id: string;
  type: LayerType;
  name: string;
  regionCode: string;
}

export default function CanvasPage() {
  const [, setLocation] = useLocation();
  const { t, chaosCoins, setChaosCoins, currentUserId, setCurrentUserId, locale } = useApp();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  const [lastContributionTitle, setLastContributionTitle] = useState('');
  const [autoShareOpen, setAutoShareOpen] = useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');
  const [showConfetti, setShowConfetti] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
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

  // Auto-open creator modal if coming from /today
  useEffect(() => {
    const shouldOpenCreator = localStorage.getItem('openCreatorModal');
    if (shouldOpenCreator === 'true') {
      setCreatorOpen(true);
      localStorage.removeItem('openCreatorModal');
    }
  }, []);

  // Micro-confetti every 15 seconds (ADHD engagement)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 800);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pull-to-refresh handler
  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canvasRef.current) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStartY.current;
    
    if (distance > 0 && canvasRef.current.scrollTop === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance / 2, 100)); // Max 100px visual feedback
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      // Trigger refresh
      sounds.whoosh();
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer'] });
      toast({
        title: '🌀 Reloading your chaos...',
        duration: 2000,
      });
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  // Seed canvas with starter posts on first load if empty
  useEffect(() => {
    const seedCanvas = async () => {
      try {
        // Check if contributions are empty
        const existingContributions = await api.getContributionsByLayer(currentLayer.id);
        if (existingContributions.length === 0) {
          // Seed with 10-15 starter posts
          const starterPosts = [
            { text: 'Nejvtipnější letový kanál 🚁', author: 'ChaosBot' },
            { text: 'Svíčková ale LÉTÁ 😂', author: 'MemeKing' },
            { text: 'CESKO_IRL.jpg', author: 'FactChecker' },
            { text: 'Tenhle obrázek čtyřikrát narušil fyziku', author: 'PhysicsTeacher' },
            { text: 'Jídlo se ozvučilo', author: 'FoodCritic' },
            { text: 'Pražané to znají 🇨🇿', author: 'LocalGuide' },
            { text: 'Jak to fungovalo??? 🤯', author: 'Confused' },
            { text: 'Masterpiece', author: 'ArtLover' },
            { text: 'To už viděli všichni v Brně', author: 'BrnoBoy' },
            { text: 'Věrné reprodukci české kultury 10/10', author: 'Critic' },
            { text: 'Když babička vaří a ty fotíš', author: 'Photographer' },
            { text: 'ZÁPAS STOLETÍ KDY?', author: 'SportsFan' },
            { text: 'Vidím to v každém snu teď', author: 'Dreamer' },
            { text: 'Toto je umění', author: 'Philosopher' },
            { text: 'Okamžitě sdílím s mámou', author: 'Grandma' },
          ];
          
          for (let i = 0; i < Math.min(12, starterPosts.length); i++) {
            try {
              await api.createContribution({
                userId: 'seed_bot',
                layerId: currentLayer.id,
                contentType: 'text',
                contentData: starterPosts[i],
                positionX: Math.random() * 800,
                positionY: Math.random() * 600,
                width: 200,
                height: 100,
              });
            } catch (e) {}
          }
          queryClient.invalidateQueries({ queryKey: ['/api/contributions/layer', currentLayer.id] });
        }
      } catch (e) {}
    };
    seedCanvas();
  }, []);

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
      sounds.contribution();
      setIsCelebrating(true);
      setCelebrationText('LEGENDARNÍ MOVE!');
      setShowConfetti(true);
      if ('vibrate' in navigator) navigator.vibrate([20, 10, 20, 10, 50]);
      
      // Trigger auto-share modal
      setTimeout(() => {
        setLastContributionTitle('Tvůj chaos');
        setAutoShareOpen(true);
        setIsCelebrating(false);
        setShowConfetti(false);
      }, 1500);
      
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

      {/* MOBILE LAYOUT - STEVE JOBS PERFECTION */}
      <div className="md:hidden flex flex-col h-screen w-full overflow-hidden bg-background relative">
        <ShareChaosModal open={shareOpen} onOpenChange={setShareOpen} />
        
        {/* Auto-Share Modal - triggers after contribution */}
        <AutoShareModal 
          open={autoShareOpen} 
          onClose={() => setAutoShareOpen(false)}
          contentTitle={lastContributionTitle}
        />

        {/* Logo - Top left 44px */}
        <div className="absolute top-3 left-4 z-30 w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-heading font-bold text-white text-lg">
          C
        </div>

        {/* Stories Banner */}
        {activeTab === 'canvas' && <StoriesBannerSwipe />}

        {/* Main Content - Vertical Infinite Feed */}
        {activeTab === 'canvas' && (
          <div className="flex-1 overflow-y-scroll snap-y snap-mandatory pb-24 scrollbar-hide">
            {canvasContributions.length > 0 ? (
              canvasContributions.map((contribution, idx) => (
                <div key={contribution.id} className="snap-center h-screen flex-shrink-0">
                  <TikTokCard
                    id={contribution.id}
                    imageUrl={contribution.imageUrl}
                    title={contribution.title || 'Chaos'}
                    author={contribution.userId || 'unknown'}
                    likes={Math.floor(Math.random() * 10000)}
                    onLike={() => {
                      handleBoost(contribution.id);
                      if ((idx + 1) % 3 === 0) setShareOpen(true);
                    }}
                    onReact={(type) => {
                      if (type === 'fire') handleBoost(contribution.id);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Žádný obsah...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'league' && (
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="p-4 space-y-6">
              <DailySeedDisplay />
              <ChaosTakeoverCountdown />
              <NationalChaosLeaderboard />
            </div>
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
            <h2 className="font-heading text-lg font-bold">{t('profile.myContributions')}</h2>
            <UserContributionsTab />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2" />
              <h2 className="font-heading text-lg font-bold">{t('profile.guestUser')}</h2>
              <p className="text-sm text-muted-foreground">{currentUserId}</p>
            </div>
            <div className="border-t pt-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('profile.chaosCoins')}</p>
                <p className="font-heading font-bold text-lg">{chaosCoins}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('profile.contributions')}</p>
                <p className="font-heading font-bold text-lg">{contributionCount}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <LanguageCurrencySelector />
              <YourMomModeToggle />
              <ThemeToggle />
              <Button variant="destructive" className="w-full" data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                {t('profile.logout')}
              </Button>
            </div>
          </div>
        )}

        {/* Creator Modal with spring animation */}
        <CreatorModal
          open={creatorOpen}
          onOpenChange={setCreatorOpen}
          onSubmit={handleAddContribution}
          isLoading={createContributionMutation.isPending}
        />

        {/* AI Co-Pilot Bubble */}
        <MobileAICopilotBubble
          onGenerate={handleGenerateContent}
          isLoading={generateAIMutation.isPending}
        />

        {/* Bottom Navigation with + button */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'profile') {
              setLocation('/profile');
            } else if (tab === 'league') {
              setLocation('/league');
            } else {
              setActiveTab(tab);
            }
          }}
          onCreateClick={() => {
            setCreatorOpen(true);
          }}
        />
      </div>
    </>
  );
}
