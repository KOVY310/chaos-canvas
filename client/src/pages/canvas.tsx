import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { queryClient } from '@/lib/queryClient';
import * as api from '@/lib/api';
import { sounds } from '@/lib/sounds';
import { InfiniteCanvas, type CanvasContribution } from '@/components/InfiniteCanvas';
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
import { ShareChaosModal } from '@/components/mobile/ShareChaosModal';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { AutoShareModal } from '@/components/mobile/AutoShareModal';
import { GaryVeeOverlay } from '@/components/GaryVeeOverlay';
import { LiveActivityTicker } from '@/components/LiveActivityTicker';
import { UpgradeButton } from '@/components/UpgradeButton';
import { useToast } from '@/hooks/use-toast';
import { ChaosLogo } from '@/components/ChaosLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, LogOut, Mail } from 'lucide-react';
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
  const [showGaryVeeOverlay, setShowGaryVeeOverlay] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const feedScrollRef = useRef<HTMLDivElement>(null);
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
  const [isUserReady, setIsUserReady] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Show login modal on first load
  useEffect(() => {
    setIsUserReady(false);
  }, []);

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

  // Seed canvas with 30 FLYING SVÍČKOVÁ VARIATIONS - GARY VEE MODE
  useEffect(() => {
    const seedCanvas = async () => {
      try {
        // FIRST: Ensure canvas layer exists
        try {
          await api.getCanvasLayer(currentLayer.id);
        } catch (e) {
          // Layer doesn't exist, create it
          await api.createCanvasLayer({
            layerType: currentLayer.type,
            regionCode: currentLayer.regionCode,
            name: currentLayer.name,
            zoomLevel: 0,
          });
        }

        // Skip auto-seeding - users can add content via Creator button
        // This avoids foreign key constraint issues with non-existent seed users
      } catch (e) {}
    };
    seedCanvas();
  }, []);

  // AUTO-SCROLL every 6 seconds while user isn't scrolling
  useEffect(() => {
    if (!autoScrollEnabled || !feedScrollRef.current) return;

    const scrollInterval = setInterval(() => {
      if (feedScrollRef.current && activeTab === 'canvas') {
        feedScrollRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 6000);

    return () => clearInterval(scrollInterval);
  }, [autoScrollEnabled, activeTab]);

  // Disable auto-scroll on manual scroll
  const handleScroll = () => {
    setAutoScrollEnabled(false);
  };

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

  // WebSocket disabled - using polling instead (Vite HMR conflict issue)
  // Real-time updates handled via TanStack Query polling

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
      setChaosCoins(chaosCoins - variables.amount);
      toast({ title: 'Boosted!', description: `Spent ${variables.amount} ChaosCoins` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to boost contribution', variant: 'destructive' });
    },
  });

  const generateAIMutation = useMutation({
    mutationFn: ({ prompt, style }: { prompt: string; style: string }) => {
      if (!currentUserId || currentUserId.startsWith('guest_')) {
        return Promise.reject(new Error('User not initialized'));
      }
      return api.generateAIContent(prompt, style, currentUserId);
    },
    onSuccess: async (data, variables) => {
      if (!currentUserId || currentUserId.startsWith('guest_')) {
        toast({ title: 'Error', description: 'User session expired', variant: 'destructive' });
        return;
      }
      // Store prompt for sharing
      setLastContributionTitle(variables.prompt);
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
    onError: (error) => {
      console.error('[AI ERROR]', error);
      toast({ title: 'Error', description: 'Failed to generate content', variant: 'destructive' });
    },
  });

  const investMutation = useMutation({
    mutationFn: ({ contributionId, amount }: { contributionId: string; amount: number }) =>
      api.createInvestment(currentUserId!, contributionId, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investments/user', currentUserId] });
      setChaosCoins(chaosCoins - variables.amount);
      toast({ title: 'Investment made!', description: `Invested ${variables.amount} ChaosCoins` });
    },
  });

  // Mock data for meme stocks (would be fetched from API in production)
  const [memeStocks] = useState([
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
  const canvasContributions: CanvasContribution[] = contributions.map((c: any) => ({
    id: c.id,
    userId: c.userId,
    contentType: c.contentType,
    contentData: c.contentData,
    positionX: parseFloat(c.positionX?.toString() || '0'),
    positionY: parseFloat(c.positionY?.toString() || '0'),
    width: c.width,
    height: c.height,
    boostCount: c.boostCount || 0,
    viewCount: c.viewCount || 0,
    marketPrice: c.marketPrice || '0',
  }));

  // Convert contributions to feed format (latest first)
  const contributionFeed = [...contributions]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 20)
    .map((c: any) => ({
      id: c.id,
      layerId: currentLayer.id,
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
    // Open creator modal
    setCreatorOpen(true);
  };

  const handleGenerateContent = async (prompt: string, style: string = 'meme') => {
    if (!currentUserId || currentUserId.startsWith('guest_')) {
      toast({ 
        title: 'Initializing...', 
        description: 'Setting up your account. Try again in a moment.',
        variant: 'default'
      });
      return;
    }
    
    try {
      generateAIMutation.mutate({ prompt, style });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate content', variant: 'destructive' });
    }
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

  // Show login screen until user is initialized
  if (!isUserReady) {
    const handleEmailLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) {
        toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
        return;
      }
      
      setIsLoginLoading(true);
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            isAnonymous: false,
            locale: locale || 'en-US',
            countryCode: 'CZ',
            username: email.split('@')[0],
            password: '', // Email-based auth, no password
          }),
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const user = await response.json();
        localStorage.setItem('chaos-guest-id', user.id);
        setCurrentUserId(user.id);
        setChaosCoins(user.chaosCoins || 100);
        setIsUserReady(true);
        toast({ title: 'Welcome!', description: `Signed in as ${email}` });
      } catch (error) {
        console.error('Login error:', error);
        toast({ title: 'Error', description: 'Failed to login with email', variant: 'destructive' });
      } finally {
        setIsLoginLoading(false);
      }
    };

    const handleGuestContinue = async () => {
      setIsLoginLoading(true);
      try {
        const response = await fetch('/api/auth/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: locale || 'en-US',
            countryCode: 'CZ',
          }),
        });
        
        if (!response.ok) throw new Error('Guest creation failed');
        
        const user = await response.json();
        localStorage.setItem('chaos-guest-id', user.id);
        setCurrentUserId(user.id);
        setChaosCoins(user.chaosCoins || 100);
        setIsUserReady(true);
        toast({ title: 'Ready!', description: 'Continuing as guest' });
      } catch (error) {
        console.error('Guest error:', error);
        toast({ title: 'Error', description: 'Failed to initialize', variant: 'destructive' });
      } finally {
        setIsLoginLoading(false);
      }
    };

    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm mx-4 p-8 rounded-2xl border border-border bg-card shadow-xl space-y-6"
        >
          <div className="text-center">
            <ChaosLogo variant="main" size="lg" />
            <h1 className="font-heading text-2xl font-bold mt-4">ChaosCanvas</h1>
            <p className="text-sm text-muted-foreground mt-2">Join the viral creative revolution</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoginLoading}
                  className="pl-9"
                  data-testid="input-email"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoginLoading}
              data-testid="button-email-login"
            >
              {isLoginLoading ? 'Signing in...' : 'Sign In with Email'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGuestContinue}
            disabled={isLoginLoading}
            data-testid="button-guest-continue"
          >
            {isLoginLoading ? 'Starting...' : 'Continue as Guest'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No account needed. Create and share chaos instantly! 🎨
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SaveYourChaosPrompt contributionCount={contributionCount} />
      <ConfettiEffect trigger={showConfetti} />
      <FloatingShareButton />

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex h-screen w-full overflow-hidden">
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
        {/* GARY VEE OVERLAY - MASSIVE CTA */}
        {showGaryVeeOverlay && (
          <GaryVeeOverlay
            onCTAClick={() => {
              setShowGaryVeeOverlay(false);
              setCreatorOpen(true);
            }}
            onClose={() => setShowGaryVeeOverlay(false)}
          />
        )}

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

        {/* Live Activity Ticker */}
        {activeTab === 'canvas' && <LiveActivityTicker />}

        {/* Stories Banner */}
        {activeTab === 'canvas' && <StoriesBannerSwipe />}

        {/* Main Content - Vertical Infinite Feed */}
        {activeTab === 'canvas' ? (
          <div 
            ref={feedScrollRef}
            onScroll={handleScroll}
            className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory pb-24 scrollbar-hide bg-background">
            {canvasContributions && canvasContributions.length > 0 ? (
              canvasContributions.map((contribution, idx) => {
                const contentData = contribution.contentData as any;
                const imageUrl = contentData?.url || '';
                const title = contentData?.prompt || 'Chaos';
                return (
                  <div key={contribution.id} className="snap-center h-screen w-full flex-shrink-0">
                    <TikTokCard
                      id={contribution.id}
                      imageUrl={imageUrl}
                      title={title}
                      author={contribution.userId || 'unknown'}
                      likes={contribution.boostCount || Math.floor(Math.random() * 10000)}
                      onLike={() => {
                        handleBoost(contribution.id);
                        if ((idx + 1) % 3 === 0) setShareOpen(true);
                      }}
                      onReact={(type) => {
                        if (type === 'fire') handleBoost(contribution.id);
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="h-screen w-full flex items-center justify-center bg-background">
                <p className="text-muted-foreground text-center px-4">
                  {contributionsLoading ? 'Načítám obsah...' : 'Zatím žádný obsah. Klikni na + a přidej svůj chaos!'}
                </p>
              </div>
            )}
          </div>
        ) : null}

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

            {/* ChaosPro Upgrade Section */}
            <div className="border-t pt-4">
              <div className="p-6 bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl border-2 border-yellow-400">
                <h2 className="text-xl font-heading font-bold text-center mb-2 text-yellow-300">
                  🔥 Staň se Chaos Legendou! 🔥
                </h2>
                <p className="text-sm text-center text-gray-200 mb-4">
                  Unlock unlimited posts, exclusive features & cosmic power
                </p>
                <UpgradeButton />
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
          onSubmit={handleGenerateContent}
          isLoading={generateAIMutation.isPending}
        />

        {/* Bottom Navigation with + button */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          onCreateClick={() => {
            setCreatorOpen(true);
          }}
        />
      </div>
    </>
  );
}
