import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function LiveActivityTicker() {
  const [activityCount, setActivityCount] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityCount((prev) => prev + Math.floor(Math.random() * 15) + 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const activities = [
    `Právě teď přidalo ${activityCount} lidí chaos`,
    'Česko je #2 v lize! 🚀',
    'Nový rekord: 50K příspěvků za hodinu!',
    'Tým právě odemkl "MEGA MODE" 🔥',
    '🔥 Trending: Létající svíčková',
  ];

  const [currentActivity, setCurrentActivity] = useState(activities[0]);

  useEffect(() => {
    const activityInterval = setInterval(() => {
      setCurrentActivity(
        activities[Math.floor(Math.random() * activities.length)]
      );
    }, 4000);

    return () => clearInterval(activityInterval);
  }, [activityCount]);

  return (
    <motion.div
      animate={{ x: [0, -100, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3.5 }}
      className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-orange-900/50 border-b border-cyan-400/30 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 text-sm font-bold whitespace-nowrap overflow-hidden"
      data-testid="ticker-activity"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, linear: true }}
      >
        <Zap className="w-4 h-4 text-orange-400" />
      </motion.div>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
        {currentActivity}
      </span>
    </motion.div>
  );
}
