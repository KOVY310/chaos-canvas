import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface CreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (prompt: string, style: string) => void;
  isLoading?: boolean;
  suggestions?: string[];
}

export function CreatorModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  suggestions = [
    'Cat riding skateboard',
    'Wojak vs Pepe',
    'Doge in space',
    'Among us chaos',
    'Minion dancing',
    'Rick Astley vibes',
  ],
}: CreatorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('meme');
  const [isRecording, setIsRecording] = useState(false);

  const styles = [
    { id: 'meme', label: 'Meme 🔥' },
    { id: 'surreal', label: 'Surreal' },
    { id: 'pixel', label: 'Pixel' },
    { id: 'anime', label: 'Anime' },
    { id: 'chaos', label: 'Chaos' },
  ];

  const handleSubmit = () => {
    if (prompt.trim() && onSubmit) {
      // Trigger confetti via global confetti function if available
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      onSubmit(prompt, style);
      setPrompt('');
      onOpenChange(false);
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if ('vibrate' in navigator) {
      navigator.vibrate([100]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:hidden w-full h-screen max-w-full rounded-none p-4 flex flex-col gap-0">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Tvůj Chaos</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-accent rounded-lg"
              data-testid="button-close-creator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Style Toggles */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">Styl</label>
          <ToggleGroup
            type="single"
            value={style}
            onValueChange={setStyle}
            className="grid grid-cols-5 gap-2"
          >
            {styles.map((s) => (
              <ToggleGroupItem
                key={s.id}
                value={s.id}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs"
                data-testid={`style-${s.id}`}
              >
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Prompt Input with Voice */}
        <div className="mb-4 flex-1">
          <label className="text-sm font-medium block mb-2">Tvůj Nápad</label>
          <div className="relative flex gap-2">
            <Textarea
              placeholder="Piš nebo rekni co chceš vytvořit..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              data-testid="input-creator-prompt"
              className="flex-1 resize-none min-h-24"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={handleMicClick}
              onMouseUp={() => setIsRecording(false)}
              className={`p-2 rounded-lg transition-all ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
              data-testid="button-voice"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* AI Suggestions Grid (2x3 Bento) */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">AI Návrhy</label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPrompt(suggestion)}
                className="p-3 bg-card border border-border rounded-lg text-left text-sm hover:bg-accent hover-elevate transition-all group relative overflow-hidden h-32"
                data-testid={`suggestion-${i}`}
              >
                {/* AI Preview Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full flex flex-col justify-between">
                  <p className="line-clamp-2 text-xs font-medium">{suggestion}</p>
                  <div className="text-2xl">✨</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-lg"
            data-testid="button-add-canvas"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2">⚡</div>
                Tvořím...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                PŘIDAT NA PLÁTNO
              </>
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
