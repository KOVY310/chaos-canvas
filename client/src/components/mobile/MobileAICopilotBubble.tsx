import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface MobileAICopilotBubbleProps {
  onGenerate?: (prompt: string) => void;
  isLoading?: boolean;
}

export function MobileAICopilotBubble({ onGenerate, isLoading }: MobileAICopilotBubbleProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const aiSuggestions = [
    "Generate a trending meme format",
    "Create a surreal landscape",
    "Design pixel art character",
    "Make anime-style portrait",
  ];

  return (
    <>
      {/* Floating Purple Bubble */}
      <motion.button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-24 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg z-40 flex items-center justify-center hover:shadow-xl active:scale-90 transition-all"
        data-testid="button-ai-copilot"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Drawer for AI Copilot */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Co-Pilot
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            <Textarea
              placeholder="Ask AI what to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              data-testid="input-ai-prompt"
              className="resize-none min-h-20"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick Suggestions</p>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full p-3 text-left bg-card border border-border rounded-lg hover:bg-accent hover-elevate transition-all"
                    data-testid={`ai-suggestion-${i}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                if (prompt.trim() && onGenerate) {
                  onGenerate(prompt);
                  setPrompt("");
                  setOpen(false);
                }
              }}
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-generate"
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
