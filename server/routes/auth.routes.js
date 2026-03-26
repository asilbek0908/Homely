const express = require('express');
const router = express.Router();
const { register, login, getMe, uploadUserAvatar, verifyEmail, resendVerification, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/avatar', protect, uploadAvatar.single('avatar'), uploadUserAvatar);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
