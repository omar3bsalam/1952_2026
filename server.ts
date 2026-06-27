import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini API Client lazily and safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is not set correctly in your environment.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// API: Strategic Advisor & Decision feedback using Gemini API
app.post('/api/decision-feedback', async (req, res) => {
  try {
    const { scenarioId, scenarioTitle, choiceId, choiceText, customAction, historicalContext } = req.body;
    
    if (!scenarioId || !scenarioTitle) {
      return res.status(400).json({ error: 'Missing parameters: scenarioId or scenarioTitle is required.' });
    }

    const client = getGeminiClient();
    
    const prompt = `
أنت مستشار عسكري واستراتيجي ومؤرخ خبير في تاريخ مصر والشرق الأوسط الحديث والعلوم السياسية.
لقد تم وضع المستخدم في سيناريو تاريخي حرج ضمن تطبيق "مصر: صراع البقاء وصناعة القرار (1952-2025)".

الحدث التاريخي: "${scenarioTitle}"
السياق التاريخي الفعلي: "${historicalContext || ''}"

قرار أو اختيار المستخدم:
${choiceId === 'custom' ? `لقد اختار المستخدم اتخاذ إجراء مخصص ومكتوب يدوياً: "${customAction}"` : `لقد اختار المستخدم الخيار التالي: "${choiceText}"`}

المطلوب منك هو كتابة تحليل استراتيجي وتاريخي دقيق وعميق ومقنع باللغة العربية الفصحى الرصينة والراقية.
يجب أن يتضمن التحليل الأقسام التالية مع تنسيق Markdown أنيق ومريح للقراءة:

1. **التقييم الاستراتيجي الفوري**: تحليل عسكري وسياسي للقرار المختار. هل كان واقعياً؟ ما هي نقاط القوة والضعف فيه؟
2. **السيناريو البديل (ماذا لو - What If)**: ما هي التداعيات الجيوسياسية والداخلية المحتملة لهذا القرار لو تم اتخاذه فعلاً في ذلك الوقت؟ (كن مبدعاً ولكن واقعياً وملتزماً بالمنطق التاريخي وموازين القوى السائدة حينها).
3. **المقارنة التاريخية الفضلية**: كيف يقارن هذا القرار بالقرار الفعلي الذي اتخذته القيادة المصرية التاريخية في الواقع؟ اذكر ما حدث في الواقع باختصار وقارن النتائج.
4. **نصيحة الخبير الاستراتيجي**: نصيحة أو حكمة عامة مستخلصة من هذا الموقف لصناع القرار في العصر الحديث.

اجعل الأسلوب فخماً وجاداً ومفعماً بالحس الاستراتيجي والوطني، بعيداً عن الابتذال أو التبسيط السطحي. اكتب التحليل بطريقة تلائم الباحثين والمحللين الاستراتيجيين.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      feedback: response.text,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء الاتصال بالمستشار الاستراتيجي الذكي.',
      details: error.message 
    });
  }
});

// Serve Frontend App
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

if (!isProd) {
  // Integrate Vite Dev Server middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  
  app.use(vite.middlewares);
  
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Serve static files in production
  app.use(express.static(path.resolve(__dirname, 'client')));
  
  app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
});
