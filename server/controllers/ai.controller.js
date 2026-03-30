const Worker = require('../models/Worker');
const { getTopMatches } = require('../utils/aiMatching');

// @desc    Get AI-matched workers for a customer
// @route   GET /api/ai/match
const getAIMatches = async (req, res) => {
  try {
    const { serviceType, district } = req.query;

    if (!serviceType) {
      return res.status(400).json({ success: false, message: 'serviceType is required' });
    }

    const workers = await Worker.find({ isVerified: true })
      .populate('user', 'name email phone avatar');

    if (workers.length === 0) {
      return res.json({ success: true, matches: [] });
    }

    const matches = getTopMatches(workers, { serviceType, district: district || '' });

    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAIMatches };
