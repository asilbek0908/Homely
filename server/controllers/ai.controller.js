const Worker = require('../models/Worker');
const { getTopMatches } = require('../utils/aiMatching');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

Respond in the same language the user writes in (Uzbek, Russian, or English).
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

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert history to Gemini format
    const geminiHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ success: false, message: 'AI assistant unavailable. Please try again.' });
  }
};

module.exports = { getAIMatches, chatWithAI };
