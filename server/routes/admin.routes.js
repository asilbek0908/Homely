const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingVerifications,
  approveWorker,
  rejectWorker,
  getAllUsers,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/verifications', protect, authorize('admin'), getPendingVerifications);
router.put('/workers/:id/approve', protect, authorize('admin'), approveWorker);
router.put('/workers/:id/reject', protect, authorize('admin'), rejectWorker);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
