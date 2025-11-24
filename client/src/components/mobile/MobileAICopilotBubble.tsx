import { useState, useRef } from "react";
import { Sparkles, Mic, MicOff, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MobileAICopilotBubbleProps {
  onGenerate?: (prompt: string, style: string) => Promise<void>;
  isLoading?: boolean;
}

export function MobileAICopilotBubble({ onGenerate, isLoading }: MobileAICopilotBubbleProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("meme");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const styles = [
    { id: "meme", label: "Meme" },
    { id: "pixel", label: "Pixel Art" },
    { id: "anime", label: "Anime" },
    { id: "photo", label: "Photo" },
    { id: "surreal", label: "Surreal" },
  ];

  const aiSuggestions = [
    "Dinosaurus v Praze",
    "Flying pizza over city",
    "Pixel art gaming scene",
    "Anime-style portrait",
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // For now, convert to base64 text (simplified)
        const reader = new FileReader();
        reader.onload = () => {
          const audioData = reader.result as string;
          // Extract just the audio data portion
          setPrompt("🎤 Voice input detected - ready to generate");
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: "Recording...", description: "Speak your creative idea" });
    } catch (error) {
      toast({ title: "Microphone Error", description: "Please allow microphone access", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !onGenerate) return;
    try {
      await onGenerate(prompt, selectedStyle);
      setPrompt("");
      setOpen(false);
    } catch (error) {
      toast({ title: "Generation Error", description: "Failed to generate content", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Floating Purple Bubble */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-24 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg z-40 flex items-center justify-center hover:shadow-xl active:scale-90 transition-all animate-bounce"
        data-testid="button-ai-copilot"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Dialog for AI Copilot */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:hidden w-full max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Co-Pilot
              </DialogTitle>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-accent rounded"
                data-testid="button-close-copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Style Selector */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Style</p>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Badge
                    key={style.id}
                    variant={selectedStyle === style.id ? "default" : "secondary"}
                    onClick={() => setSelectedStyle(style.id)}
                    className="cursor-pointer"
                    data-testid={`style-${style.id}`}
                  >
                    {style.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Your Idea</p>
              <Textarea
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                data-testid="input-ai-prompt"
                className="resize-none min-h-24"
              />
            </div>

            {/* Voice Input Button */}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full"
              data-testid="button-voice-input"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Idea
                </>
              )}
            </Button>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Quick Ideas</p>
              <div className="grid grid-cols-2 gap-2">
                {aiSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(suggestion);
                      setSelectedStyle("meme");
                    }}
                    className="p-3 text-sm text-left bg-card border border-border rounded-lg hover:bg-accent transition-all"
                    data-testid={`ai-suggestion-${i}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              data-testid="button-generate-ai"
            >
              {isLoading ? "Generating..." : "Generate 🎨"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
