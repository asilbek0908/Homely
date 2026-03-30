const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await Worker.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingVerifications = await Worker.countDocuments({ verificationStatus: 'pending' });

    const revenueData = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(5);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly bookings last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalWorkers,
        totalBookings,
        totalRevenue,
        pendingVerifications,
        recentBookings,
        bookingsByStatus,
        monthlyBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
const getPendingVerifications = async (req, res) => {
  try {
    const workers = await Worker.find({ verificationStatus: 'pending' })
      .select('user services location idDocument portfolio verificationStatus')
      .populate('user', 'name email phone avatar');
    res.json({ success: true, workers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve worker
// @route   PUT /api/admin/workers/:id/approve
const approveWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verificationStatus: 'approved' },
      { new: true }
    ).populate('user', 'name email');

    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject worker
// @route   PUT /api/admin/workers/:id/reject
const rejectWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected' },
      { new: true }
    ).populate('user', 'name email');

    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (all roles)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'worker'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getPendingVerifications, approveWorker, rejectWorker, getAllUsers, deleteUser, updateUserRole };
