const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  register,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify/:verificationToken', verifyEmail);

// Protected routes
router.post('/register', protect, register); // Usually admin only
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;