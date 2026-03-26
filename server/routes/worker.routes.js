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
} = require('../controllers/worker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');

router.get('/', getAllWorkers);
router.get('/stats/me', protect, authorize('worker'), getWorkerStats);
router.get('/:id', getWorkerById);
router.post('/', protect, authorize('worker'), createWorkerProfile);
router.put('/profile', protect, authorize('worker'), updateWorkerProfile);
router.put('/document', protect, authorize('worker'), uploadDocument.single('document'), uploadIdDocument);
router.put('/portfolio', protect, authorize('worker'), uploadDocument.array('photos', 5), uploadPortfolio);

module.exports = router;
