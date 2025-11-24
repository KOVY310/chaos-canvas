import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { sounds } from '@/lib/sounds';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CreatorModal } from '@/components/mobile/CreatorModal';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import * as api from '@/lib/api';

const COUNTRY_FLAGS: Record<string, string> = {
  'PH': '🇵🇭',
  'CZ': '🇨🇿',
  'DE': '🇩🇪',
  'US': '🇺🇸',
  'BR': '🇧🇷',
  'IN': '🇮🇳',
  'RU': '🇷🇺',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'FR': '🇫🇷',
};

interface CountryRank {
  rank: number;
  country: string;
  flag: string;
  contributions: number;
  points: number;
  trend: 'up' | 'down' | 'stable';
}

export default function LeaguePage() {
  const [, setLocation] = useLocation();
  const { t, currentUserId, chaosCoins, setChaosCoins } = useApp();
  const { toast } = useToast();
  const [liveEvent, setLiveEvent] = useState<string>('');
  const [userRankCZ, setUserRankCZ] = useState(420);
  const [userContributions, setUserContributions] = useState(69);
  const [prevRank, setPrevRank] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdownToNextRank, setCountdownToNextRank] = useState(10);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [lastContributionTitle, setLastContributionTitle] = useState('');

  // AI Mutation for content generation
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
      setLastContributionTitle(variables.prompt);
      // Create contribution with AI-generated content
      await api.createContribution({
        userId: currentUserId,
        layerId: 'global-1',
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
      toast({ title: 'Contribution added!', description: 'Your creation is now on the canvas' });
      setCreatorOpen(false);
    },
    onError: (error) => {
      console.error('[AI ERROR]', error);
      toast({ title: 'Error', description: 'Failed to generate content', variant: 'destructive' });
    },
  });

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

  // Mock leaderboard data
  const [leaderboard, setLeaderboard] = useState<CountryRank[]>([
    { rank: 1, country: 'Filipíny', flag: COUNTRY_FLAGS['PH'], contributions: 892420, points: 8924200, trend: 'up' },
    { rank: 2, country: 'Česko', flag: COUNTRY_FLAGS['CZ'], contributions: 822770, points: 8227700, trend: 'up' },
    { rank: 3, country: 'Brazílie', flag: COUNTRY_FLAGS['BR'], contributions: 654321, points: 6543210, trend: 'down' },
    { rank: 4, country: 'Indie', flag: COUNTRY_FLAGS['IN'], contributions: 543210, points: 5432100, trend: 'stable' },
    { rank: 5, country: 'Německo', flag: COUNTRY_FLAGS['DE'], contributions: 432198, points: 4321980, trend: 'up' },
    { rank: 6, country: 'USA', flag: COUNTRY_FLAGS['US'], contributions: 387654, points: 3876540, trend: 'down' },
    { rank: 7, country: 'Japonsko', flag: COUNTRY_FLAGS['JP'], contributions: 276543, points: 2765430, trend: 'stable' },
    { rank: 8, country: 'Korea', flag: COUNTRY_FLAGS['KR'], contributions: 198765, points: 1987650, trend: 'up' },
    { rank: 9, country: 'Francie', flag: COUNTRY_FLAGS['FR'], contributions: 154321, points: 1543210, trend: 'down' },
    { rank: 10, country: 'Rusko', flag: COUNTRY_FLAGS['RU'], contributions: 123456, points: 1234560, trend: 'stable' },
  ]);

  // Live event updates every 5s
  useEffect(() => {
    const events = [
      'Filipíny právě přidali +420 příspěvků 😂',
      'Česko se dotahuje! Jen 69 420 příspěvků do #1!',
      'Brazílie klesla o 2 místa 😱',
      'Indie právě odemkla "CURRY CHAOS MODE"',
      'Právě byl přidán PRVNÍ MILION příspěvků! 🎉',
      'Česko posílilo o 5K příspěvků za poslední minutu!',
    ];

    const liveInterval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLiveEvent(randomEvent);

      // Simulate rank change for Česko (randomize)
      const random = Math.random();
      if (random < 0.3) {
        // Rank up
        setLeaderboard((prev) => {
          const newLb = [...prev];
          const czIdx = newLb.findIndex((c) => c.country === 'Česko');
          const topIdx = newLb.findIndex((c) => c.country === 'Filipíny');
          if (czIdx > 0) {
            [newLb[czIdx - 1], newLb[czIdx]] = [newLb[czIdx], newLb[czIdx - 1]];
            newLb[czIdx - 1].rank = czIdx;
            newLb[czIdx].rank = czIdx + 1;
            setPrevRank(newLb[czIdx].rank - 1);
            sounds.levelUp();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }
          return newLb;
        });
      } else if (random < 0.6) {
        // Rank down
        setLeaderboard((prev) => {
          const newLb = [...prev];
          const czIdx = newLb.findIndex((c) => c.country === 'Česko');
          if (czIdx < newLb.length - 1) {
            [newLb[czIdx], newLb[czIdx + 1]] = [newLb[czIdx + 1], newLb[czIdx]];
            newLb[czIdx].rank = czIdx + 1;
            newLb[czIdx + 1].rank = czIdx + 2;
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const now = ctx.currentTime;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(200, now);
              osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
              gain.gain.setValueAtTime(0.3, now);
              gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
              osc.start(now);
              osc.stop(now + 0.3);
            } catch (e) {}
          }
          return newLb;
        });
      }

      // Update contributions
      setUserContributions((prev) => prev + Math.floor(Math.random() * 10));
      setCountdownToNextRank((prev) => Math.max(0, prev - Math.floor(Math.random() * 3)));
    }, 5000);

    return () => clearInterval(liveInterval);
  }, []);

  const czRank = leaderboard.find((c) => c.country === 'Česko');
  const distanceTo1st = czRank ? leaderboard[0].contributions - czRank.contributions : 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-32 md:pb-20">
      {/* Mobile-only floating button */}
      <div className="md:hidden fixed bottom-24 left-4 right-4 z-30">
        <motion.button
          onClick={() => {
            localStorage.setItem('openCreatorModal', 'true');
            setLocation('/canvas');
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-2xl shadow-xl transition-all py-3 px-4 font-heading font-bold text-sm"
          data-testid="button-add-chaos-mobile-league"
        >
          ⚡ Přidej chaos & posuň Česko!
        </motion.button>
      </div>

      {/* Animated background */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(135deg, #9D00FF 0%, #FF006E 50%, #00F5FF 100%)',
            'linear-gradient(135deg, #00F5FF 0%, #9D00FF 50%, #FF006E 100%)',
            'linear-gradient(135deg, #FF006E 0%, #00F5FF 50%, #9D00FF 100%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 opacity-30"
      />

      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-4"
        >
          <h1 className="text-6xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400">
            NATIONAL
          </h1>
          <h1 className="text-6xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-300">
            CHAOS LEAGUE 🔥
          </h1>
        </motion.div>

        {/* Live event ticker */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={liveEvent}
          className="text-lg md:text-2xl font-bold text-yellow-300 mb-4 h-8"
        >
          {liveEvent}
        </motion.div>
      </div>

      {/* Top 10 Leaderboard */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <div className="space-y-3">
          {leaderboard.map((country, idx) => {
            const isCZ = country.country === 'Česko';
            const isTop1 = idx === 0;

            return (
              <motion.div
                key={country.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group ${isCZ ? 'ring-2 ring-cyan-400' : ''}`}
              >
                {/* Rank up confetti trigger */}
                {showConfetti && isCZ && (
                  <motion.div
                    animate={{ y: [0, -200], opacity: [1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 text-3xl flex items-center justify-center pointer-events-none"
                  >
                    {[...Array(10)].map((_, i) => (
                      <motion.span key={i} className="absolute">
                        ✨
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                <div
                  className={`relative p-6 rounded-2xl backdrop-blur-md border-2 transition-all ${
                    isTop1
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-2xl shadow-yellow-500/50'
                      : isCZ
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-900/40 border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {/* Gold crown for #1 */}
                  {isTop1 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl"
                    >
                      👑
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    {/* Rank + Flag */}
                    <div className="flex items-center gap-4 min-w-fit">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 w-16 text-center"
                      >
                        #{idx + 1}
                      </motion.div>
                      <div className="text-7xl">{country.flag}</div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-heading font-bold text-white">
                          {country.country}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {country.contributions.toLocaleString()} příspěvků
                        </p>
                      </div>
                    </div>

                    {/* Points and trend */}
                    <div className="text-right ml-auto">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-3xl md:text-4xl font-heading font-black text-yellow-300"
                      >
                        {(country.points / 1000000).toFixed(1)}M
                      </motion.div>
                      <div className="text-lg font-bold">
                        {country.trend === 'up' && <span className="text-green-400">📈 UP</span>}
                        {country.trend === 'down' && <span className="text-red-400">📉 DOWN</span>}
                        {country.trend === 'stable' && <span className="text-gray-400">➡️ STABLE</span>}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <motion.div
                    className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden"
                  >
                    <motion.div
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className={`h-full ${
                        isTop1
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      }`}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Personal Stats + CTA Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl rounded-3xl border-2 border-cyan-400/50 p-8 md:p-12"
        >
          {/* Personal stats */}
          <div className="text-center mb-8">
            <motion.h2 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 mb-6">
              Ty jsi přidal {userContributions} příspěvků za Česko 🇨🇿
            </motion.h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-black/40 rounded-2xl p-4 border border-cyan-400/30">
                <p className="text-gray-400 text-sm mb-2">Tvůj rank v Česku</p>
                <p className="text-3xl font-heading font-black text-cyan-400">#{userRankCZ}</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-pink-400/30">
                <p className="text-gray-400 text-sm mb-2">Globální rank</p>
                <p className="text-3xl font-heading font-black text-pink-400">#6 942</p>
              </div>
            </div>

            {/* Progress to next rank */}
            <div className="bg-black/40 rounded-2xl p-6 border border-yellow-400/30 mb-8">
              <p className="text-yellow-300 font-bold mb-3">
                Ještě {countdownToNextRank} příspěvků a jsi Chaos Major! 🎖️
              </p>
              <motion.div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${100 - (countdownToNextRank / 10) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                />
              </motion.div>
            </div>

            {/* Distance to #1 */}
            <p className="text-lg md:text-xl text-cyan-300 font-bold mb-8">
              Česko se dotahuje! Jen {distanceTo1st.toLocaleString()} příspěvků do #1! 🚀
            </p>
          </div>

          {/* Share button - desktop only */}
          <div className="hidden md:flex justify-center">
            <Button
              onClick={() => {
                const text = `🔥 Česko #${czRank?.rank || 2}! Pojď nám pomoct dobýt #1! 🇨🇿\n\n${leaderboard.map((c) => `#${c.rank} ${c.flag} ${c.country}`).join('\n')}`;
                const url = `${window.location.origin}/league`;
                
                if (navigator.share) {
                  navigator.share({
                    title: 'National Chaos League 🔥',
                    text,
                    url,
                  }).catch(() => {});
                } else {
                  // Fallback for desktop
                  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                  window.open(shareUrl);
                }
              }}
              variant="outline"
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 px-8 h-16 text-lg font-heading font-bold"
              data-testid="button-share-league"
            >
              <Share2 className="w-5 h-5 mr-2" />
              🚀 Sdílet ranking & pozvat kamarády
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Floating elements */}
      {showConfetti && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: -400,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="fixed text-4xl pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
              }}
            >
              {i % 3 === 0 ? '🎉' : i % 3 === 1 ? '✨' : '🔥'}
            </motion.div>
          ))}
        </>
      )}

      {/* Creator Modal */}
      <CreatorModal
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        onSubmit={handleGenerateContent}
        isLoading={generateAIMutation.isPending}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeTab="league" 
        onTabChange={(tab) => {
          if (tab === 'canvas') setLocation('/canvas');
          else if (tab === 'league') setLocation('/league');
          else if (tab === 'profile') setLocation('/profile');
          else if (tab === 'mine') setLocation('/');
        }}
        onCreateClick={() => {
          setCreatorOpen(true);
        }}
      />
    </div>
  );
}
