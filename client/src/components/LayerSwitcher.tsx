import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Globe, Map, MapPin, Building2, User } from 'lucide-react';
import type { LayerType } from '@shared/schema';

interface Layer {
  id: string;
  type: LayerType;
  name: string;
  regionCode: string;
}

interface LayerSwitcherProps {
  currentLayer: Layer;
  breadcrumbs: Layer[];
  onLayerChange: (layer: Layer) => void;
  className?: string;
}

const LAYER_ICONS: Record<LayerType, typeof Globe> = {
  global: Globe,
  continent: Map,
  country: MapPin,
  city: Building2,
  personal: User,
};

export function LayerSwitcher({ currentLayer, breadcrumbs, onLayerChange, className }: LayerSwitcherProps) {
  const { t } = useApp();

  return (
    <div className={cn("flex items-center gap-2 px-4 py-3 bg-card border-b border-border", className)} data-testid="layer-switcher">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {breadcrumbs.map((layer, index) => {
          const Icon = LAYER_ICONS[layer.type];
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={layer.id} className="flex items-center gap-1 shrink-0">
              <Button
                variant={isLast ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  !isLast && "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => !isLast && onLayerChange(layer)}
                data-testid={`button-layer-${layer.type}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{layer.name}</span>
              </Button>
              {!isLast && (
                <span className="text-muted-foreground">/</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick jump dropdown (simplified for MVP) */}
      <Button variant="outline" size="sm" data-testid="button-quick-jump">
        Quick Jump
      </Button>
    </div>
  );
}
