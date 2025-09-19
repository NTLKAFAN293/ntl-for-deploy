import { Client, GatewayIntentBits } from "discord.js";
import { Bot } from "@shared/schema";
import { storage } from "../storage";

class BotManager {
  private activeBots: Map<string, Client> = new Map();

  async startBot(botId: string): Promise<boolean> {
    try {
      console.log(`🚀 محاولة تشغيل البوت ${botId}...`);
      
      const bot = await storage.getBot(botId);
      if (!bot) {
        console.error(`❌ البوت ${botId} غير موجود`);
        throw new Error("Bot not found");
      }

      console.log(`📋 تم العثور على البوت: ${bot.name}`);

      if (this.activeBots.has(botId)) {
        console.log(`🔄 البوت ${botId} يعمل بالفعل، جاري إعادة التشغيل...`);
        await this.stopBot(botId);
      }

      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Get the main file (index.js or first file)
      const files = bot.files as Record<string, string>;
      let mainFile = files["index.js"] || files[Object.keys(files)[0]] || "";

      console.log(`📁 تم تحميل الملف الرئيسي (${Object.keys(files)[0] || 'index.js'})`);
      console.log(`🔑 استبدال التوكن في الكود...`);

      // Replace token placeholder with actual token
      mainFile = mainFile.replace(/YOUR_BOT_TOKEN_HERE|YOUR_BOT_TOKEN/g, `'${bot.token}'`);

      // Create a comprehensive module environment for the bot
      const discordjs = await import('discord.js');

      // Create a proper require function that works in ES modules
      const Module = await import('node:module');
      const require = (Module as any).createRequire(import.meta.url);

      // Enhanced console for bot debugging
      const botConsole = {
        log: (...args: any[]) => {
          console.log(`[البوت ${bot.name}]:`, ...args);
        },
        error: (...args: any[]) => {
          console.error(`[البوت ${bot.name} - خطأ]:`, ...args);
        },
        warn: (...args: any[]) => {
          console.warn(`[البوت ${bot.name} - تحذير]:`, ...args);
        },
        info: (...args: any[]) => {
          console.info(`[البوت ${bot.name} - معلومات]:`, ...args);
        }
      };

      const moduleEnv = {
        require: (module: string) => {
          console.log(`📦 تحميل المكتبة: ${module}`);
          if (module === 'discord.js') {
            return discordjs;
          }
          throw new Error(`Module ${module} not available`);
        },
        console: botConsole,
        module: { exports: {} },
        exports: {},
        global: globalThis,
        process: process,
        __dirname: process.cwd(),
        __filename: 'bot.js'
      };

      console.log(`⚡ تنفيذ كود البوت...`);

      // Execute the bot code with proper module context
      const botFunction = new Function(...Object.keys(moduleEnv), `
        try {
          console.log('🔥 بدء تنفيذ كود البوت...');
          ${mainFile}
          console.log('✅ تم تنفيذ كود البوت بنجاح');
          if (typeof client !== 'undefined') {
            console.log('🤖 تم العثور على client في الكود');
            return { client: client };
          } else {
            console.log('⚠️ لم يتم العثور على client في الكود، سيتم استخدام client افتراضي');
          }
        } catch (error) {
          console.error('💥 خطأ في تنفيذ كود البوت:', error);
          throw error;
        }
      `);

      const result = botFunction(...Object.values(moduleEnv));

      // If the bot code exports a client, use it; otherwise use our client
      const botClient = result?.client || client;

      console.log(`🔐 محاولة تسجيل الدخول إلى ديسكورد...`);

      // Make sure to login the bot with the token
      await botClient.login(bot.token);

      console.log(`✅ تم تسجيل الدخول بنجاح للبوت ${bot.name}`);

      this.activeBots.set(botId, botClient);

      await storage.updateBot(botId, { 
        name: bot.name, 
        config: { ...bot.config }
      });
      await storage.updateBotStatus(botId, true);
      
      console.log(`🎉 تم تشغيل البوت ${bot.name} بنجاح!`);
      return true;
    } catch (error) {
      console.error(`❌ فشل في تشغيل البوت ${botId}:`, error);
      return false;
    }
  }

  async stopBot(botId: string): Promise<boolean> {
    try {
      console.log(`🛑 محاولة إيقاف البوت ${botId}...`);
      
      const client = this.activeBots.get(botId);
      if (client) {
        console.log(`🔌 إنهاء اتصال البوت...`);
        await client.destroy();
        this.activeBots.delete(botId);
        console.log(`✅ تم إنهاء اتصال البوت بنجاح`);
      } else {
        console.log(`⚠️ البوت ${botId} غير نشط أصلاً`);
      }

      await storage.updateBotStatus(botId, false);
      console.log(`💾 تم تحديث حالة البوت في قاعدة البيانات`);
      
      return true;
    } catch (error) {
      console.error(`❌ فشل في إيقاف البوت ${botId}:`, error);
      return false;
    }
  }

  async restartBot(botId: string): Promise<boolean> {
    await this.stopBot(botId);
    return await this.startBot(botId);
  }

  getBotStatus(botId: string): boolean {
    return this.activeBots.has(botId);
  }

  async stopAllBots(): Promise<void> {
    const promises = Array.from(this.activeBots.keys()).map(botId => this.stopBot(botId));
    await Promise.all(promises);
  }
}

export const botManager = new BotManager();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down bots...');
  await botManager.stopAllBots();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down bots...');
  await botManager.stopAllBots();
  process.exit(0);
});