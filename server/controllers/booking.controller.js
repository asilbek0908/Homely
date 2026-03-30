const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const User = require('../models/User');
const {
  sendNewBookingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
} = require('../utils/telegramBot');

// @desc    Create a booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { worker, service, description, scheduledDate, scheduledTime, address, district, price } = req.body;
    const commission = price ? price * 0.1 : 0;

    const booking = await Booking.create({
      customer: req.user._id,
      worker,
      service,
      description,
      scheduledDate,
      scheduledTime,
      address,
      district,
      price: price || 0,
      commission,
    });

    // Send Telegram notification to worker (non-blocking)
    let workerUserId;
    try {
      const workerDoc = await Worker.findById(worker).populate('user', 'name phone telegramChatId');
      workerUserId = workerDoc?.user?._id?.toString();
      if (workerDoc?.user?.telegramChatId) {
        sendNewBookingNotification(booking, workerDoc.user, req.user);
      }
    } catch (tgErr) {
      console.error('Telegram notify error:', tgErr.message);
    }

    // Real-time notification via Socket.IO
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (io && userSockets && workerUserId) {
      const socketId = userSockets.get(workerUserId);
      if (socketId) {
        io.to(socketId).emit('notification', { type: 'new_booking', booking });
      }
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/customer
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone avatar' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get worker bookings
// @route   GET /api/bookings/worker
const getWorkerBookings = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const bookings = await Booking.find({ worker: worker._id })
      .populate('customer', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Customer can only cancel pending or confirmed bookings
    if (req.user.role === 'customer') {
      if (status !== 'cancelled' || !['pending', 'confirmed'].includes(booking.status)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
    }

    booking.status = status;
    await booking.save();

    // Update worker totalJobs when completed
    if (status === 'completed') {
      await Worker.findByIdAndUpdate(booking.worker, { $inc: { totalJobs: 1 } });
    }

    // Send Telegram notifications (non-blocking)
    try {
      if (status === 'confirmed') {
        // Notify customer that worker confirmed
        const customer = await User.findById(booking.customer).select('name phone telegramChatId');
        const workerDoc = await Worker.findById(booking.worker).populate('user', 'name phone');
        if (customer?.telegramChatId) {
          sendBookingConfirmedNotification(booking, workerDoc?.user, customer);
        }
      } else if (status === 'cancelled') {
        // Notify the other party about cancellation
        const cancelledBy = req.user.role;
        if (cancelledBy === 'customer') {
          // Notify worker
          const workerDoc = await Worker.findById(booking.worker).populate('user', 'name telegramChatId');
          if (workerDoc?.user?.telegramChatId) {
            sendBookingCancelledNotification(booking, workerDoc.user, 'customer');
          }
        } else {
          // Notify customer
          const customer = await User.findById(booking.customer).select('name telegramChatId');
          if (customer?.telegramChatId) {
            sendBookingCancelledNotification(booking, customer, 'worker');
          }
        }
      }
    } catch (tgErr) {
      console.error('Telegram notify error:', tgErr.message);
    }

    // Real-time notification via Socket.IO
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (io && userSockets) {
      const customerId = booking.customer?.toString();
      const workerDoc = await Worker.findById(booking.worker).select('user');
      const workerUserId = workerDoc?.user?.toString();
      const targetId = req.user.role === 'customer' ? workerUserId : customerId;
      if (targetId) {
        const socketId = userSockets.get(targetId);
        if (socketId) {
          io.to(socketId).emit('notification', { type: 'booking_update', booking, status });
        }
      }
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone avatar' } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reschedule a booking (customer only, pending/confirmed)
// @route   PUT /api/bookings/:id/reschedule
const rescheduleBooking = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule this booking' });
    }
    booking.scheduledDate = scheduledDate;
    booking.scheduledTime = scheduledTime;
    await booking.save();

    // Notify worker via Socket.IO
    try {
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const workerDoc = await Worker.findById(booking.worker).select('user');
      const workerUserId = workerDoc?.user?.toString();
      if (io && userSockets && workerUserId) {
        const socketId = userSockets.get(workerUserId);
        if (socketId) io.to(socketId).emit('notification', { type: 'booking_rescheduled', booking });
      }
    } catch { /* silent */ }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus, getBookingById, rescheduleBooking };
