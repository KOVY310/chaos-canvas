import { LayoutGrid, Flame, User, Home } from "lucide-react";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems = [
    { id: 'canvas', label: 'Canvas', icon: LayoutGrid },
    { id: 'league', label: 'League', icon: Flame },
    { id: 'mine', label: 'Mine', icon: User },
    { id: 'profile', label: 'Profile', icon: Home },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 blur-nav z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
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
                {item.label}
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
      </div>
    </nav>
  );
}
