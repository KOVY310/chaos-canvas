import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export function UpgradeButton() {
  const { currentUserId } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const upgrade = async (priceId: string) => {
    if (!currentUserId) return;
    try {
      setLoading(priceId);
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: currentUserId })
      });
      const data = await res.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        console.error('No session URL returned:', data);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 mt-6 px-2">
      <Button
        onClick={() => upgrade('price_1SWvyxHmG0fvQfPw8JQCBWK0')}
        disabled={loading === 'price_1SWvyxHmG0fvQfPw8JQCBWK0'}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition disabled:opacity-50"
        data-testid="button-upgrade-100-coins"
      >
        {loading === 'price_1SWvyxHmG0fvQfPw8JQCBWK0' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            100 Coins
            <br />
            29 Kč
          </>
        )}
      </Button>

      <Button
        onClick={() => upgrade('price_1SWw0xHmG0fvQfPwYZPwwbwl')}
        disabled={loading === 'price_1SWw0xHmG0fvQfPwYZPwwbwl'}
        className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-6 rounded-3xl shadow-2xl scale-110 border-4 border-yellow-400 hover:scale-125 transition disabled:opacity-50"
        data-testid="button-upgrade-500-coins"
      >
        {loading === 'price_1SWw0xHmG0fvQfPwYZPwwbwl' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            ★ 500 Coins ★
            <br />
            119 Kč
            <br />
            <span className="text-xs">Nejvýhodnější!</span>
          </>
        )}
      </Button>

      <Button
        onClick={() => upgrade('price_1SWvw1HmG0fvQfPwPPypg3sh')}
        disabled={loading === 'price_1SWvw1HmG0fvQfPwPPypg3sh'}
        className="bg-gradient-to-r from-yellow-400 to-orange-600 text-black font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition disabled:opacity-50"
        data-testid="button-upgrade-chaospro"
      >
        {loading === 'price_1SWvw1HmG0fvQfPwPPypg3sh' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            ChaosPro
            <br />
            99 Kč/měsíc
          </>
        )}
      </Button>
    </div>
  );
}
