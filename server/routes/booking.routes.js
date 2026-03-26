const express = require('express');
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus,
  getBookingById,
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/customer', protect, authorize('customer'), getCustomerBookings);
router.get('/worker', protect, authorize('worker'), getWorkerBookings);
router.put('/:id/status', protect, updateBookingStatus);
router.get('/:id', protect, getBookingById);

module.exports = router;
