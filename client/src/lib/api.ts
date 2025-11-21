import { apiRequest } from './queryClient';
import type { 
  User, 
  InsertUser, 
  CanvasLayer,
  InsertCanvasLayer,
  Contribution,
  InsertContribution,
  ChaosBubble,
  InsertChaosBubble,
  Transaction,
  Investment,
} from '@shared/schema';

// ========== USER API ==========

export async function createUser(data: InsertUser): Promise<User> {
  const response = await apiRequest('POST', '/api/users', data);
  return response.json();
}

export async function getUser(id: string): Promise<User> {
  const response = await apiRequest('GET', `/api/users/${id}`, undefined);
  return response.json();
}

// ========== CANVAS LAYER API ==========

export async function getCanvasLayers(layerType?: string, regionCode?: string): Promise<CanvasLayer[]> {
  const params = new URLSearchParams();
  if (layerType) params.append('layerType', layerType);
  if (regionCode) params.append('regionCode', regionCode);
  
  const response = await apiRequest('GET', `/api/canvas-layers?${params.toString()}`, undefined);
  return response.json();
}

export async function getCanvasLayer(id: string): Promise<CanvasLayer> {
  const response = await apiRequest('GET', `/api/canvas-layers/${id}`, undefined);
  return response.json();
}

export async function createCanvasLayer(data: InsertCanvasLayer): Promise<CanvasLayer> {
  const response = await apiRequest('POST', '/api/canvas-layers', data);
  return response.json();
}

// ========== CONTRIBUTION API ==========

export async function getContributionsByLayer(layerId: string): Promise<Contribution[]> {
  const response = await apiRequest('GET', `/api/contributions/layer/${layerId}`, undefined);
  return response.json();
}

export async function getContribution(id: string): Promise<Contribution> {
  const response = await apiRequest('GET', `/api/contributions/${id}`, undefined);
  return response.json();
}

export async function createContribution(data: InsertContribution): Promise<Contribution> {
  const response = await apiRequest('POST', '/api/contributions', data);
  return response.json();
}

export async function boostContribution(contributionId: string, userId: string, amount: number): Promise<Contribution> {
  const response = await apiRequest('POST', `/api/contributions/${contributionId}/boost`, { userId, amount });
  return response.json();
}

// ========== AI API ==========

export async function generateAIContent(prompt: string, style: string, userId: string): Promise<{ url: string; prompt: string; style: string }> {
  const response = await apiRequest('POST', '/api/ai/generate', { prompt, style, userId });
  return response.json();
}

export async function getAISuggestions(userId: string, context: string): Promise<{ suggestions: any[] }> {
  const response = await apiRequest('POST', '/api/ai/suggestions', { userId, context });
  return response.json();
}

// ========== COINS / PAYMENT API ==========

export async function purchaseCoins(userId: string, amount: number, packageId: string): Promise<{ success: boolean; newBalance: number }> {
  const response = await apiRequest('POST', '/api/coins/purchase', { userId, amount, packageId });
  return response.json();
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const response = await apiRequest('GET', `/api/transactions/${userId}`, undefined);
  return response.json();
}

// ========== CHAOS BUBBLE API ==========

export async function getUserBubbles(userId: string): Promise<ChaosBubble[]> {
  const response = await apiRequest('GET', `/api/bubbles/user/${userId}`, undefined);
  return response.json();
}

export async function getChaosBubble(id: string): Promise<ChaosBubble> {
  const response = await apiRequest('GET', `/api/bubbles/${id}`, undefined);
  return response.json();
}

export async function createChaosBubble(data: InsertChaosBubble): Promise<ChaosBubble> {
  const response = await apiRequest('POST', '/api/bubbles', data);
  return response.json();
}

// ========== INVESTMENT API ==========

export async function createInvestment(userId: string, contributionId: string, amount: number): Promise<Investment> {
  const response = await apiRequest('POST', '/api/investments', { userId, contributionId, amount });
  return response.json();
}

export async function getUserInvestments(userId: string): Promise<Investment[]> {
  const response = await apiRequest('GET', `/api/investments/user/${userId}`, undefined);
  return response.json();
}

// ========== VIRAL FEATURES API ==========

export async function getDailySeedPrompt(locale: string = 'en-US'): Promise<any> {
  const response = await apiRequest('GET', `/api/daily-seed-prompts?locale=${locale}`, undefined);
  return response.json();
}

export async function getNationalChaosLeague(): Promise<any> {
  const response = await apiRequest('GET', '/api/national-chaos-league', undefined);
  return response.json();
}

export async function getChaosTakeover(): Promise<any> {
  const response = await apiRequest('GET', '/api/chaos-takeover', undefined);
  return response.json();
}
