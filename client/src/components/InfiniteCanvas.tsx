import { useRef, useState, useEffect, type MouseEvent, type WheelEvent } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

export interface CanvasContribution {
  id: string;
  userId: string;
  contentType: 'image' | 'text' | 'video' | 'audio';
  contentData: {
    url?: string;
    text?: string;
    prompt?: string;
  };
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  boostCount: number;
}

interface InfiniteCanvasProps {
  layerId: string;
  contributions: CanvasContribution[];
  onAddContribution?: (x: number, y: number) => void;
  className?: string;
}

export function InfiniteCanvas({ layerId, contributions, onAddContribution, className }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useApp();

  // Handle mouse wheel for zooming
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    
    setScale(newScale);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle double-click to add content
  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onAddContribution && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      onAddContribution(x, y);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-background cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing",
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      data-testid="infinite-canvas"
    >
      {/* Grid background for spatial orientation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      />

      {/* Canvas content container */}
      <div
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Render contributions */}
        {contributions.map((contribution) => (
          <div
            key={contribution.id}
            className="absolute group hover-elevate rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-200"
            style={{
              left: `${contribution.positionX}px`,
              top: `${contribution.positionY}px`,
              width: `${contribution.width}px`,
              height: `${contribution.height}px`,
            }}
            data-testid={`contribution-${contribution.id}`}
          >
            {/* Image content */}
            {contribution.contentType === 'image' && contribution.contentData.url && (
              <img
                src={contribution.contentData.url}
                alt={contribution.contentData.prompt || 'Contribution'}
                className="w-full h-full object-cover"
              />
            )}

            {/* Text content */}
            {contribution.contentType === 'text' && contribution.contentData.text && (
              <div className="w-full h-full p-4 flex items-center justify-center text-center">
                <p className="text-sm font-medium">{contribution.contentData.text}</p>
              </div>
            )}

            {/* Boost indicator */}
            {contribution.boostCount > 0 && (
              <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                🚀 {contribution.boostCount}
              </div>
            )}

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium hover-elevate"
                data-testid={`button-boost-${contribution.id}`}
              >
                {t('common.boost')}
              </button>
            </div>
          </div>
        ))}

        {/* Center marker */}
        <div className="absolute w-4 h-4 bg-primary rounded-full -ml-2 -mt-2 border-2 border-background" style={{ left: 0, top: 0 }} />
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border px-3 py-2 rounded-lg text-sm font-medium">
        Zoom: {(scale * 100).toFixed(0)}%
      </div>

      {/* Mini-map (simplified for MVP) */}
      <div className="absolute bottom-4 right-4 w-48 h-32 bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          Mini-map
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
