// Internationalization configuration and translation utilities
import { SUPPORTED_LOCALES, type Locale } from "@shared/schema";

export const translations = {
  'en-US': {
    appName: 'ChaosCanvas',
    tagline: 'You are the algorithm',
    chaosCoins: 'ChaosCoins',
    layers: {
      global: 'Global',
      continent: 'Continent',
      country: 'Country',
      city: 'City',
      personal: 'Personal Bubble',
    },
    aiCopilot: {
      title: 'AI Co-Pilot',
      placeholder: 'Describe what you want to create...',
      generate: 'Generate',
      suggestions: 'Suggestions for you',
    },
    memeEconomy: {
      title: 'Meme Economy',
      invest: 'Invest',
      price: 'Price',
      change: 'Change',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      boost: 'Boost',
      export: 'Export',
    },
  },
  'cs-CZ': {
    appName: 'ChaosCanvas',
    tagline: 'Ty jsi ten algoritmus',
    chaosCoins: 'ChaosCoiny',
    layers: {
      global: 'Globální',
      continent: 'Kontinent',
      country: 'Země',
      city: 'Město',
      personal: 'Osobní Bublina',
    },
    aiCopilot: {
      title: 'AI Kopilot',
      placeholder: 'Popiš, co chceš vytvořit...',
      generate: 'Vygenerovat',
      suggestions: 'Návrhy pro tebe',
    },
    memeEconomy: {
      title: 'Meme Ekonomika',
      invest: 'Investovat',
      price: 'Cena',
      change: 'Změna',
    },
    common: {
      loading: 'Načítání...',
      error: 'Chyba',
      save: 'Uložit',
      cancel: 'Zrušit',
      delete: 'Smazat',
      edit: 'Upravit',
      boost: 'Podpořit',
      export: 'Exportovat',
    },
  },
  'de-DE': {
    appName: 'ChaosCanvas',
    tagline: 'Du bist der Algorithmus',
    chaosCoins: 'ChaosCoins',
    layers: {
      global: 'Global',
      continent: 'Kontinent',
      country: 'Land',
      city: 'Stadt',
      personal: 'Persönliche Blase',
    },
    aiCopilot: {
      title: 'KI Co-Pilot',
      placeholder: 'Beschreibe, was du erstellen möchtest...',
      generate: 'Generieren',
      suggestions: 'Vorschläge für dich',
    },
    memeEconomy: {
      title: 'Meme Wirtschaft',
      invest: 'Investieren',
      price: 'Preis',
      change: 'Änderung',
    },
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      boost: 'Boosten',
      export: 'Exportieren',
    },
  },
  'sk-SK': {
    appName: 'ChaosCanvas',
    tagline: 'Ty si ten algoritmus',
    chaosCoins: 'ChaosCoiny',
    layers: {
      global: 'Globálne',
      continent: 'Kontinent',
      country: 'Krajina',
      city: 'Mesto',
      personal: 'Osobná Bublina',
    },
    aiCopilot: {
      title: 'AI Kopilot',
      placeholder: 'Popíš, čo chceš vytvoriť...',
      generate: 'Vygenerovať',
      suggestions: 'Návrhy pre teba',
    },
    memeEconomy: {
      title: 'Meme Ekonomika',
      invest: 'Investovať',
      price: 'Cena',
      change: 'Zmena',
    },
    common: {
      loading: 'Načítava sa...',
      error: 'Chyba',
      save: 'Uložiť',
      cancel: 'Zrušiť',
      delete: 'Zmazať',
      edit: 'Upraviť',
      boost: 'Podporiť',
      export: 'Exportovať',
    },
  },
  'pl-PL': {
    appName: 'ChaosCanvas',
    tagline: 'Ty jesteś algorytmem',
    chaosCoins: 'ChaosCoiny',
    layers: {
      global: 'Globalne',
      continent: 'Kontynent',
      country: 'Kraj',
      city: 'Miasto',
      personal: 'Osobista Bańka',
    },
    aiCopilot: {
      title: 'AI Co-Pilot',
      placeholder: 'Opisz, co chcesz stworzyć...',
      generate: 'Generuj',
      suggestions: 'Sugestie dla Ciebie',
    },
    memeEconomy: {
      title: 'Ekonomia Meme',
      invest: 'Inwestuj',
      price: 'Cena',
      change: 'Zmiana',
    },
    common: {
      loading: 'Ładowanie...',
      error: 'Błąd',
      save: 'Zapisz',
      cancel: 'Anuluj',
      delete: 'Usuń',
      edit: 'Edytuj',
      boost: 'Wzmocnij',
      export: 'Eksportuj',
    },
  },
  'es-ES': {
    appName: 'ChaosCanvas',
    tagline: 'Tú eres el algoritmo',
    chaosCoins: 'ChaosCoins',
    layers: {
      global: 'Global',
      continent: 'Continente',
      country: 'País',
      city: 'Ciudad',
      personal: 'Burbuja Personal',
    },
    aiCopilot: {
      title: 'IA Co-Piloto',
      placeholder: 'Describe lo que quieres crear...',
      generate: 'Generar',
      suggestions: 'Sugerencias para ti',
    },
    memeEconomy: {
      title: 'Economía Meme',
      invest: 'Invertir',
      price: 'Precio',
      change: 'Cambio',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      boost: 'Impulsar',
      export: 'Exportar',
    },
  },
  'fr-FR': {
    appName: 'ChaosCanvas',
    tagline: 'Tu es l\'algorithme',
    chaosCoins: 'ChaosCoins',
    layers: {
      global: 'Mondial',
      continent: 'Continent',
      country: 'Pays',
      city: 'Ville',
      personal: 'Bulle Personnelle',
    },
    aiCopilot: {
      title: 'IA Co-Pilote',
      placeholder: 'Décris ce que tu veux créer...',
      generate: 'Générer',
      suggestions: 'Suggestions pour toi',
    },
    memeEconomy: {
      title: 'Économie Meme',
      invest: 'Investir',
      price: 'Prix',
      change: 'Changement',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      boost: 'Booster',
      export: 'Exporter',
    },
  },
};

export type TranslationKey = keyof typeof translations['en-US'];

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    CZK: 'Kč',
    GBP: '£',
  };
  return symbols[currency] || currency;
}

export function formatPrice(amount: number, currency: string, locale: Locale): string {
  const symbol = getCurrencySymbol(currency);
  
  // Different formatting based on locale
  if (locale === 'cs-CZ' || locale === 'sk-SK') {
    return `${amount.toFixed(2)} ${symbol}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export function getTranslation(locale: Locale, path: string): string {
  const keys = path.split('.');
  let value: any = translations[locale] || translations['en-US'];
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      // Fallback to English
      value = translations['en-US'];
      for (const k of keys) {
        value = value?.[k];
      }
      break;
    }
  }
  
  return value || path;
}
