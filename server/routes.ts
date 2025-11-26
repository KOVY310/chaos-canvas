import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import * as cron from "node-cron";
import Stripe from "stripe";
import { 
  insertUserSchema, 
  insertCanvasLayerSchema, 
  insertContributionSchema,
  insertChaosBubbleSchema,
  insertTransactionSchema,
  insertInvestmentSchema,
  contributions,
  type Contribution,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import * as Sentry from "@sentry/node";

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

  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    tracesSampleRate: 1.0,
  });

  // ========== OG META TAGS MIDDLEWARE - Twitter/X crawler + browser preview ==========
  // Inject dynamic OG meta tags with PlaceHolder.co image
  app.get("/", (req, res, next) => {
    const ogTitle = req.query.og_title as string;
    
    // If og_title present, serve HTML with dynamic OG tags
    if (ogTitle) {
      const title = decodeURIComponent(ogTitle).substring(0, 60);
      console.log('[OG MIDDLEWARE] ✅ Generating OG with title:', title);
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      // Use placehold.co to generate image with text - PNG format works with Twitter
      const ogImageUrl = `https://placehold.co/1200x630/6366f1/white?text=${encodeURIComponent(title)}`;
      
      const html = `<!DOCTYPE html>
<html lang="cs-CZ">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ChaosCanvas - Přidej svou verzi "${title}"</title>
  <meta name="description" content="Právě jsem přidal svou verzi &quot;${title}&quot; 😭🔥 chaos.canvas" />
  <meta property="og:title" content="Přidej svou verzi &quot;${title}&quot;" />
  <meta property="og:description" content="Právě jsem přidal svou verzi &quot;${title}&quot; 😭🔥" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Přidej svou verzi &quot;${title}&quot;" />
  <meta name="twitter:description" content="Právě jsem přidal svou verzi &quot;${title}&quot; 😭🔥" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <script>
    if (!/bot|crawler|spider/i.test(navigator.userAgent)) {
      window.location.href = window.location.origin + '?ref=twitter';
    }
  </script>
</head>
<body>Načítám ChaosCanvas...</body>
</html>`;
      return res.type("html").send(html);
    }
    
    // Continue to default SPA rendering
    next();
  });

  // Auto-cleanup cron: Delete contributions older than 7 days (runs daily at 3 AM UTC)
  cron.schedule("0 3 * * *", async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      console.log(`[CRON] Auto-cleanup: Deleting contributions older than ${sevenDaysAgo.toISOString()}`);
      // TODO: Implement cleanup in storage layer
      // await storage.deleteOldContributions(sevenDaysAgo);
    } catch (error) {
      Sentry.captureException(error);
      console.error("[CRON] Auto-cleanup failed:", error);
    }
  });

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

  // ========== RATE LIMITING ==========
  const rateLimits = new Map<string, { count: number; resetTime: number }>();
  
  function checkRateLimit(key: string, maxRequests: number = 20, windowMs: number = 300000): boolean {
    const now = Date.now();
    const limit = rateLimits.get(key);
    
    if (!limit || now > limit.resetTime) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (limit.count < maxRequests) {
      limit.count++;
      return true;
    }
    return false;
  }

  // ========== USER ROUTES ==========
  
  // Anonymous user creation (3 lines magic!)
  app.post("/api/auth/anonymous", async (req, res) => {
    try {
      const { locale, countryCode, ipAddress } = req.body;
      const user = await storage.createUser({
        isAnonymous: true,
        locale: locale || 'en-US',
        currency: 'USD',
        countryCode: countryCode || 'US',
        username: `guest_${Date.now()}`,
        password: '',
      });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
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
      Sentry.captureException(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Profile merge: merge anonymous user to registered profile
  app.post("/api/users/merge", async (req, res) => {
    try {
      const { anonUserId, registeredUserId } = req.body;
      
      if (!anonUserId || !registeredUserId) {
        return res.status(400).json({ error: "Missing anonUserId or registeredUserId" });
      }
      
      // Get both users
      const anonUser = await storage.getUser(anonUserId);
      const registeredUser = await storage.getUser(registeredUserId);
      
      if (!anonUser || !registeredUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Transfer contributions from anon to registered
      // TODO: Implement contribution transfer logic in storage layer
      
      // Mark anon user as merged
      await storage.updateUser(anonUserId, { 
        mergedFromAnonymous: registeredUserId,
        isAnonymous: false,
      });
      
      res.json({ message: "Profile merged successfully" });
    } catch (error: any) {
      Sentry.captureException(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contributions/user/:userId", async (req, res) => {
    try {
      const userContributions = await storage.db
        .select()
        .from(contributions)
        .where(eq(contributions.userId, req.params.userId))
        .orderBy(desc(contributions.createdAt));
      res.json(userContributions);
    } catch (error: any) {
      Sentry.captureException(error);
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
      const { userId, ipAddress } = req.body;
      const rateLimitKey = `${userId}:${ipAddress || 'unknown'}`;
      
      // Rate limiting: max 20 contributions per 5 minutes
      if (!checkRateLimit(rateLimitKey, 20, 300000)) {
        return res.status(429).json({ error: "Too many contributions. Max 20 per 5 minutes." });
      }
      
      // Daily limit: max 15 contributions per day
      const user = await storage.getUser(userId);
      if (user) {
        const now = new Date();
        const lastReset = new Date(user.lastContributionReset);
        const isNewDay = now.getDate() !== lastReset.getDate() || 
                         now.getMonth() !== lastReset.getMonth() || 
                         now.getFullYear() !== lastReset.getFullYear();
        
        if (isNewDay) {
          // Reset counter for new day
          await storage.updateUserContributionCount(userId, 0);
        } else if (user.dailyContributionCount >= 15) {
          return res.status(429).json({ error: "Daily limit reached. Max 15 contributions per day." });
        }
        
        // Increment daily counter
        await storage.updateUserContributionCount(userId, user.dailyContributionCount + 1);
      }
      
      // TODO: NSFW filter via HuggingFace (when API key available)
      // For now, skip - add later with:
      // const moderation = await fetch('https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection', ...)
      
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(contributionData);
      
      // Broadcast to WebSocket clients
      broadcastToLayer(contribution.layerId, {
        type: 'new_contribution',
        contribution,
      });
      
      res.json(contribution);
    } catch (error: any) {
      console.error('[CONTRIBUTION ERROR]', error.message, error.stack);
      Sentry.captureException(error);
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

  // ========== AI CO-PILOT ROUTES (Unsplash + Pexels API) ==========
  
  app.post("/api/ai/generate", async (req, res) => {
    try {
      let { prompt, style = "meme", userId } = req.body;
      
      if (!prompt || !userId) {
        return res.status(400).json({ error: "Missing prompt or userId" });
      }

      // Use user's prompt, NOT seed prompt
      prompt = String(prompt).trim();

      // Style mappings for image search
      const styleMap: Record<string, string> = {
        meme: "viral tiktok meme, funny, trending",
        pixel: "pixel art, retro game style, 8-bit",
        anime: "anime style, detailed, vibrant",
        photo: "photorealistic, ultra detailed, 4k",
        surreal: "surreal, dreamlike, abstract",
      };

      const searchQuery = `${prompt} ${styleMap[style] || styleMap.meme}`;
      console.log(`[AI] Generating image for: "${searchQuery}"`);

      let imageUrl: string | null = null;
      let source = "unknown";

      // Try Unsplash API first (Primary)
      try {
        const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!unsplashKey) {
          throw new Error("UNSPLASH_ACCESS_KEY not configured");
        }

        const unsplashRes = await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&w=320&h=320&client_id=${unsplashKey}`,
          { headers: { 'Accept-Version': 'v1' } }
        );

        if (unsplashRes.ok) {
          const data = await unsplashRes.json() as any;
          imageUrl = data.urls?.regular || data.urls?.small;
          source = "unsplash";
          console.log(`[AI] ✅ Unsplash: ${imageUrl}`);
        } else {
          console.warn(`[AI] Unsplash failed (${unsplashRes.status}), trying Pexels...`);
        }
      } catch (error: any) {
        console.warn(`[AI] Unsplash error: ${error.message}`);
      }

      // Fallback to Pexels API
      if (!imageUrl) {
        try {
          const pexelsKey = process.env.PEXELS_API_KEY;
          if (!pexelsKey) {
            throw new Error("PEXELS_API_KEY not configured");
          }

          const pexelsRes = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&size=small`,
            { headers: { 'Authorization': pexelsKey } }
          );

          if (pexelsRes.ok) {
            const data = await pexelsRes.json() as any;
            if (data.photos && data.photos.length > 0) {
              imageUrl = data.photos[0].src?.small;
              source = "pexels";
              console.log(`[AI] ✅ Pexels: ${imageUrl}`);
            }
          } else {
            console.warn(`[AI] Pexels failed (${pexelsRes.status})`);
          }
        } catch (error: any) {
          console.warn(`[AI] Pexels error: ${error.message}`);
        }
      }

      // Fallback to placeholder if both APIs fail
      if (!imageUrl) {
        imageUrl = `https://placeholder.co/320x320?text=${encodeURIComponent(prompt.substring(0, 20))}`;
        source = "placeholder";
        console.log(`[AI] ⚠️ Fallback placeholder: ${imageUrl}`);
      }

      res.json({
        url: imageUrl,
        prompt,
        style,
        source,
      });
    } catch (error: any) {
      console.error("[AI] Generation error:", error.message);
      res.status(500).json({ 
        error: "AI generation failed - try a different prompt!",
        details: error.message 
      });
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

  // ========== STRIPE PAYMENT ROUTES ==========
  
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

  // Create Stripe checkout session for ChaosPro subscription
  app.post("/api/stripe/checkout-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const { userId, priceId } = req.body;
      if (!userId || !priceId) {
        return res.status(400).json({ error: "Missing userId or priceId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || `user-${userId}@chaoscanvas.local`,
          metadata: { userId },
        });
        customerId = customer.id;
        // Store Stripe customer ID for future reference
        await storage.updateUserStripeCustomer(userId, customerId);
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin || 'https://chaoscanvas.example.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://chaoscanvas.example.com'}/cancel`,
        metadata: { userId },
      });

      res.json({ sessionId: session.id, sessionUrl: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook handler
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ error: "Missing signature or webhook secret" });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          sig as string,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (error: any) {
        return res.status(400).json({ error: `Webhook signature failed: ${error.message}` });
      }

      // Handle subscription events
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        if (userId) {
          const user = await storage.getUser(userId);
          if (user && session.customer) {
            // Update user Pro status
            await storage.updateUserProStatus(userId, true);
            console.log(`✅ User ${userId} subscribed with Stripe customer ${session.customer}`);
          }
        }
      }

      if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
        const subscription = event.data.object as any;
        console.log(`✅ Subscription ${subscription.id} updated for customer ${subscription.customer}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CHAOS COINS / PAYMENT ROUTES ==========
  
  app.post("/api/coins/purchase", async (req, res) => {
    try {
      const { userId, amount, packageId } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing userId or amount" });
      }

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

  // ========== VIRAL FEATURES API ==========

  app.get("/api/daily-seed-prompts", async (req, res) => {
    try {
      const locale = (req.query.locale as string) || 'en-US';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mock seed prompt data - in production this would come from database
      const globalPrompt = {
        'en-US': 'Flying svíčková over Prague',
        'cs-CZ': 'Létající svíčková nad Prahou',
        'de-DE': 'Fliegende Knödel über Prag',
        'fil-PH': 'Lumipad na Svíčková sa ibabaw ng Prague',
        'id-ID': 'Svíčková terbang di atas Praha',
        'pt-BR': 'Svíčková voando sobre Praga',
      };

      const tomorrowMidnight = new Date(today);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

      res.json({
        globalPrompt: globalPrompt[locale as keyof typeof globalPrompt] || globalPrompt['en-US'],
        allLanguages: globalPrompt,
        expiresAt: tomorrowMidnight.toISOString(),
        style: 'Baroque meets cyberpunk',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/national-chaos-league", async (req, res) => {
    try {
      // Mock leaderboard data - in production would aggregate from contributions
      const leaderboard = [
        { countryCode: 'PH', countryName: 'Philippines 🇵🇭', score: 5240, contributionCount: 1250, rank: 1, borderColor: '#fbbf24' },
        { countryCode: 'CZ', countryName: 'Czechia 🇨🇿', score: 4180, contributionCount: 980, rank: 2, borderColor: '#f87171' },
        { countryCode: 'ID', countryName: 'Indonesia 🇮🇩', score: 3920, contributionCount: 850, rank: 3, borderColor: '#60a5fa' },
        { countryCode: 'DE', countryName: 'Germany 🇩🇪', score: 3450, contributionCount: 720, rank: 4, borderColor: '' },
        { countryCode: 'BR', countryName: 'Brazil 🇧🇷', score: 3210, contributionCount: 680, rank: 5, borderColor: '' },
        { countryCode: 'ES', countryName: 'Spain 🇪🇸', score: 2980, contributionCount: 640, rank: 6, borderColor: '' },
        { countryCode: 'PL', countryName: 'Poland 🇵🇱', score: 2850, contributionCount: 620, rank: 7, borderColor: '' },
        { countryCode: 'TR', countryName: 'Turkey 🇹🇷', score: 2720, contributionCount: 590, rank: 8, borderColor: '' },
        { countryCode: 'VN', countryName: 'Vietnam 🇻🇳', score: 2580, contributionCount: 560, rank: 9, borderColor: '' },
        { countryCode: 'JP', countryName: 'Japan 🇯🇵', score: 2450, contributionCount: 540, rank: 10, borderColor: '' },
      ];

      res.json({
        leaderboard,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chaos-takeover", async (req, res) => {
    try {
      // Next takeover is next Sunday at 20:00 CET
      const now = new Date();
      let nextTakeover = new Date();
      nextTakeover.setDate(nextTakeover.getDate() + ((7 - nextTakeover.getDay()) % 7));
      nextTakeover.setHours(20, 0, 0, 0);
      
      if (nextTakeover <= now) {
        nextTakeover.setDate(nextTakeover.getDate() + 7);
      }

      const isLive = false; // Only live on Sunday 20:00
      const currentHighestBid = isLive ? 5000 : undefined;

      res.json({
        nextTakeoverAt: nextTakeover.toISOString(),
        currentBid: currentHighestBid,
        isLive,
        winner: null,
        description: 'Global Canvas Takeover - 60 seconds of pure chaos control',
      });
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

  // ========== OG IMAGE GENERATION ==========
  // Generate simple OG image accessible to Twitter (SVG on our server)
  app.get("/api/og/share", async (req, res) => {
    try {
      const ogTitle = (req.query.og_title as string || "můj chaos").substring(0, 60);
      const width = 1200;
      const height = 630;
      
      // Generate SIMPLE SVG OG image - Twitter can fetch this from our server
      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a0033;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#330066;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000033;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Accent orbs -->
  <circle cx="150" cy="100" r="120" fill="#FF006E" opacity="0.2"/>
  <circle cx="1050" cy="530" r="150" fill="#00F5FF" opacity="0.15"/>
  
  <!-- Logo -->
  <circle cx="600" cy="100" r="50" fill="#FF006E" stroke="#FF69B4" stroke-width="2"/>
  <text x="600" y="120" font-size="60" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">C</text>
  
  <!-- Main title -->
  <text x="600" y="280" font-size="56" font-weight="bold" fill="#FF69B4" text-anchor="middle" font-family="Arial, sans-serif" word-spacing="5">
    ${ogTitle}
  </text>
  
  <!-- Tagline -->
  <text x="600" y="380" font-size="32" fill="#00F5FF" text-anchor="middle" font-family="Arial, sans-serif">
    Přidej svou verzi na chaos.canvas
  </text>
  
  <!-- Branding bar -->
  <rect x="0" y="550" width="${width}" height="80" fill="#FF006E" opacity="0.8"/>
  <text x="600" y="600" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
    chaos.canvas
  </text>
</svg>`;
      
      res.type('svg').send(svg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/og/today.png", async (req, res) => {
    try {
      const prompt = "Létající svíčková nad Prahou";
      const width = 1080;
      const height = 1920;
      
      // Generate SVG-based OG image (no external dependencies)
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1a0033;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#330066;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#000033;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
          
          <!-- Accent orbs -->
          <circle cx="200" cy="300" r="200" fill="#FF006E" opacity="0.2"/>
          <circle cx="900" cy="1600" r="250" fill="#00F5FF" opacity="0.15"/>
          
          <!-- Logo -->
          <circle cx="${width/2}" cy="200" r="60" fill="url(#bgGrad)" stroke="#FF006E" stroke-width="3"/>
          <text x="${width/2}" y="220" font-size="80" font-weight="bold" fill="#FF006E" text-anchor="middle" font-family="Arial, sans-serif">C</text>
          
          <!-- Main text -->
          <text x="${width/2}" y="500" font-size="72" font-weight="bold" fill="#FF69B4" text-anchor="middle" font-family="Arial, sans-serif" dominant-baseline="middle">
            ${prompt}
          </text>
          
          <!-- Subtext -->
          <text x="${width/2}" y="700" font-size="42" fill="#00F5FF" text-anchor="middle" font-family="Arial, sans-serif">
            Přidej svou verzi
          </text>
          
          <!-- Stats -->
          <text x="${width/2}" y="1000" font-size="48" font-weight="bold" fill="#FFD700" text-anchor="middle" font-family="Arial, sans-serif">
            4.2M tvůrců
          </text>
          <text x="${width/2}" y="1100" font-size="36" fill="#00D9FF" text-anchor="middle" font-family="Arial, sans-serif">
            Tvoří TEĎKA 🔥
          </text>
          
          <!-- CTA -->
          <rect x="150" y="1400" width="${width - 300}" height="200" rx="40" fill="#FF006E" opacity="0.8"/>
          <text x="${width/2}" y="1520" font-size="56" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
            PŘIDEJ SVŮJ CHAOS
          </text>
          
          <!-- Branding -->
          <text x="${width/2}" y="1850" font-size="28" fill="#999" text-anchor="middle" font-family="Arial, sans-serif">
            chaos.canvas
          </text>
        </svg>
      `;
      
      res.type('svg').send(svg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== LEAGUE OG IMAGE ==========
  app.get("/api/og/league.png", async (req, res) => {
    try {
      const width = 1080;
      const height = 1920;
      
      // Generate epic league OG image
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="leagueBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#9D00FF;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#FF006E;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1a0033;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="${width}" height="${height}" fill="url(#leagueBg)"/>
          
          <!-- Accent elements -->
          <circle cx="200" cy="400" r="250" fill="#FFD700" opacity="0.1"/>
          <circle cx="900" cy="1500" r="300" fill="#00F5FF" opacity="0.08"/>
          
          <!-- Main title -->
          <text x="${width/2}" y="150" font-size="96" font-weight="900" fill="#FFD700" text-anchor="middle" font-family="Arial, sans-serif">NATIONAL</text>
          <text x="${width/2}" y="280" font-size="96" font-weight="900" fill="#FF69B4" text-anchor="middle" font-family="Arial, sans-serif">CHAOS LEAGUE</text>
          
          <!-- Crown and flame -->
          <text x="${width/2 - 150}" y="350" font-size="80">👑</text>
          <text x="${width/2 + 150}" y="350" font-size="80">🔥</text>
          
          <!-- Top 3 positions -->
          <text x="${width/2}" y="550" font-size="48" font-weight="bold" fill="#FFD700" text-anchor="middle" font-family="Arial, sans-serif">#1 🇵🇭 Filipíny</text>
          <text x="${width/2}" y="650" font-size="48" font-weight="bold" fill="#00D9FF" text-anchor="middle" font-family="Arial, sans-serif">#2 🇨🇿 ČESKO</text>
          <text x="${width/2}" y="750" font-size="48" font-weight="bold" fill="#FF69B4" text-anchor="middle" font-family="Arial, sans-serif">#3 🇧🇷 Brazílie</text>
          
          <!-- Call to action -->
          <rect x="80" y="1000" width="${width - 160}" height="250" rx="30" fill="#FF006E" opacity="0.9"/>
          <text x="${width/2}" y="1080" font-size="52" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">ČESKO POTŘEBUJE TEBE!</text>
          <text x="${width/2}" y="1160" font-size="44" fill="#FFD700" text-anchor="middle" font-family="Arial, sans-serif">Jen 69 420 příspěvků do #1</text>
          
          <!-- Stats -->
          <text x="${width/2}" y="1450" font-size="36" fill="#00D9FF" font-weight="bold" text-anchor="middle" font-family="Arial, sans-serif">892K příspěvků</text>
          <text x="${width/2}" y="1520" font-size="36" fill="#FFD700" font-weight="bold" text-anchor="middle" font-family="Arial, sans-serif">4.2M tvůrců • 50M DAU</text>
          
          <!-- Branding -->
          <text x="${width/2}" y="1850" font-size="32" fill="#FF69B4" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">chaos.canvas</text>
          <text x="${width/2}" y="1900" font-size="24" fill="#999" text-anchor="middle" font-family="Arial, sans-serif">Přidej chaos. Vítězí tvá země.</text>
        </svg>
      `;
      
      res.type('svg').send(svg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
