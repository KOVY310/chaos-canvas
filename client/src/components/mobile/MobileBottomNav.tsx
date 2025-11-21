import { LayoutGrid, Flame, User, Home } from "lucide-react";

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around h-16 z-50 safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            data-testid={`nav-${item.id}`}
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
