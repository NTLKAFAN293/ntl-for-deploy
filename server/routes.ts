import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import { insertBotSchema, insertBotFileSchema, type BotPublic } from "@shared/schema";
import { z } from "zod";

// Helper function to mask bot token
function maskBotToken(bot: any): BotPublic {
  return {
    ...bot,
    tokenMasked: bot.token ? bot.token.slice(0, 8) + '...' + bot.token.slice(-4) : '****',
    token: undefined
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot management routes
  
  // Get all bots
  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getAllBots();
      const publicBots = bots.map(maskBotToken);
      res.json(publicBots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  // Get specific bot
  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(maskBotToken(bot));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot" });
    }
  });

  // Create new bot
  app.post("/api/bots", async (req, res) => {
    try {
      const validated = insertBotSchema.parse(req.body);
      const bot = await storage.createBot(validated);
      res.status(201).json(maskBotToken(bot));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create bot" });
    }
  });

  // Update bot (name and config only)
  app.patch("/api/bots/:id", async (req, res) => {
    try {
      const { name, config } = req.body;
      const updates: any = {};
      if (name) updates.name = name;
      if (config) updates.config = config;
      
      const bot = await storage.updateBot(req.params.id, updates);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(maskBotToken(bot));
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  // Update bot token
  app.patch("/api/bots/:id/token", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      const bot = await storage.updateBotToken(req.params.id, token);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(maskBotToken(bot));
    } catch (error) {
      res.status(500).json({ error: "Failed to update token" });
    }
  });

  // Start bot
  app.post("/api/bots/:id/start", async (req, res) => {
    try {
      const bot = await storage.updateBotStatus(req.params.id, true);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      // Log bot start
      await storage.createBotLog({
        botId: req.params.id,
        level: "info",
        message: "Bot started successfully"
      });

      // Emit socket event for real-time updates
      req.app.get('socketio')?.emit('botStatusChanged', {
        botId: req.params.id,
        isOnline: true,
        timestamp: new Date()
      });

      res.json(maskBotToken(bot));
    } catch (error) {
      console.error('Error starting bot:', error);
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  // Stop bot
  app.post("/api/bots/:id/stop", async (req, res) => {
    try {
      const bot = await storage.updateBotStatus(req.params.id, false);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      // Log bot stop
      await storage.createBotLog({
        botId: req.params.id,
        level: "info",
        message: "Bot stopped successfully"
      });

      // Emit socket event for real-time updates
      req.app.get('socketio')?.emit('botStatusChanged', {
        botId: req.params.id,
        isOnline: false,
        timestamp: new Date()
      });

      res.json(maskBotToken(bot));
    } catch (error) {
      console.error('Error stopping bot:', error);
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  // Delete bot
  app.delete("/api/bots/:id", async (req, res) => {
    try {
      const success = await storage.deleteBot(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });

  // Bot files routes
  
  // Get bot files
  app.get("/api/bots/:botId/files", async (req, res) => {
    try {
      const files = await storage.getBotFiles(req.params.botId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Create bot file
  app.post("/api/bots/:botId/files", async (req, res) => {
    try {
      console.log('Creating file for bot:', req.params.botId, 'with data:', req.body);
      
      const validated = insertBotFileSchema.parse({
        ...req.body,
        botId: req.params.botId,
        content: req.body.content || '',
        language: req.body.language || 'javascript'
      });
      
      const file = await storage.createBotFile(validated);
      console.log('File created successfully:', file);
      res.status(201).json(file);
    } catch (error) {
      console.error('Error creating file:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      if (error instanceof Error && error.message === 'Bot not found') {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  // Update bot file
  app.patch("/api/files/:id", async (req, res) => {
    try {
      console.log('Updating file:', req.params.id, 'with data:', req.body);
      
      const { content, isDirty } = req.body;
      const updates: any = {};
      if (content !== undefined) updates.content = content;
      if (isDirty !== undefined) updates.isDirty = isDirty;
      
      const file = await storage.updateBotFile(req.params.id, updates);
      if (!file) {
        console.log('File not found:', req.params.id);
        return res.status(404).json({ error: "File not found" });
      }
      
      console.log('File updated successfully:', file);
      res.json(file);
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Delete bot file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const success = await storage.deleteBotFile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Bot logs routes
  
  // Get bot logs
  app.get("/api/bots/:botId/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getBotLogs(req.params.botId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Clear bot logs
  app.delete("/api/bots/:botId/logs", async (req, res) => {
    try {
      await storage.clearBotLogs(req.params.botId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up Socket.IO for real-time updates
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store io instance for use in routes
  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return httpServer;
}
