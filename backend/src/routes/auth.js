const express = require('express');
const router = express.Router();
const { protect, checkRole, checkPermission, requireVerifiedEmail } = require('../middlewares/auth');
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
} = require('../controllers/authController');

// Routes công khai
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Routes yêu cầu xác thực
router.use(protect);

// Routes cho tất cả user đã đăng nhập
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/change-password', changePassword);

module.exports = router; 