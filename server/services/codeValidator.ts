
export class CodeValidator {
  private static maliciousPatterns = [
    /require\(['"]fs['"]\)/gi,
    /require\(['"]child_process['"]\)/gi,
    /require\(['"]os['"]\)/gi,
    /require\(['"]path['"]\)/gi,
    /require\(['"]crypto['"]\)/gi,
    /require\(['"]https?['"]\)/gi,
    /require\(['"]net['"]\)/gi,
    /\.exec\s*\(/gi,
    /\.spawn\s*\(/gi,
    /eval\s*\(/gi,
    /new\s+Function\s*\(/gi,
    /process\.exit/gi,
    /process\.kill/gi,
    /process\.env/gi,
    /fs\./gi,
    /readFileSync|writeFileSync|unlinkSync/gi,
    /\$\{.*\}/gi, // Template literals with variables
    /console\.log.*token/gi,
    /console\.log.*password/gi,
    /Math\.random.*token/gi
  ];

  private static suspiciousPatterns = [
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /localStorage/gi,
    /sessionStorage/gi,
    /document\./gi,
    /window\./gi,
    /setInterval.*\d{4,}/gi, // Long intervals
    /setTimeout.*\d{4,}/gi // Long timeouts
  ];

  static validateCode(code: string): {
    isValid: boolean;
    issues: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const issues: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // فحص الأنماط الخبيثة
    for (const pattern of this.maliciousPatterns) {
      if (pattern.test(code)) {
        issues.push(`⚠️ تم اكتشاف كود خطير: ${pattern.source}`);
        riskLevel = 'high';
      }
    }

    // فحص الأنماط المشبوهة
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(code)) {
        issues.push(`⚠️ كود مشبوه: ${pattern.source}`);
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    // فحص Discord.js patterns
    if (!code.includes('discord.js') && !code.includes('Client')) {
      issues.push('❌ هذا لا يبدو كبوت ديسكورد صحيح');
      riskLevel = 'high';
    }

    // فحص التوكن
    if (code.includes('YOUR_BOT_TOKEN') || code.includes('YOUR_BOT_TOKEN_HERE')) {
      // جيد - يستخدم placeholder
    } else if (/[A-Za-z0-9]{24}\.[A-Za-z0-9]{6}\.[A-Za-z0-9_-]{27}/.test(code)) {
      issues.push('⚠️ يحتوي على توكن صريح - يجب استخدام placeholder');
      riskLevel = 'medium';
    }

    // فحص الحجم
    if (code.length > 50000) {
      issues.push('⚠️ الكود كبير جداً');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // فحص البنية الأساسية
    if (!code.includes('client.login')) {
      issues.push('❌ مفقود: client.login()');
      riskLevel = 'high';
    }

    return {
      isValid: riskLevel !== 'high',
      issues,
      riskLevel
    };
  }

  static sanitizeCode(code: string): string {
    // إزالة التوكنات الصريحة واستبدالها بـ placeholder
    return code.replace(
      /[A-Za-z0-9]{24}\.[A-Za-z0-9]{6}\.[A-Za-z0-9_-]{27}/g,
      'YOUR_BOT_TOKEN'
    );
  }
}
