import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Locale, Currency } from '@shared/schema';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '@shared/schema';
import { translations, getTranslation } from '@/lib/i18n';

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (path: string) => string;
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  chaosCoins: number;
  setChaosCoins: (coins: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or defaults
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('chaoscanvas_locale');
    return (saved && SUPPORTED_LOCALES.includes(saved as Locale)) ? saved as Locale : 'en-US';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('chaoscanvas_currency');
    return (saved && SUPPORTED_CURRENCIES.includes(saved as Currency)) ? saved as Currency : 'EUR';
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chaosCoins, setChaosCoins] = useState<number>(100);

  // Persist locale and currency to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('chaoscanvas_locale', newLocale);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('chaoscanvas_currency', newCurrency);
  };

  // Translation function
  const t = (path: string) => getTranslation(locale, path);

  const value = {
    locale,
    setLocale,
    currency,
    setCurrency,
    t,
    currentUserId,
    setCurrentUserId,
    chaosCoins,
    setChaosCoins,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
