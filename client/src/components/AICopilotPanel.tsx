import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Wand2,
  Image as ImageIcon,
  Type,
  Video,
  Mic
} from 'lucide-react';

interface AISuggestion {
  id: string;
  text: string;
  style: string;
  thumbnail?: string;
}

interface AICopilotPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onGenerateContent?: (prompt: string, style: string) => Promise<void>;
  className?: string;
}

const STYLE_PRESETS = [
  { id: 'meme', label: 'Meme', icon: '😂' },
  { id: 'pixel', label: 'Pixel Art', icon: '🎮' },
  { id: 'anime', label: 'Anime', icon: '🎨' },
  { id: 'photo', label: 'Photo-realistic', icon: '📷' },
  { id: 'surreal', label: 'Surreal', icon: '🌀' },
  { id: 'sketch', label: 'Sketch', icon: '✏️' },
];

export function AICopilotPanel({ 
  isCollapsed = false, 
  onToggleCollapse,
  onGenerateContent,
  className 
}: AICopilotPanelProps) {
  const { t } = useApp();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('meme');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    { id: '1', text: 'Chaotic party scene', style: 'meme' },
    { id: '2', text: 'Flying pizza over Prague', style: 'surreal' },
    { id: '3', text: 'Retro gaming vibes', style: 'pixel' },
  ]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !onGenerateContent) return;
    
    setIsGenerating(true);
    try {
      await onGenerateContent(prompt, selectedStyle);
      setPrompt('');
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn("h-full w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4", className)}>
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleCollapse}
          data-testid="button-expand-copilot"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <div className="flex flex-col gap-3">
          <Button size="icon" variant="ghost" title="Generate Image" data-testid="button-quick-image">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Add Text" data-testid="button-quick-text">
            <Type className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Video" data-testid="button-quick-video">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Audio" data-testid="button-quick-audio">
            <Mic className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-80 bg-sidebar border-r border-sidebar-border flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-base">{t('aiCopilot.title')}</h2>
        </div>
        {onToggleCollapse && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleCollapse}
            data-testid="button-collapse-copilot"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Style presets carousel */}
      <div className="p-4 border-b border-sidebar-border">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {STYLE_PRESETS.map((style) => (
              <Badge
                key={style.id}
                variant={selectedStyle === style.id ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer whitespace-nowrap toggle-elevate",
                  selectedStyle === style.id && "toggle-elevated"
                )}
                onClick={() => setSelectedStyle(style.id)}
                data-testid={`badge-style-${style.id}`}
              >
                <span className="mr-1">{style.icon}</span>
                {style.label}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Prompt input */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('aiCopilot.placeholder')}
            className="flex-1"
            disabled={isGenerating}
            data-testid="input-ai-prompt"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            data-testid="button-generate"
          >
            {isGenerating ? (
              <Wand2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-sidebar-border">
          <h3 className="text-sm font-medium text-muted-foreground">{t('aiCopilot.suggestions')}</h3>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group p-3 rounded-lg border border-border bg-card hover-elevate cursor-pointer"
                onClick={() => setPrompt(suggestion.text)}
                data-testid={`suggestion-${suggestion.id}`}
              >
                <div className="flex items-start gap-3">
                  {suggestion.thumbnail ? (
                    <img
                      src={suggestion.thumbnail}
                      alt={suggestion.text}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{suggestion.text}</p>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.style}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Quick actions */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="grid grid-cols-4 gap-2">
          <Button size="sm" variant="ghost" className="flex-col h-auto py-2" data-testid="button-action-image">
            <ImageIcon className="w-4 h-4 mb-1" />
            <span className="text-xs">Image</span>
          </Button>
          <Button size="sm" variant="ghost" className="flex-col h-auto py-2" data-testid="button-action-text">
            <Type className="w-4 h-4 mb-1" />
            <span className="text-xs">Text</span>
          </Button>
          <Button size="sm" variant="ghost" className="flex-col h-auto py-2" data-testid="button-action-video">
            <Video className="w-4 h-4 mb-1" />
            <span className="text-xs">Video</span>
          </Button>
          <Button size="sm" variant="ghost" className="flex-col h-auto py-2" data-testid="button-action-audio">
            <Mic className="w-4 h-4 mb-1" />
            <span className="text-xs">Audio</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
