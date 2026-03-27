const express = require('express');
const router = express.Router();
const {
  getAllWorkers,
  getWorkerById,
  createWorkerProfile,
  updateWorkerProfile,
  getWorkerStats,
  uploadIdDocument,
  uploadPortfolio,
  getMyProfile,
  deleteIdDocument,
  deletePortfolioPhoto,
} = require('../controllers/worker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');

router.get('/', getAllWorkers);
router.get('/stats/me', protect, authorize('worker'), getWorkerStats);
router.get('/:id', getWorkerById);
router.post('/', protect, authorize('worker'), createWorkerProfile);
router.put('/profile', protect, authorize('worker'), updateWorkerProfile);
router.get('/profile/me', protect, authorize('worker'), getMyProfile);
router.put('/document', protect, authorize('worker'), uploadDocument.single('document'), uploadIdDocument);
router.delete('/document', protect, authorize('worker'), deleteIdDocument);
router.put('/portfolio', protect, authorize('worker'), uploadDocument.array('photos', 5), uploadPortfolio);
router.delete('/portfolio', protect, authorize('worker'), deletePortfolioPhoto);

module.exports = router;
