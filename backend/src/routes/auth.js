const express = require('express');
const router = express.Router();
const { auth, checkRole, checkPermission, requireAuth, requireVerifiedEmail } = require('../middlewares/auth');
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
router.use(auth); // Middleware xác thực cho tất cả routes bên dưới

// Routes cho tất cả user đã đăng nhập
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);

module.exports = router; 