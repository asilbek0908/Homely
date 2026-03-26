const express = require('express');
const router = express.Router();
const { createReview, getWorkerReviews } = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('customer'), createReview);
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
