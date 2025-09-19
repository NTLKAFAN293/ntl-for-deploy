import { type User, type InsertUser, type Bot, type InsertBot, type BotFile, type InsertBotFile, type BotLog, type InsertBotLog } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";

// Storage interface for Discord bot management
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bot operations
  createBot(bot: InsertBot): Promise<Bot>;
  getBot(id: string): Promise<Bot | undefined>;
  getAllBots(): Promise<Bot[]>;
  updateBot(id: string, updates: Partial<Pick<Bot, 'name' | 'config'>>): Promise<Bot | undefined>;
  updateBotStatus(id: string, isOnline: boolean): Promise<Bot | undefined>;
  updateBotToken(id: string, token: string): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<boolean>;

  // Bot file operations
  createBotFile(file: InsertBotFile): Promise<BotFile>;
  getBotFile(id: string): Promise<BotFile | undefined>;
  getBotFiles(botId: string): Promise<BotFile[]>;
  updateBotFile(id: string, updates: Partial<BotFile>): Promise<BotFile | undefined>;
  deleteBotFile(id: string): Promise<boolean>;

  // Bot logs operations
  createBotLog(log: InsertBotLog): Promise<BotLog>;
  getBotLogs(botId: string, limit?: number): Promise<BotLog[]>;
  clearBotLogs(botId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bots: Map<string, Bot>;
  private botFiles: Map<string, BotFile>;
  private botLogs: Map<string, BotLog>;
  private botProcesses: Map<string, any>;
  private dataDir: string;
  private dataFile: string;

  constructor() {
    this.users = new Map();
    this.bots = new Map();
    this.botFiles = new Map();
    this.botLogs = new Map();
    this.botProcesses = new Map();
    
    // Create data directory if it doesn't exist
    this.dataDir = join(process.cwd(), 'data');
    this.dataFile = join(this.dataDir, 'storage.json');
    
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Load existing data
    this.loadData();
  }

  private loadData(): void {
    try {
      if (existsSync(this.dataFile)) {
        const data = JSON.parse(readFileSync(this.dataFile, 'utf8'));
        
        // Load users
        if (data.users) {
          this.users = new Map(data.users.map((user: User) => [user.id, user]));
        }
        
        // Load bots
        if (data.bots) {
          this.bots = new Map(data.bots.map((bot: Bot) => [bot.id, {
            ...bot,
            createdAt: new Date(bot.createdAt),
            startedAt: bot.startedAt ? new Date(bot.startedAt) : null
          }]));
        }
        
        // Load files
        if (data.botFiles) {
          this.botFiles = new Map(data.botFiles.map((file: BotFile) => [file.id, {
            ...file,
            lastModified: new Date(file.lastModified)
          }]));
        }
        
        // Load logs
        if (data.botLogs) {
          this.botLogs = new Map(data.botLogs.map((log: BotLog) => [log.id, {
            ...log,
            timestamp: new Date(log.timestamp)
          }]));
        }
        
        console.log('تم تحميل البيانات من الملف بنجاح');
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        users: Array.from(this.users.values()),
        bots: Array.from(this.bots.values()),
        botFiles: Array.from(this.botFiles.values()),
        botLogs: Array.from(this.botLogs.values())
      };
      
      writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password
    };
    this.users.set(id, user);
    this.saveData();
    return user;
  }

  // Bot operations
  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = randomUUID();
    const bot: Bot = { 
      id,
      name: insertBot.name,
      token: insertBot.token,
      isOnline: insertBot.isOnline ?? false,
      isActive: insertBot.isActive ?? false,
      startedAt: new Date(),
      files: insertBot.files ?? {},
      config: insertBot.config ?? {},
      createdAt: new Date()
    };
    this.bots.set(id, bot);
    this.saveData();
    return bot;
  }

  async getBot(id: string): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async getAllBots(): Promise<Bot[]> {
    return Array.from(this.bots.values());
  }

  async updateBot(id: string, updates: Partial<Pick<Bot, 'name' | 'config'>>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;

    const updatedBot = { ...bot, ...updates };
    this.bots.set(id, updatedBot);
    this.saveData();
    return updatedBot;
  }

  async updateBotStatus(id: string, isOnline: boolean): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;

    if (isOnline) {
      // Start bot process
      try {
        await this.startBotProcess(id, bot);
      } catch (error) {
        await this.createBotLog({
          botId: id,
          level: "error",
          message: `Failed to start bot: ${error.message}`
        });
        throw error;
      }
    } else {
      // Stop bot process
      await this.stopBotProcess(id);
    }

    const updatedBot = { 
      ...bot, 
      isOnline, 
      startedAt: isOnline ? new Date() : null 
    };
    this.bots.set(id, updatedBot);
    this.saveData();
    return updatedBot;
  }

  private async startBotProcess(botId: string, bot: Bot): Promise<void> {
    const { spawn } = await import('child_process');
    const path = await import('path');
    const fs = await import('fs/promises');

    // Get main bot file (index.js)
    const botFiles = await this.getBotFiles(botId);
    const mainFile = botFiles.find(f => f.name === 'index.js');

    if (!mainFile) {
      throw new Error('No index.js file found for bot');
    }

    if (!mainFile.content || mainFile.content.trim() === '') {
      throw new Error('index.js file is empty - please add bot code first');
    }

    if (!bot.token) {
      throw new Error('Bot token is required');
    }

    // Create temporary directory for bot
    const botDir = path.join(process.cwd(), 'temp_bots', botId);
    await fs.mkdir(botDir, { recursive: true });

    // Write bot files to temporary directory
    for (const file of botFiles) {
      await fs.writeFile(path.join(botDir, file.name), file.content);
    }

    // Create package.json
    const packageJsonPath = path.join(botDir, 'package.json');
    await fs.writeFile(packageJsonPath, JSON.stringify({
      name: `bot-${botId}`,
      version: "1.0.0",
      main: "index.js",
      type: "commonjs",
      dependencies: {
        "discord.js": "^14.14.1"
      }
    }, null, 2));

    // Install dependencies
    const npm = spawn('npm', ['install'], { 
      cwd: botDir,
      stdio: 'pipe',
      env: { ...process.env, BOT_TOKEN: bot.token }
    });

    await new Promise((resolve, reject) => {
      npm.on('close', (code) => {
        if (code === 0) resolve(code);
        else reject(new Error(`npm install failed with code ${code}`));
      });
    });

    // Start bot process
    const botProcess = spawn('node', ['index.js'], {
      cwd: botDir,
      stdio: 'pipe',
      env: { ...process.env, BOT_TOKEN: bot.token }
    });

    // Handle bot output
    botProcess.stdout.on('data', (data) => {
      this.createBotLog({
        botId,
        level: "info",
        message: data.toString().trim()
      });
    });

    botProcess.stderr.on('data', (data) => {
      this.createBotLog({
        botId,
        level: "error",
        message: data.toString().trim()
      });
    });

    botProcess.on('close', async (code) => {
      this.botProcesses.delete(botId);
      await this.createBotLog({
        botId,
        level: "warn",
        message: `Bot process exited with code ${code}`
      });

      // Update bot status to offline
      const bot = this.bots.get(botId);
      if (bot) {
        const updatedBot = { ...bot, isOnline: false, startedAt: null };
        this.bots.set(botId, updatedBot);
      }
    });

    this.botProcesses.set(botId, botProcess);

    await this.createBotLog({
      botId,
      level: "info",
      message: "Bot process started successfully"
    });
  }

  private async stopBotProcess(botId: string): Promise<void> {
    const process = this.botProcesses.get(botId);
    if (process) {
      process.kill();
      this.botProcesses.delete(botId);

      await this.createBotLog({
        botId,
        level: "info",
        message: "Bot process stopped"
      });
    }
  }

  async updateBotToken(id: string, token: string): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;

    const updatedBot = { ...bot, token };
    this.bots.set(id, updatedBot);
    this.saveData();
    return updatedBot;
  }

  async deleteBot(id: string): Promise<boolean> {
    const deleted = this.bots.delete(id);
    // Also delete related files and logs
    if (deleted) {
      Array.from(this.botFiles.entries()).forEach(([fileId, file]) => {
        if (file.botId === id) {
          this.botFiles.delete(fileId);
        }
      });
      Array.from(this.botLogs.entries()).forEach(([logId, log]) => {
        if (log.botId === id) {
          this.botLogs.delete(logId);
        }
      });
      this.saveData();
    }
    return deleted;
  }

  // Bot file operations
  async createBotFile(insertBotFile: InsertBotFile): Promise<BotFile> {
    // Check if bot exists
    const bot = await this.getBot(insertBotFile.botId);
    if (!bot) {
      throw new Error('Bot not found');
    }

    const id = randomUUID();
    const botFile: BotFile = { 
      id,
      botId: insertBotFile.botId,
      name: insertBotFile.name,
      content: insertBotFile.content ?? '',
      language: insertBotFile.language ?? 'javascript',
      isDirty: insertBotFile.isDirty ?? false,
      size: insertBotFile.size ?? null,
      lastModified: new Date() 
    };
    this.botFiles.set(id, botFile);
    this.saveData();
    return botFile;
  }

  async getBotFile(id: string): Promise<BotFile | undefined> {
    return this.botFiles.get(id);
  }

  async getBotFiles(botId: string): Promise<BotFile[]> {
    return Array.from(this.botFiles.values()).filter(file => file.botId === botId);
  }

  async updateBotFile(id: string, updates: Partial<BotFile>): Promise<BotFile | undefined> {
    const file = this.botFiles.get(id);
    if (!file) return undefined;

    const updatedFile = { 
      ...file, 
      ...updates, 
      lastModified: new Date() 
    };
    this.botFiles.set(id, updatedFile);
    this.saveData();
    return updatedFile;
  }

  async deleteBotFile(id: string): Promise<boolean> {
    const deleted = this.botFiles.delete(id);
    if (deleted) {
      this.saveData();
    }
    return deleted;
  }

  // Bot logs operations
  async createBotLog(insertBotLog: InsertBotLog): Promise<BotLog> {
    // Check if bot exists
    const bot = await this.getBot(insertBotLog.botId);
    if (!bot) {
      throw new Error('Bot not found');
    }

    const id = randomUUID();
    const botLog: BotLog = { 
      id,
      botId: insertBotLog.botId,
      level: insertBotLog.level,
      message: insertBotLog.message,
      timestamp: new Date() 
    };
    this.botLogs.set(id, botLog);
    this.saveData();
    return botLog;
  }

  async getBotLogs(botId: string, limit: number = 100): Promise<BotLog[]> {
    return Array.from(this.botLogs.values())
      .filter(log => log.botId === botId)
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime() ?? 0;
        const timeB = b.timestamp?.getTime() ?? 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  async clearBotLogs(botId: string): Promise<boolean> {
    const logsToDelete = Array.from(this.botLogs.entries())
      .filter(([_, log]) => log.botId === botId);

    logsToDelete.forEach(([logId]) => {
      this.botLogs.delete(logId);
    });

    if (logsToDelete.length > 0) {
      this.saveData();
    }

    return true;
  }
}

export const storage = new MemStorage();

// Initialize with sample data (development only)
async function initializeSampleData() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Create a sample bot
  const sampleBot = await storage.createBot({
    name: "البوت الرئيسي",
    token: "أدخل_توكن_البوت_هنا",
    isOnline: false,
    config: {
      prefix: "!",
      description: "بوت ديسكورد للإدارة العامة",
      permissions: ["SEND_MESSAGES", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"]
    }
  });

  // Create sample files for the bot
  await storage.createBotFile({
    botId: sampleBot.id,
    name: "index.js",
    content: `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(\`تم تسجيل الدخول باسم \${client.user.tag}!\`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }

  if (message.content === '!help') {
    message.reply('قائمة الأوامر المتاحة: !ping, !help');
  }
});

client.login(process.env.BOT_TOKEN);`,
    language: "javascript",
    size: "1.2 KB"
  });

  await storage.createBotFile({
    botId: sampleBot.id,
    name: "config.json",
    content: `{
  "prefix": "!",
  "description": "بوت ديسكورد للإدارة العامة",
  "version": "1.0.0",
  "permissions": [
    "SEND_MESSAGES",
    "READ_MESSAGE_HISTORY",
    "MANAGE_MESSAGES"
  ],
  "features": {
    "moderation": true,
    "music": false,
    "games": true
  }
}`,
    language: "json",
    size: "356 B"
  });

  // Create sample logs
  await storage.createBotLog({
    botId: sampleBot.id,
    level: "info",
    message: "Bot initialized successfully"
  });

  console.log('تم تهيئة البيانات التجريبية');
}

// Initialize sample data on startup
initializeSampleData().catch(console.error);

// Ensure sample bot has required files
async function ensureSampleBotFiles() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const bots = await storage.getAllBots();
  for (const bot of bots) {
    const files = await storage.getBotFiles(bot.id);
    const hasIndexJs = files.some(f => f.name === 'index.js' && f.content && f.content.trim() !== '');
    
    if (!hasIndexJs) {
      // Create or update index.js with default content
      const existingIndexJs = files.find(f => f.name === 'index.js');
      const defaultContent = `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(\`تم تسجيل الدخول باسم \${client.user.tag}!\`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }

  if (message.content === '!help') {
    message.reply('قائمة الأوامر المتاحة: !ping, !help');
  }
});

client.login(process.env.BOT_TOKEN);`;

      if (existingIndexJs) {
        await storage.updateBotFile(existingIndexJs.id, { content: defaultContent });
      } else {
        await storage.createBotFile({
          botId: bot.id,
          name: "index.js",
          content: defaultContent,
          language: "javascript"
        });
      }
    }
  }
}

// Run this check periodically to ensure files exist
setInterval(ensureSampleBotFiles, 30000); // Check every 30 seconds