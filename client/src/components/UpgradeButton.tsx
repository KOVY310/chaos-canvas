import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UpgradeButton() {
  const { currentUserId } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const upgrade = async (priceId: string) => {
    if (!currentUserId) {
      toast({ 
        title: "Chyba", 
        description: "Nejdřív se přihlas!", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      setLoading(priceId);
      console.log('🔄 Upgrading with userId:', currentUserId, 'priceId:', priceId);
      
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: currentUserId })
      });
      
      const data = await res.json();
      console.log('📦 API Response:', data);
      
      if (data.error) {
        toast({ 
          title: "Chyba", 
          description: data.error, 
          variant: "destructive" 
        });
        return;
      }
      
      if (data.sessionUrl) {
        console.log('✅ Redirecting to:', data.sessionUrl);
        window.location.href = data.sessionUrl;
      } else {
        toast({ 
          title: "Chyba", 
          description: "Nepodařilo se vytvořit checkout session", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('❌ Upgrade failed:', error);
      toast({ 
        title: "Chyba", 
        description: String(error), 
        variant: "destructive" 
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      {/* 100 Coins */}
      <Button
        onClick={() => upgrade('price_1SWvyxHmG0fvQfPw8JQCBWK0')}
        disabled={loading === 'price_1SWvyxHmG0fvQfPw8JQCBWK0'}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50"
        data-testid="button-upgrade-100-coins"
      >
        {loading === 'price_1SWvyxHmG0fvQfPw8JQCBWK0' ? (
          <Loader className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          <span>100 Coins — 29 Kč</span>
        )}
      </Button>

      {/* 500 Coins - BEST */}
      <Button
        onClick={() => upgrade('price_1SWw0xHmG0fvQfPwYZPwwbwl')}
        disabled={loading === 'price_1SWw0xHmG0fvQfPwYZPwwbwl'}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-2xl border-2 border-yellow-300 disabled:opacity-50"
        data-testid="button-upgrade-500-coins"
      >
        {loading === 'price_1SWw0xHmG0fvQfPwYZPwwbwl' ? (
          <Loader className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          <span>★ 500 Coins — 119 Kč (Nejvýhodnější!) ★</span>
        )}
      </Button>

      {/* ChaosPro */}
      <Button
        onClick={() => upgrade('price_1SWvw1HmG0fvQfPwPPypg3sh')}
        disabled={loading === 'price_1SWvw1HmG0fvQfPwPPypg3sh'}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-500 hover:to-orange-700 text-black font-bold py-3 rounded-xl shadow-lg disabled:opacity-50"
        data-testid="button-upgrade-chaospro"
      >
        {loading === 'price_1SWvw1HmG0fvQfPwPPypg3sh' ? (
          <Loader className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          <span>ChaosPro — 99 Kč/měsíc</span>
        )}
      </Button>
    </div>
  );
}
