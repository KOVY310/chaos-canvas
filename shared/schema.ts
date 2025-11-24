import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Supported locales and currencies for global coverage (50+ languages planned)
export const SUPPORTED_LOCALES = ['cs-CZ', 'de-DE', 'en-US', 'sk-SK', 'pl-PL', 'es-ES', 'fr-FR', 'fil-PH', 'id-ID', 'pt-BR', 'tr-TR', 'vi-VN', 'ja-JP', 'ko-KR', 'ru-RU'] as const;
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'CZK', 'GBP', 'PLN', 'PHP', 'IDR', 'BRL', 'TRY', 'VND'] as const;
export const LAYER_TYPES = ['global', 'continent', 'country', 'city', 'personal'] as const;

// Locale to currency mapping
export const LOCALE_CURRENCY_MAP: Record<string, typeof SUPPORTED_CURRENCIES[number]> = {
  'cs-CZ': 'CZK',
  'sk-SK': 'EUR',
  'de-DE': 'EUR',
  'es-ES': 'EUR',
  'fr-FR': 'EUR',
  'pl-PL': 'PLN',
  'en-US': 'USD',
  'pt-BR': 'BRL',
  'fil-PH': 'PHP',
  'id-ID': 'IDR',
  'tr-TR': 'TRY',
  'vi-VN': 'VND',
  'ja-JP': 'JPY' as any,
  'ko-KR': 'KRW' as any,
  'ru-RU': 'RUB' as any,
};

export type Locale = typeof SUPPORTED_LOCALES[number];
export type Currency = typeof SUPPORTED_CURRENCIES[number];
export type LayerType = typeof LAYER_TYPES[number];

// Users table with multi-locale and currency support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password"),
  email: text("email"),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  countryCode: text("country_code").default('US'),
  locale: text("locale").notNull().default('en-US'),
  currency: text("currency").notNull().default('EUR'),
  chaosCoins: integer("chaos_coins").notNull().default(100),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default('0'),
  dailyContributionCount: integer("daily_contribution_count").notNull().default(0),
  lastContributionReset: timestamp("last_contribution_reset").notNull().defaultNow(),
  mergedFromAnonymous: varchar("merged_from_anonymous"), // Track which anon account was merged
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"),
  aiStyle: jsonb("ai_style"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  anonIdx: index("users_is_anonymous_idx").on(table.isAnonymous),
}));

// Canvas layers with geographic hierarchy and geospatial support
export const canvasLayers = pgTable("canvas_layers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  layerType: text("layer_type").notNull(), // global, continent, country, city, personal
  regionCode: text("region_code").notNull(), // e.g., 'global', 'EU', 'CZ', 'prague', user_id for personal
  name: text("name").notNull(),
  zoomLevel: integer("zoom_level").notNull(), // 0=global, 1=continent, 2=country, 3=city, 4=personal
  seedPrompt: text("seed_prompt"), // Daily AI-generated theme
  activeSessionId: varchar("active_session_id"), // Current active canvas session
  sessionStartedAt: timestamp("session_started_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  regionIdx: index("canvas_layers_region_idx").on(table.regionCode),
  typeIdx: index("canvas_layers_type_idx").on(table.layerType),
}));

// User contributions to canvas
export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  layerId: varchar("layer_id").notNull().references(() => canvasLayers.id, { onDelete: 'cascade' }),
  contentType: text("content_type").notNull(), // 'image', 'text', 'video', 'audio'
  contentData: jsonb("content_data").notNull(), // Stores URL, prompt, style, etc.
  positionX: decimal("position_x", { precision: 10, scale: 2 }).notNull(),
  positionY: decimal("position_y", { precision: 10, scale: 2 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  boostCount: integer("boost_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }).notNull().default('10'), // Meme economy price
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("contributions_user_idx").on(table.userId),
  layerIdx: index("contributions_layer_idx").on(table.layerId),
  marketIdx: index("contributions_market_idx").on(table.marketPrice),
}));

// Transaction history for ownership economy
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'purchase', 'boost', 'earned', 'investment', 'payout'
  amount: integer("amount").notNull(),
  contributionId: varchar("contribution_id").references(() => contributions.id),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("transactions_user_idx").on(table.userId),
  typeIdx: index("transactions_type_idx").on(table.type),
}));

// Personal Chaos Bubbles
export const chaosBubbles = pgTable("chaos_bubbles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  isPrivate: boolean("is_private").notNull().default(true),
  invitedUserIds: jsonb("invited_user_ids").notNull().default([]), // Array of user IDs
  themeData: jsonb("theme_data"), // AI-generated theme based on owner's style
  layerId: varchar("layer_id").references(() => canvasLayers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  ownerIdx: index("chaos_bubbles_owner_idx").on(table.ownerId),
}));

// Daily highlights reel
export const dailyHighlights = pgTable("daily_highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  videoUrl: text("video_url"),
  contributionIds: jsonb("contribution_ids").notNull(), // Array of top contribution IDs
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("daily_highlights_date_idx").on(table.date),
}));

// Meme economy investments
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contributionId: varchar("contribution_id").notNull().references(() => contributions.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // ChaosCoins invested
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("investments_user_idx").on(table.userId),
  contributionIdx: index("investments_contribution_idx").on(table.contributionId),
}));

// National Chaos League - Country rankings
export const nationalChaosScores = pgTable("national_chaos_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code").notNull().unique(), // 'CZ', 'PH', 'DE', etc.
  countryName: text("country_name").notNull(),
  contributionCount: integer("contribution_count").notNull().default(0),
  totalBoosts: integer("total_boosts").notNull().default(0),
  totalExports: integer("total_exports").notNull().default(0),
  score: integer("score").notNull().default(0), // Calculated from above
  rank: integer("rank").notNull().default(0),
  borderColor: text("border_color"), // Special color for top 3
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  scoreIdx: index("national_chaos_scores_score_idx").on(table.score),
  rankIdx: index("national_chaos_scores_rank_idx").on(table.rank),
}));

// Chaos Takeover Events - Weekly live takeovers
export const chaosTakeovers = pgTable("chaos_takeovers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekNumber: integer("week_number").notNull(),
  winnerUserId: varchar("winner_user_id").references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  viewerCount: integer("viewer_count").notNull().default(0),
  coinsSpent: integer("coins_spent").notNull().default(0),
  globalCanvasSnapshot: jsonb("global_canvas_snapshot"), // Snapshot of canvas during takeover
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  weekIdx: index("chaos_takeovers_week_idx").on(table.weekNumber),
  winnerIdx: index("chaos_takeovers_winner_idx").on(table.winnerUserId),
}));

// Daily Seed Prompts - Multi-language daily themes
export const seedPrompts = pgTable("seed_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().unique(),
  theme: text("theme").notNull(), // Base English theme
  translations: jsonb("translations").notNull(), // { 'cs-CZ': 'Téma...', 'de-DE': 'Thema...', ... }
  style: text("style"), // Art style suggestion
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("seed_prompts_date_idx").on(table.date),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  locale: z.enum(SUPPORTED_LOCALES),
  currency: z.enum(SUPPORTED_CURRENCIES),
  email: z.string().email().optional(),
}).omit({ id: true, createdAt: true, chaosCoins: true, totalEarned: true });

export const insertCanvasLayerSchema = createInsertSchema(canvasLayers, {
  layerType: z.enum(LAYER_TYPES),
  zoomLevel: z.number().min(0).max(4),
}).omit({ id: true, createdAt: true });

export const insertContributionSchema = createInsertSchema(contributions, {
  contentType: z.enum(['image', 'text', 'video', 'audio']),
  contentData: z.object({
    url: z.string().optional(),
    prompt: z.string().optional(),
    style: z.string().optional(),
    text: z.string().optional(),
  }),
  positionX: z.union([z.string(), z.number()]).transform(val => Number(val)),
  positionY: z.union([z.string(), z.number()]).transform(val => Number(val)),
  width: z.number().min(10),
  height: z.number().min(10),
}).omit({ id: true, createdAt: true, boostCount: true, viewCount: true, marketPrice: true });

export const insertChaosBubbleSchema = createInsertSchema(chaosBubbles, {
  invitedUserIds: z.array(z.string()),
}).omit({ id: true, createdAt: true });

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });

export const insertInvestmentSchema = createInsertSchema(investments, {
  purchasePrice: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true, currentValue: true });

export const insertNationalChaosScoreSchema = createInsertSchema(nationalChaosScores).omit({ id: true, updatedAt: true });

export const insertChaosTakeoverSchema = createInsertSchema(chaosTakeovers).omit({ id: true, createdAt: true });

export const insertSeedPromptSchema = createInsertSchema(seedPrompts, {
  translations: z.record(z.string()),
}).omit({ id: true, createdAt: true });

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCanvasLayer = z.infer<typeof insertCanvasLayerSchema>;
export type CanvasLayer = typeof canvasLayers.$inferSelect;

export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;

export type InsertChaosBubble = z.infer<typeof insertChaosBubbleSchema>;
export type ChaosBubble = typeof chaosBubbles.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

export type InsertNationalChaosScore = z.infer<typeof insertNationalChaosScoreSchema>;
export type NationalChaosScore = typeof nationalChaosScores.$inferSelect;

export type InsertChaosTakeover = z.infer<typeof insertChaosTakeoverSchema>;
export type ChaosTakeover = typeof chaosTakeovers.$inferSelect;

export type InsertSeedPrompt = z.infer<typeof insertSeedPromptSchema>;
export type SeedPrompt = typeof seedPrompts.$inferSelect;

export type DailyHighlight = typeof dailyHighlights.$inferSelect;
