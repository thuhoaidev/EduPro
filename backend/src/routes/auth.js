const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  sendVerification,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
} = require('../controllers/authController');
const { getInstructorProfile, updateOrCreateInstructorProfile } = require('../controllers/instructorprofile');

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
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

// Routes xác thực email
router.post('/send-verification', requireAuth, sendVerification);
router.post('/verify-email', requireAuth, verifyEmail);

// Routes hồ sơ giảng viên
router.get('/instructor-profile/:id?', requireAuth, getInstructorProfile);
router.put('/instructor-profile', requireAuth, updateOrCreateInstructorProfile);

module.exports = router; 