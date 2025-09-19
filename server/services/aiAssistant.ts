import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "default_key" 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  response: string;
  suggestions?: string[];
  codeSnippet?: string;
}

export class AIAssistant {
  async getCodingHelp(
    userMessage: string, 
    currentCode: string,
    chatHistory: ChatMessage[] = []
  ): Promise<AIResponse> {
    try {
      // Check if OpenAI is available
      if (!openai) {
        return this.getOfflineHelp(userMessage, currentCode);
      }

      const systemPrompt = `أنت مساعد ذكي متخصص في برمجة بوتات ديسكورد باستخدام Discord.js. 
      ساعد المستخدم في:
      - كتابة وتحسين كود البوت
      - إصلاح الأخطاء
      - إضافة ميزات جديدة
      - شرح المفاهيم البرمجية
      
      أعط إجابات واضحة ومفيدة باللغة العربية. إذا قدمت كود، تأكد أنه يعمل مع Discord.js v14.
      
      الكود الحالي:
      ${currentCode}
      
      أجب بصيغة JSON مع المفاتيح التالية:
      - response: الرد على سؤال المستخدم
      - suggestions: اقتراحات إضافية (اختياري)
      - codeSnippet: مقطع كود إذا كان مناسباً (اختياري)`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: messages as any,
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        response: result.response || "عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.",
        suggestions: result.suggestions,
        codeSnippet: result.codeSnippet
      };
    } catch (error) {
      console.error("AI Assistant error:", error);
      // Fallback to offline help if OpenAI fails
      return this.getOfflineHelp(userMessage, currentCode);
    }
  }

  private getOfflineHelp(userMessage: string, currentCode: string): AIResponse {
    const message = userMessage.toLowerCase();
    
    // Basic bot template
    if (message.includes('بوت') && message.includes('جديد')) {
      return {
        response: "إليك قالب أساسي لبوت ديسكورد:",
        codeSnippet: `const { Client, GatewayIntentBits, Events } = require('discord.js');

client.once(Events.ClientReady, (readyClient) => {
    console.log(\`البوت جاهز! تم تسجيل الدخول كـ \${readyClient.user.tag}\`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
    
    if (message.content === '!مرحبا') {
        message.reply('مرحباً بك! 👋');
    }
});`
      };
    }

    // Help with commands
    if (message.includes('أمر') || message.includes('command')) {
      return {
        response: "لإضافة أوامر جديدة، استخدم client.on لالتقاط الرسائل وتحقق من المحتوى",
        suggestions: ["أضف أوامر متقدمة", "استخدم slash commands", "أضف تحقق من الصلاحيات"],
        codeSnippet: `client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    
    const args = message.content.slice(1).split(' ');
    const command = args.shift().toLowerCase();
    
    switch(command) {
        case 'help':
            message.reply('قائمة الأوامر المتاحة...');
            break;
        case 'info':
            message.reply('معلومات عن البوت...');
            break;
    }
});`
      };
    }

    // General help
    return {
      response: "أنا هنا لمساعدتك في برمجة بوتات ديسكورد! يمكنني مساعدتك في:\n• إنشاء بوت جديد\n• إضافة أوامر\n• إصلاح الأخطاء\n• تحسين الكود\n\nما الذي تحتاج مساعدة فيه؟",
      suggestions: ["إنشاء بوت أساسي", "إضافة أوامر جديدة", "مراجعة الكود الحالي"]
    };
  }

  async generateBotCode(description: string): Promise<string> {
    try {
      // Check if OpenAI is available
      if (!openai) {
        return this.getOfflineTemplate(description);
      }

      const prompt = `اكتب كود بوت ديسكورد كامل بناءً على هذا الوصف: ${description}
      
      استخدم Discord.js v14 وتأكد من:
      - استخدام الـ Intents المناسبة
      - معالجة الأحداث بشكل صحيح
      - إضافة تعليقات توضيحية
      - اتباع أفضل الممارسات
      
      أرجع الكود فقط بدون شرح إضافي.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Code generation error:", error);
      return this.getOfflineTemplate(description);
    }
  }

  private getOfflineTemplate(description: string): string {
    return `const { Client, GatewayIntentBits, Events } = require('discord.js');

// ${description}

client.once(Events.ClientReady, (readyClient) => {
    console.log(\`البوت جاهز! تم تسجيل الدخول كـ \${readyClient.user.tag}\`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    
    // أوامر أساسية
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
    
    if (message.content === '!help') {
        message.reply('مرحباً! أنا بوت ديسكورد. استخدم !ping للاختبار');
    }
    
    if (message.content === '!مرحبا') {
        message.reply('مرحباً بك! 👋 كيف يمكنني مساعدتك؟');
    }
});

// إضافة المزيد من الأوامر والميزات هنا حسب الحاجة`;
  }

  async reviewCode(code: string): Promise<AIResponse> {
    try {
      // Check if OpenAI is available
      if (!openai) {
        return this.getOfflineCodeReview(code);
      }

      const prompt = `راجع هذا الكود لبوت ديسكورد وقدم تحليلاً شاملاً:

${code}

قم بتحليل:
- الأخطاء المحتملة
- تحسينات الأداء
- أفضل الممارسات
- مشاكل الأمان

أجب بصيغة JSON مع المفاتيح:
- response: تحليل شامل للكود
- suggestions: اقتراحات للتحسين
- codeSnippet: كود محسن إذا كان مناسباً`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.4,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        response: result.response || "لم أتمكن من مراجعة الكود",
        suggestions: result.suggestions,
        codeSnippet: result.codeSnippet
      };
    } catch (error) {
      console.error("Code review error:", error);
      return this.getOfflineCodeReview(code);
    }
  }

  private getOfflineCodeReview(code: string): AIResponse {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic code analysis
    if (!code.includes('Events.ClientReady')) {
      issues.push("لا يوجد event handler لـ ClientReady");
    }
    if (!code.includes('Events.MessageCreate')) {
      issues.push("لا يوجد event handler للرسائل");
    }
    if (!code.includes('message.author.bot')) {
      suggestions.push("أضف فحص لتجاهل رسائل البوتات الأخرى");
    }

    let response = "مراجعة سريعة للكود:\n\n";
    if (issues.length > 0) {
      response += "⚠️ مشاكل محتملة:\n" + issues.map(issue => `• ${issue}`).join('\n') + "\n\n";
    }
    response += "✅ الكود يبدو أساسياً وجيداً لبداية بوت ديسكورد";

    return {
      response,
      suggestions: suggestions.length > 0 ? suggestions : ["أضف المزيد من الأوامر", "حسن معالجة الأخطاء", "أضف تسجيل الأحداث"]
    };
  }
}

export const aiAssistant = new AIAssistant();
