import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          setPrompt(prev => prev + ' [🎤 Voice recorded]');
        };
        
        mediaRecorder.start();
        
        // Auto-stop after 10 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 10000);
        
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      } catch (error) {
        console.error('Microphone error:', error);
        alert('Mikrofonový přístup denied');
      }
    } else {
      setIsRecording(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:hidden w-full max-w-full rounded-none p-3 flex flex-col gap-2 max-h-screen overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle>Tvůj Chaos</DialogTitle>
          <DialogDescription>Vytváření obsahu pro nekonečné plátno</DialogDescription>
        </DialogHeader>

        {/* Style Toggles */}
        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">Styl</label>
          <ToggleGroup
            type="single"
            value={style}
            onValueChange={setStyle}
            className="grid grid-cols-5 gap-1"
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
        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">Tvůj Nápad</label>
          <div className="relative flex gap-1">
            <Textarea
              placeholder="Piš nebo rekni co chceš vytvořit..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              data-testid="input-creator-prompt"
              className="flex-1 resize-none min-h-20"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
              type="button"
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
              data-testid="button-voice"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* AI Suggestions Grid (Scrollable with Max Height) */}
        <div className="mb-2 max-h-32 overflow-y-auto">
          <label className="text-sm font-medium block mb-1 sticky top-0 bg-background">AI Návrhy</label>
          <div className="grid grid-cols-2 gap-1 pr-2">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPrompt(suggestion)}
                className="p-2 bg-card border border-border rounded-lg text-left text-xs hover:bg-accent hover-elevate transition-all group relative overflow-hidden h-24"
                data-testid={`suggestion-${i}`}
              >
                {/* AI Preview Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full flex flex-col justify-between">
                  <p className="line-clamp-2 text-xs font-medium">{suggestion}</p>
                  <div className="text-xl">✨</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit Button - Always Visible at Bottom */}
        <motion.div whileTap={{ scale: 0.95 }} className="flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="w-full h-11 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-base"
            data-testid="button-add-canvas"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2">⚡</div>
                Tvořím...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                PŘIDAT NA PLÁTNO
              </>
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
