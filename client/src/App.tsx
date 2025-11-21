import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import CanvasPage from "@/pages/canvas";
import NotFound from "@/pages/not-found";

// Dev Indicator
function DevIndicator() {
  const { locale, currency } = useApp();
  
  const countryFlags: Record<string, string> = {
    'cs-CZ': '🇨🇿',
    'en-US': '🇺🇸',
    'de-DE': '🇩🇪',
    'fil-PH': '🇵🇭',
    'id-ID': '🇮🇩',
    'pt-BR': '🇧🇷',
    'es-ES': '🇪🇸',
    'fr-FR': '🇫🇷',
    'tr-TR': '🇹🇷',
    'vi-VN': '🇻🇳',
    'ja-JP': '🇯🇵',
    'ko-KR': '🇰🇷',
    'ru-RU': '🇷🇺',
    'pl-PL': '🇵🇱',
    'sk-SK': '🇸🇰',
  };

  const flag = countryFlags[locale] || '🌍';

  if (import.meta.env.DEV) {
    return (
      <div 
        className="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full animate-pulse z-50 text-sm font-bold"
        data-testid="dev-indicator"
      >
        🌍 {locale.toUpperCase()} • {currency} • {flag}
      </div>
    );
  }
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CanvasPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <DevIndicator />
          <Router />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
