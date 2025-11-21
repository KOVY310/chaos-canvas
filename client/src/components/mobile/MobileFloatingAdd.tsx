import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";

interface MobileFloatingAddProps {
  onAddContent?: (prompt: string, style: string) => void;
  isLoading?: boolean;
}

export function MobileFloatingAdd({ onAddContent, isLoading }: MobileFloatingAddProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("meme");

  const styles = [
    { id: "meme", label: "Meme" },
    { id: "pixel", label: "Pixel" },
    { id: "anime", label: "Anime" },
    { id: "surreal", label: "Surreal" },
    { id: "3d", label: "3D" },
    { id: "abstract", label: "Abstract" },
  ];

  const suggestions = [
    "A cat wearing sunglasses riding a skateboard 🛹",
    "Wojak and pepe arguing about crypto 💎",
    "Doge in space suit on the moon 🚀",
    "Among us characters in real life 👽",
    "Minion doing the floss dance 💃",
    "Rick astley rolling never gonna give you up 🎵",
  ];

  const handleSubmit = () => {
    if (prompt.trim() && onAddContent) {
      onAddContent(prompt, style);
      setPrompt("");
      setOpen(false);
    }
  };

  return (
    <>
      {/* Floating Add Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg z-40 flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
        data-testid="button-add-content"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Full Screen Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:hidden w-full h-screen max-w-full rounded-none flex flex-col">
          <DialogHeader className="sticky top-0 bg-card border-b">
            <DialogTitle>Create Content</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Style Toggles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <ToggleGroup type="single" value={style} onValueChange={setStyle} className="grid grid-cols-3 gap-2">
                {styles.map((s) => (
                  <ToggleGroupItem
                    key={s.id}
                    value={s.id}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    data-testid={`style-${s.id}`}
                  >
                    {s.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Idea</label>
              <Textarea
                placeholder="Describe what you want to create... go wild! 🚀"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                data-testid="input-prompt"
                className="min-h-24 resize-none"
              />
            </div>

            {/* Suggestions Grid */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Suggestions</label>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="p-3 bg-card border border-border rounded-lg text-left text-sm hover:bg-accent hover-elevate transition-all"
                    data-testid={`suggestion-${i}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-0 bg-card border-t p-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-create"
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
