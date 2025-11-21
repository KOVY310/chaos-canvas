import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES, type Locale, type Currency } from '@shared/schema';

const LOCALE_NAMES: Record<Locale, string> = {
  'en-US': '🇺🇸 English (US)',
  'cs-CZ': '🇨🇿 Čeština',
  'de-DE': '🇩🇪 Deutsch',
  'sk-SK': '🇸🇰 Slovenčina',
  'pl-PL': '🇵🇱 Polski',
  'es-ES': '🇪🇸 Español',
  'fr-FR': '🇫🇷 Français',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  'EUR': '€ EUR',
  'USD': '$ USD',
  'CZK': 'Kč CZK',
  'GBP': '£ GBP',
};

export function LanguageCurrencySelector() {
  const { locale, setLocale, currency, setCurrency } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-language-currency">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
            data-testid={`menu-item-locale-${loc}`}
          >
            {LOCALE_NAMES[loc]}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Currency</DropdownMenuLabel>
        {SUPPORTED_CURRENCIES.map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => setCurrency(curr)}
            className={currency === curr ? 'bg-accent' : ''}
            data-testid={`menu-item-currency-${curr}`}
          >
            {CURRENCY_NAMES[curr]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
