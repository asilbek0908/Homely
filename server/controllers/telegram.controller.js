const User = require('../models/User');
const { sendWelcomeMessage } = require('../utils/telegramBot');

// @desc    Connect Telegram account
// @route   POST /api/telegram/connect
const connectTelegram = async (req, res) => {
  try {
    const { telegramChatId } = req.body;

    if (!telegramChatId) {
      return res.status(400).json({ success: false, message: 'Telegram Chat ID is required' });
    }

    await User.findByIdAndUpdate(req.user._id, { telegramChatId: String(telegramChatId) });

    // Send welcome message (non-blocking — if it fails, connection still succeeds)
    sendWelcomeMessage(telegramChatId, req.user.name).catch((err) =>
      console.error('Welcome message error:', err.message)
    );

    res.json({ success: true, message: 'Telegram connected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Disconnect Telegram account
// @route   POST /api/telegram/disconnect
const disconnectTelegram = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { telegramChatId: '' });
    res.json({ success: true, message: 'Telegram disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { connectTelegram, disconnectTelegram };
