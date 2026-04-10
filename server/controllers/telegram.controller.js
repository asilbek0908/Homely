const User = require('../models/User');
const { sendWelcomeMessage } = require('../utils/telegramBot');

// POST /api/telegram/connect — saves the user's chat ID so we can DM them
const connectTelegram = async (req, res) => {
  try {
    const { telegramChatId } = req.body;

    if (!telegramChatId) {
      return res.status(400).json({ success: false, message: 'Telegram Chat ID is required' });
    }

    await User.findByIdAndUpdate(req.user._id, { telegramChatId: String(telegramChatId) });

    // welcome message is best-effort — don't fail the whole request if Telegram is down
    sendWelcomeMessage(telegramChatId, req.user.name).catch((err) =>
      console.error('Welcome message error:', err.message)
    );

    res.json({ success: true, message: 'Telegram connected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/telegram/disconnect — clears the chat ID
const disconnectTelegram = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { telegramChatId: '' });
    res.json({ success: true, message: 'Telegram disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { connectTelegram, disconnectTelegram };
