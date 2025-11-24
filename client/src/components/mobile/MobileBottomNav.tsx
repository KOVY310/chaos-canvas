import { LayoutGrid, Flame, User, Home, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateClick?: () => void;
}

export function MobileBottomNav({ activeTab, onTabChange, onCreateClick }: MobileBottomNavProps) {
  const { t } = useApp();

  const navItems = [
    { id: 'canvas', label: 'nav.canvas', icon: LayoutGrid },
    { id: 'league', label: 'nav.league', icon: Flame },
    { id: 'mine', label: 'nav.mine', icon: User },
    { id: 'profile', label: 'nav.settings', icon: Home },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 blur-nav z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 flex-1 py-2 relative"
              data-testid={`nav-${item.id}`}
            >
              <motion.div
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                className={`transition-all ${
                  isActive
                    ? 'neon-glow text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span
                className={`text-xs font-medium transition-all ${
                  isActive
                    ? 'text-primary font-heading font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {t(item.label)}
              </span>

              {/* Active indicator - bar above */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}

        {/* Center Create Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            onCreateClick?.();
            if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
          }}
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white z-40 flex items-center justify-center shadow-lg breathe border border-white/20"
          data-testid="button-create-floating"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>
    </nav>
  );
}
