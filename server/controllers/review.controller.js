const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

// @desc    Create a review
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      worker: booking.worker,
      rating,
      comment,
    });

    // Update worker rating average
    const allReviews = await Review.find({ worker: booking.worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Worker.findByIdAndUpdate(booking.worker, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReview, getWorkerReviews };
