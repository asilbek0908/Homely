const Worker = require('../models/Worker');
const { getTopMatches } = require('../utils/aiMatching');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Homely Assistant — a helpful AI for the Homely platform, a home services marketplace in Tashkent, Uzbekistan.

About Homely:
- Customers can book verified workers for home services: plumbing, electrical, AC repair, cleaning, painting, carpentry, welding, appliance repair, moving, gardening
- Workers register, upload ID documents, get verified by admin, then accept bookings
- Booking flow: Customer finds worker → books → worker confirms → worker starts → worker completes → customer pays and reviews
- Payment: Cash only for now (pay after job). Click.uz and Payme coming soon.
- Plans: Workers have Free (3 jobs/month), Pro (99,000 UZS), Premium (199,000 UZS) plans
- All prices are estimates — final price is agreed on-site
- Platform is available in Uzbek, Russian, and English

Your job:
- Help customers find the right service and book workers
- Guide workers on how to use the platform, improve profile, get more bookings
- Answer questions about pricing, verification, payments, bookings
- Be friendly, concise, and always suggest a next action

At the end of responses, when relevant suggest one of these actions with this exact format:
[ACTION:book] - to go book a worker
[ACTION:workers] - to browse workers
[ACTION:dashboard] - to go to dashboard
[ACTION:telegram] - to connect Telegram notifications

CRITICAL LANGUAGE RULE: You MUST detect the language of the user's message and reply in EXACTLY that language.
- If the user writes in English → reply in English only
- If the user writes in Russian → reply in Russian only
- If the user writes in Uzbek → reply in Uzbek only
- NEVER switch languages. NEVER default to Uzbek.

Keep responses short — 2-4 sentences max unless explaining a process.`;

// @desc    Get AI-matched workers for a customer
// @route   GET /api/ai/match
const getAIMatches = async (req, res) => {
  try {
    const { serviceType, district } = req.query;

    if (!serviceType) {
      return res.status(400).json({ success: false, message: 'serviceType is required' });
    }

    const workers = await Worker.find({ isVerified: true })
      .populate('user', 'name email phone avatar');

    if (workers.length === 0) {
      return res.json({ success: true, matches: [] });
    }

    const matches = getTopMatches(workers, { serviceType, district: district || '' });

    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Detect language from text
const detectLang = (text) => {
  const uzbekChars = /[ʻʼ]|(siz|men|uy|xizmat|kerak|yordam|qanday|usta)/i;
  const russianChars = /[а-яёА-ЯЁ]/;
  if (russianChars.test(text)) return { code: 'ru', label: 'Russian' };
  if (uzbekChars.test(text)) return { code: 'uz', label: 'Uzbek' };
  return { code: 'en', label: 'English' };
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const lang = detectLang(message);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: `[You MUST reply in ${lang.label} only] ${message}` },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'AI assistant unavailable.' });
  }
};

module.exports = { getAIMatches, chatWithAI };
