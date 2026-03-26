const express = require('express');
const router = express.Router();
const { connectTelegram, disconnectTelegram } = require('../controllers/telegram.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/connect', protect, connectTelegram);
router.post('/disconnect', protect, disconnectTelegram);

module.exports = router;
