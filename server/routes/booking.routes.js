const express = require('express');
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus,
  getBookingById,
  rescheduleBooking,
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/customer', protect, authorize('customer'), getCustomerBookings);
router.get('/worker', protect, authorize('worker'), getWorkerBookings);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/reschedule', protect, authorize('customer'), rescheduleBooking);
router.get('/:id', protect, getBookingById);

module.exports = router;
