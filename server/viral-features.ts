import type { Storage } from './storage';
import type { NationalChaosScore, ChaosTakeover, SeedPrompt } from '@shared/schema';

// Daily seed prompts in multiple languages
const SEED_PROMPTS_DATA = [
  {
    theme: 'Flying svíčková over Prague',
    translations: {
      'en-US': 'Flying svíčková over Prague',
      'cs-CZ': 'Létající svíčková nad Prahou',
      'de-DE': 'Fliegende Knödel über Prag',
      'es-ES': 'Svíčková voladora sobre Praga',
      'fil-PH': 'Lumipad na Svíčková sa ibabaw ng Prague',
      'id-ID': 'Svíčková terbang di atas Praha',
      'pt-BR': 'Svíčková voando sobre Praga',
      'pl-PL': 'Latająca svíčková nad Pragą',
    },
    style: 'Baroque meets cyberpunk',
  },
];

export async function generateDailySeedPrompt(storage: Storage): Promise<SeedPrompt | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Get or create daily seed prompt
    const promptIndex = Math.floor(Math.random() * SEED_PROMPTS_DATA.length);
    const promptData = SEED_PROMPTS_DATA[promptIndex];
    
    return {
      id: `seed-${today.getTime()}`,
      date: today,
      theme: promptData.theme,
      translations: promptData.translations,
      style: promptData.style,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to generate daily seed prompt:', error);
    return null;
  }
}

export function calculateNationalChaosScore(
  contributionCount: number,
  totalBoosts: number,
  totalExports: number,
): number {
  // Score calculation: contributions (10 pts each) + boosts (5 pts each) + exports (20 pts each)
  return (contributionCount * 10) + (totalBoosts * 5) + (totalExports * 20);
}

export async function updateNationalChaosLeaderboard(storage: Storage): Promise<NationalChaosScore[]> {
  // TODO: Implement leaderboard calculation from contributions
  // This would aggregate scores by user's locale/country
  return [];
}
