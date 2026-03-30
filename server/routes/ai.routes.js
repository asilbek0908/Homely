const express = require('express');
const router = express.Router();
const { getAIMatches } = require('../controllers/ai.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/match', protect, authorize('customer'), getAIMatches);

module.exports = router;
