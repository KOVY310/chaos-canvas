import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  canvasLayers,
  contributions,
  transactions,
  chaosBubbles,
  dailyHighlights,
  investments,
  type User,
  type InsertUser,
  type CanvasLayer,
  type InsertCanvasLayer,
  type Contribution,
  type InsertContribution,
  type Transaction,
  type InsertTransaction,
  type ChaosBubble,
  type InsertChaosBubble,
  type Investment,
  type InsertInvestment,
} from "@shared/schema";

const { Pool } = pg;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: string, amount: number): Promise<User | undefined>;
  
  // Canvas Layers
  getCanvasLayer(id: string): Promise<CanvasLayer | undefined>;
  getLayersByType(layerType: string, regionCode?: string): Promise<CanvasLayer[]>;
  createCanvasLayer(layer: InsertCanvasLayer): Promise<CanvasLayer>;
  
  // Contributions
  getContribution(id: string): Promise<Contribution | undefined>;
  getContributionsByLayer(layerId: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  boostContribution(contributionId: string): Promise<Contribution | undefined>;
  updateContributionPrice(contributionId: string, newPrice: string): Promise<Contribution | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Chaos Bubbles
  getChaosBubble(id: string): Promise<ChaosBubble | undefined>;
  getUserBubbles(userId: string): Promise<ChaosBubble[]>;
  createChaosBubble(bubble: InsertChaosBubble): Promise<ChaosBubble>;
  
  // Investments
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getUserInvestments(userId: string): Promise<Investment[]>;
  getContributionInvestments(contributionId: string): Promise<Investment[]>;
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(userId: string, amount: number): Promise<User | undefined> {
    const [user] = await this.db
      .update(users)
      .set({ chaosCoins: amount })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Canvas Layers
  async getCanvasLayer(id: string): Promise<CanvasLayer | undefined> {
    const [layer] = await this.db.select().from(canvasLayers).where(eq(canvasLayers.id, id));
    return layer;
  }

  async getLayersByType(layerType: string, regionCode?: string): Promise<CanvasLayer[]> {
    if (regionCode) {
      return this.db
        .select()
        .from(canvasLayers)
        .where(and(eq(canvasLayers.layerType, layerType), eq(canvasLayers.regionCode, regionCode)));
    }
    return this.db.select().from(canvasLayers).where(eq(canvasLayers.layerType, layerType));
  }

  async createCanvasLayer(layer: InsertCanvasLayer): Promise<CanvasLayer> {
    const [newLayer] = await this.db.insert(canvasLayers).values(layer).returning();
    return newLayer;
  }

  // Contributions
  async getContribution(id: string): Promise<Contribution | undefined> {
    const [contribution] = await this.db.select().from(contributions).where(eq(contributions.id, id));
    return contribution;
  }

  async getContributionsByLayer(layerId: string): Promise<Contribution[]> {
    return this.db
      .select()
      .from(contributions)
      .where(eq(contributions.layerId, layerId))
      .orderBy(desc(contributions.createdAt));
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [newContribution] = await this.db.insert(contributions).values([contribution]).returning();
    return newContribution;
  }

  async boostContribution(contributionId: string): Promise<Contribution | undefined> {
    const contribution = await this.getContribution(contributionId);
    if (!contribution) return undefined;

    const [updated] = await this.db
      .update(contributions)
      .set({ boostCount: contribution.boostCount + 1 })
      .where(eq(contributions.id, contributionId))
      .returning();
    return updated;
  }

  async updateContributionPrice(contributionId: string, newPrice: string): Promise<Contribution | undefined> {
    const [updated] = await this.db
      .update(contributions)
      .set({ marketPrice: newPrice })
      .where(eq(contributions.id, contributionId))
      .returning();
    return updated;
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await this.db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Chaos Bubbles
  async getChaosBubble(id: string): Promise<ChaosBubble | undefined> {
    const [bubble] = await this.db.select().from(chaosBubbles).where(eq(chaosBubbles.id, id));
    return bubble;
  }

  async getUserBubbles(userId: string): Promise<ChaosBubble[]> {
    return this.db.select().from(chaosBubbles).where(eq(chaosBubbles.ownerId, userId));
  }

  async createChaosBubble(bubble: InsertChaosBubble): Promise<ChaosBubble> {
    const [newBubble] = await this.db.insert(chaosBubbles).values(bubble).returning();
    return newBubble;
  }

  // Investments
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await this.db.insert(investments).values([investment]).returning();
    return newInvestment;
  }

  async getUserInvestments(userId: string): Promise<Investment[]> {
    return this.db
      .select()
      .from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.createdAt));
  }

  async getContributionInvestments(contributionId: string): Promise<Investment[]> {
    return this.db.select().from(investments).where(eq(investments.contributionId, contributionId));
  }
}

export const storage = new PostgresStorage();
