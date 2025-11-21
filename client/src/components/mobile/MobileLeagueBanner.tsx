import { Sparkles } from "lucide-react";

export function MobileLeagueBanner() {
  return (
    <div
      className="md:hidden sticky top-0 z-30 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-border p-4 space-y-2 animate-in fade-in"
      data-testid="banner-league"
    >
      <div className="flex items-center gap-2 justify-center">
        <Sparkles className="w-5 h-5 text-orange-500 animate-spin" />
        <div className="text-center">
          <p className="font-heading font-bold text-lg">
            Filipíny vedou o 420k!
          </p>
          <p className="text-sm text-muted-foreground">
            Česko #2
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
    </div>
  );
}
