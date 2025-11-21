import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCanvasLayerSchema, 
  insertContributionSchema,
  insertChaosBubbleSchema,
  insertTransactionSchema,
  insertInvestmentSchema,
  type Contribution,
} from "@shared/schema";

// WebSocket integration from blueprint
// WebSocket clients map: layerId -> Set<WebSocket>
const layerClients = new Map<string, Set<WebSocket>>();

// Broadcast to all clients in a layer
function broadcastToLayer(layerId: string, message: any) {
  const clients = layerClients.get(layerId);
  if (clients) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server on /ws path (distinct from Vite HMR)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentLayerId: string | null = null;

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join_layer') {
          // Join a canvas layer
          currentLayerId = message.layerId;
          if (!layerClients.has(currentLayerId)) {
            layerClients.set(currentLayerId, new Set());
          }
          layerClients.get(currentLayerId)!.add(ws);
          
          ws.send(JSON.stringify({ type: 'joined', layerId: currentLayerId }));
        } else if (message.type === 'contribution_added' && currentLayerId) {
          // Broadcast new contribution to all clients in the layer
          broadcastToLayer(currentLayerId, {
            type: 'new_contribution',
            contribution: message.contribution,
          });
        } else if (message.type === 'contribution_boosted' && currentLayerId) {
          // Broadcast boost to all clients
          broadcastToLayer(currentLayerId, {
            type: 'contribution_updated',
            contributionId: message.contributionId,
            boostCount: message.boostCount,
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from layer
      if (currentLayerId) {
        const clients = layerClients.get(currentLayerId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            layerClients.delete(currentLayerId);
          }
        }
      }
    });
  });

  // ========== USER ROUTES ==========
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CANVAS LAYER ROUTES ==========
  
  app.get("/api/canvas-layers", async (req, res) => {
    try {
      const { layerType, regionCode } = req.query;
      const layers = await storage.getLayersByType(
        layerType as string,
        regionCode as string | undefined
      );
      res.json(layers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/canvas-layers/:id", async (req, res) => {
    try {
      const layer = await storage.getCanvasLayer(req.params.id);
      if (!layer) {
        return res.status(404).json({ error: "Canvas layer not found" });
      }
      res.json(layer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/canvas-layers", async (req, res) => {
    try {
      const layerData = insertCanvasLayerSchema.parse(req.body);
      const layer = await storage.createCanvasLayer(layerData);
      res.json(layer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== CONTRIBUTION ROUTES ==========
  
  app.get("/api/contributions/layer/:layerId", async (req, res) => {
    try {
      const contributions = await storage.getContributionsByLayer(req.params.layerId);
      res.json(contributions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contributions/:id", async (req, res) => {
    try {
      const contribution = await storage.getContribution(req.params.id);
      if (!contribution) {
        return res.status(404).json({ error: "Contribution not found" });
      }
      res.json(contribution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    try {
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(contributionData);
      
      // Broadcast to WebSocket clients
      broadcastToLayer(contribution.layerId, {
        type: 'new_contribution',
        contribution,
      });
      
      res.json(contribution);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/contributions/:id/boost", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      const contributionId = req.params.id;
      
      // Validate inputs
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing userId or amount" });
      }

      // Get user and contribution
      const user = await storage.getUser(userId);
      const contribution = await storage.getContribution(contributionId);
      
      if (!user || !contribution) {
        return res.status(404).json({ error: "User or contribution not found" });
      }

      // Check if user has enough coins
      if (user.chaosCoins < amount) {
        return res.status(400).json({ error: "Insufficient ChaosCoins" });
      }

      // Deduct coins from user
      await storage.updateUserCoins(userId, user.chaosCoins - amount);

      // Boost contribution
      const boosted = await storage.boostContribution(contributionId);

      // Calculate revenue share (50% to contribution author)
      const authorEarnings = Math.floor(amount * 0.5);
      const contributionAuthor = await storage.getUser(contribution.userId);
      
      if (contributionAuthor) {
        await storage.updateUserCoins(
          contribution.userId,
          contributionAuthor.chaosCoins + authorEarnings
        );

        // Create transaction for author earnings
        await storage.createTransaction({
          userId: contribution.userId,
          type: 'earned',
          amount: authorEarnings,
          contributionId,
          description: `Earned from boost by ${user.username}`,
        });
      }

      // Create transaction for booster
      await storage.createTransaction({
        userId,
        type: 'boost',
        amount: -amount,
        contributionId,
        description: `Boosted contribution`,
      });

      // Update market price (simple algorithm: +10% per boost)
      const currentPrice = parseFloat(contribution.marketPrice);
      const newPrice = (currentPrice * 1.1).toFixed(2);
      await storage.updateContributionPrice(contributionId, newPrice);

      // Broadcast to WebSocket
      broadcastToLayer(contribution.layerId, {
        type: 'contribution_updated',
        contributionId,
        boostCount: boosted?.boostCount || 0,
        marketPrice: newPrice,
      });

      res.json(boosted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== AI CO-PILOT ROUTES (Prepared for OpenAI integration) ==========
  
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, style, userId } = req.body;
      
      if (!prompt || !userId) {
        return res.status(400).json({ error: "Missing prompt or userId" });
      }

      // TODO: When OPENAI_API_KEY is available, uncomment this:
      /*
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${style} style: ${prompt}`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      const imageUrl = response.data[0].url;
      */

      // MOCK implementation for now
      const imageUrl = `https://placehold.co/400x300/6366f1/white?text=${encodeURIComponent(prompt.substring(0, 20))}`;

      res.json({
        url: imageUrl,
        prompt,
        style,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { userId, context } = req.body;
      
      // TODO: When OPENAI_API_KEY is available, use GPT-5 for personalized suggestions
      /*
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-5",  // newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a creative AI assistant helping users with meme and art ideas." },
          { role: "user", content: `Generate 3 creative suggestions based on: ${context}` }
        ],
      });
      const suggestions = JSON.parse(response.choices[0].message.content);
      */

      // MOCK suggestions for now
      const suggestions = [
        { id: '1', text: 'Cyberpunk city at sunset', style: 'pixel' },
        { id: '2', text: 'Cat riding a dragon', style: 'anime' },
        { id: '3', text: 'Epic battle scene', style: 'meme' },
      ];

      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CHAOS COINS / PAYMENT ROUTES (Prepared for Stripe) ==========
  
  app.post("/api/coins/purchase", async (req, res) => {
    try {
      const { userId, amount, packageId } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing userId or amount" });
      }

      // TODO: When STRIPE_SECRET_KEY is available, create actual payment intent
      /*
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: req.body.currency || "eur",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
      */

      // MOCK: Directly add coins for now
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const coinsToAdd = packageId === '100' ? 100 : packageId === '500' ? 500 : packageId === '1000' ? 1000 : 2000;
      await storage.updateUserCoins(userId, user.chaosCoins + coinsToAdd);

      await storage.createTransaction({
        userId,
        type: 'purchase',
        amount: coinsToAdd,
        description: `Purchased ${coinsToAdd} ChaosCoins`,
      });

      res.json({ success: true, newBalance: user.chaosCoins + coinsToAdd });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CHAOS BUBBLE ROUTES ==========
  
  app.get("/api/bubbles/user/:userId", async (req, res) => {
    try {
      const bubbles = await storage.getUserBubbles(req.params.userId);
      res.json(bubbles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bubbles/:id", async (req, res) => {
    try {
      const bubble = await storage.getChaosBubble(req.params.id);
      if (!bubble) {
        return res.status(404).json({ error: "Bubble not found" });
      }
      res.json(bubble);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bubbles", async (req, res) => {
    try {
      const bubbleData = insertChaosBubbleSchema.parse(req.body);
      const bubble = await storage.createChaosBubble(bubbleData);
      res.json(bubble);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== MEME ECONOMY / INVESTMENT ROUTES ==========
  
  app.post("/api/investments", async (req, res) => {
    try {
      const { userId, contributionId, amount } = req.body;
      
      if (!userId || !contributionId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUser(userId);
      const contribution = await storage.getContribution(contributionId);

      if (!user || !contribution) {
        return res.status(404).json({ error: "User or contribution not found" });
      }

      if (user.chaosCoins < amount) {
        return res.status(400).json({ error: "Insufficient ChaosCoins" });
      }

      // Deduct coins
      await storage.updateUserCoins(userId, user.chaosCoins - amount);

      // Create investment
      const investment = await storage.createInvestment({
        userId,
        contributionId,
        amount,
        purchasePrice: contribution.marketPrice,
      });

      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'investment',
        amount: -amount,
        contributionId,
        description: `Invested in contribution`,
      });

      res.json(investment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/investments/user/:userId", async (req, res) => {
    try {
      const investments = await storage.getUserInvestments(req.params.userId);
      res.json(investments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== DAILY HIGHLIGHTS (Cron job will be in separate file) ==========
  
  app.get("/api/highlights/latest", async (req, res) => {
    try {
      // TODO: Implement daily highlights retrieval
      res.json({ message: "Daily highlights feature coming soon" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
