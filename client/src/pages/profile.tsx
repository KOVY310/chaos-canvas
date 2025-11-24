import { motion } from 'framer-motion';
import { Share2, LogOut, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginModal } from '@/components/mobile/LoginModal';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import type { Contribution } from '@shared/schema';

interface UserProfile {
  id: string;
  username: string;
  chaosCoins: number;
  contributions: Contribution[];
  globalRank: number;
  countryRank: number;
  country: string;
  followers: number;
  isAuthenticated: boolean;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { t, currentUserId, chaosCoins } = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const [liveFollowers, setLiveFollowers] = useState(4206900);
  const [glitchOffset, setGlitchOffset] = useState(0);
  const isGuest = currentUserId?.startsWith('guest_');

  // Live follower counter - increments every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFollowers(prev => prev + Math.floor(Math.random() * 50000) + 10000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Glitch effect animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOffset(Math.random() * 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for demo
  const profile: UserProfile = {
    id: currentUserId || '',
    username: isGuest ? 'guest_69' : '@kamo420',
    chaosCoins,
    contributions: [],
    globalRank: 69,
    countryRank: 420,
    country: 'CZ',
    followers: liveFollowers,
    isAuthenticated: !isGuest,
  };

  const contributionCount = profile.contributions.length;
  const badgeCount = Math.floor(contributionCount / 10);

  const badges = [
    { name: 'Pivní král', icon: '🍺', unlocked: badgeCount >= 1 },
    { name: 'Meme God', icon: '🎨', unlocked: badgeCount >= 2 },
    { name: 'Filipínský válečník', icon: '🇵🇭', unlocked: badgeCount >= 3 },
    { name: 'Chaos Master', icon: '⚡', unlocked: badgeCount >= 4 },
  ];

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#FF006E] via-black to-[#00F5FF] pb-24">
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-8 pb-6 text-center"
      >
        {/* Neon Avatar - Pulsing Rainbow Glow (140px + extra strong glow) */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative inline-block mb-4"
        >
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 p-1 neon-glow shadow-2xl"
            style={{
              boxShadow: '0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(136, 39, 201, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-7xl">🐱</span>
            </div>
          </div>
        </motion.div>

        {/* Username - with glitch effect */}
        <motion.h1 
          animate={{ x: glitchOffset }}
          className="font-heading text-5xl font-bold text-white mb-2 transition-transform duration-300"
          style={{
            textShadow: glitchOffset > 1.5 ? '2px 2px 0px rgba(236, 72, 153, 0.8), -2px -2px 0px rgba(0, 245, 255, 0.8)' : 'none'
          }}
        >
          {profile.username}
        </motion.h1>

        {/* Country Flag + Rank */}
        <div className="flex items-center justify-center gap-3 text-cyan-300 mb-4">
          <span className="text-2xl">{profile.country === 'CZ' ? '🇨🇿' : '🌍'}</span>
          <span className="font-mono text-sm">#{profile.countryRank} {profile.country}</span>
          <span className="font-mono text-sm">#{profile.globalRank} Global</span>
        </div>

        {/* Social Proof - Live Followers Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <motion.p
            key={liveFollowers}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className="text-sm text-pink-300 font-bold"
          >
            📊 Právě teď sleduje {(profile.followers / 1000000).toFixed(1)}M lidí tvůj chaos
          </motion.p>
        </motion.div>
      </motion.div>

      {/* BIG STATS - Animated Numbers */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 px-4 mb-8"
      >
        {/* ChaosCoins */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-3xl p-4 text-center backdrop-blur">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-heading font-bold text-purple-300"
          >
            {chaosCoins}
          </motion.div>
          <p className="text-xs text-purple-200 mt-1">ChaosCoins</p>
        </div>

        {/* Contributions */}
        <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/50 rounded-3xl p-4 text-center backdrop-blur">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="text-2xl font-heading font-bold text-pink-300"
          >
            {contributionCount}
          </motion.div>
          <p className="text-xs text-pink-200 mt-1">Příspěvky</p>
        </div>

        {/* Global Rank */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-3xl p-4 text-center backdrop-blur">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="text-2xl font-heading font-bold text-cyan-300"
          >
            #{profile.globalRank}
          </motion.div>
          <p className="text-xs text-cyan-200 mt-1">Global Rank</p>
        </div>
      </motion.div>

      {/* BADGES SECTION */}
      {badgeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-4 mb-8"
        >
          <p className="text-xs text-muted-foreground mb-3 font-bold">🏆 ODZNAKY</p>
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => (
              <motion.div
                key={badge.name}
                initial={{ scale: 0 }}
                animate={{ scale: badge.unlocked ? 1 : 0.5 }}
                className={`rounded-full p-2 text-center ${
                  badge.unlocked
                    ? 'bg-yellow-500/30 border border-yellow-500 neon-glow'
                    : 'bg-gray-700/30 border border-gray-600 opacity-50'
                }`}
              >
                <span className="text-xl">{badge.icon}</span>
                <p className="text-xs mt-1 font-bold text-white">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* UPGRADE BUTTON - Massive CTA with Sparkles (only for guests) */}
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 mb-8 relative"
        >
          {/* Sparkle effect on hover */}
          <motion.button
            onClick={() => setLoginOpen(true)}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white font-heading font-bold py-4 rounded-3xl shadow-2xl neon-glow transition-all relative overflow-hidden group"
            data-testid="button-upgrade-legend"
          >
            {/* Animated sparkles on hover */}
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                  className="absolute text-lg"
                  style={{
                    left: `${25 + i * 20}%`,
                    bottom: '50%',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
            
            <span className="relative z-10">🚀 Povýšit na Chaos Legendu</span>
          </motion.button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Přihlaste se s Google/Apple/TikTok aby jste měli cool jméno
          </p>
        </motion.div>
      )}

      {/* AUTHENTICATED VIEW - After login show Chaos God badge */}
      {!isGuest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 mb-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-3"
          >
            👑
          </motion.div>
          <p className="text-sm font-heading font-bold text-yellow-300">Chaos God</p>
        </motion.div>
      )}

      {/* CHAOS GALLERY - 3-column grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-4"
      >
        <h2 className="font-heading font-bold text-lg text-white mb-4">Tvůj Chaos</h2>

        {contributionCount === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-3xl border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Přidej první chaos a staň se legendou</p>
            <p className="text-4xl">🌍</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {profile.contributions.map((contribution, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-square bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl border border-white/10 flex items-center justify-center text-2xl cursor-pointer hover:scale-105 transition-transform"
              >
                💎
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SHARE BUTTON */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="px-4 mt-8"
      >
        <Button
          variant="outline"
          className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
          data-testid="button-share-profile"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Podívej se na můj chaos šílenství
        </Button>
      </motion.div>

      {/* Login Modal */}
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onLogin={(provider) => {
          console.log(`Logging in with ${provider}`);
          // In production: would handle auth flow here
        }}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeTab="profile" 
        onTabChange={(tab) => {
          if (tab === 'profile') {
            // Already on profile
          } else if (tab === 'mine') {
            setLocation('/');
          } else {
            setLocation('/');
          }
        }}
        onCreateClick={() => {
          setLocation('/');
        }}
      />
    </div>
  );
}
