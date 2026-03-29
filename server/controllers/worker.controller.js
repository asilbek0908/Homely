const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// @desc    Get all verified workers with optional filters
// @route   GET /api/workers
const getAllWorkers = async (req, res) => {
  try {
    const { service, district, minRating, maxPrice } = req.query;
    const filter = { isVerified: true };

    if (service) filter.services = { $in: [service] };
    if (district) filter['location.district'] = district;
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (maxPrice) filter.jobRate = { $lte: parseFloat(maxPrice) };

    const workers = await Worker.find(filter)
      .populate('user', 'name email phone avatar')
      .sort({ rating: -1 });

    res.json({ success: true, count: workers.length, workers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', 'name email phone avatar location');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create worker profile
// @route   POST /api/workers
const createWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, ...req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
const updateWorkerProfile = async (req, res) => {
  try {
    const { bio, services, jobRate, experience, location, availability } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { bio, services, jobRate, experience, location, availability },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get worker stats
// @route   GET /api/workers/stats/me
const getWorkerStats = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const bookings = await Booking.find({ worker: worker._id });
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

    res.json({
      success: true,
      stats: {
        totalJobs: worker.totalJobs,
        totalEarnings,
        averageRating: worker.rating,
        totalReviews: worker.totalReviews,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload ID document
// @route   PUT /api/workers/document
const uploadIdDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    const docUrl = `${SERVER_URL}/uploads/documents/${req.file.filename}`;
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { idDocument: docUrl },
      { new: true }
    );
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    res.json({ success: true, idDocument: docUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload portfolio images
// @route   PUT /api/workers/portfolio
const uploadPortfolio = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one file' });
    }
    const urls = req.files.map((f) => `${SERVER_URL}/uploads/documents/${f.filename}`);
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { $push: { portfolio: { $each: urls } } },
      { new: true }
    );
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    res.json({ success: true, portfolio: worker.portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current worker's own profile
// @route   GET /api/workers/profile/me
const getMyProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete ID document
// @route   DELETE /api/workers/document
const deleteIdDocument = async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { idDocument: '' },
      { new: true }
    );
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete one portfolio photo
// @route   DELETE /api/workers/portfolio
const deletePortfolioPhoto = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { portfolio: url } },
      { new: true }
    );
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
    res.json({ success: true, portfolio: worker.portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllWorkers, getWorkerById, createWorkerProfile, updateWorkerProfile, getWorkerStats, uploadIdDocument, uploadPortfolio, getMyProfile, deleteIdDocument, deletePortfolioPhoto };
