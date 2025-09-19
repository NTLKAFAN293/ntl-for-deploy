# تعليمات النشر على Render

## الخطوات المطلوبة:

### 1. رفع المشروع إلى GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Data Analysis Tool"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. النشر على Render:
1. اذهب إلى [render.com](https://render.com)
2. أنشئ حساب جديد أو سجل دخول
3. اضغط على "New Web Service"
4. اربط حساب GitHub الخاص بك
5. اختر المستودع (repository) الخاص بك
6. Render سيتعرف تلقائياً على ملف `render.yaml`

### 3. متغيرات البيئة المطلوبة:
في لوحة تحكم Render، أضف المتغيرات التالية:

- `OPENAI_API_KEY`: مفتاح OpenAI API (إذا كنت تريد استخدام المساعد الذكي)
- `DATABASE_URL`: رابط قاعدة البيانات (سيتم إعداده تلقائياً)

### 4. معلومات مهمة:
- المشروع مُعد للعمل على المنفذ الافتراضي لـ Render
- البناء يتم تلقائياً باستخدام الملفات المُعدة
- النشر مجاني على الخطة المجانية

### 5. إصلاح المشاكل الشائعة:
إذا فشل النشر:
- تأكد من وجود جميع الملفات المطلوبة
- تحقق من أن جميع التبعيات موجودة في package.json
- راجع سجلات البناء في لوحة تحكم Render