const express = require('express');
const router = express.Router();

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

const {
  updateOrCreateInstructorProfile,
} = require('../controllers/instructorprofile');

const {
  getPendingInstructors,
  approveInstructorProfile,
} = require('../controllers/instructorapproval');

const { protect, checkRole } = require('../middlewares/auth');
const { ROLES } = require('../models/Role');

// --- Public routes ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// --- Middleware xác thực ---
router.use(protect); // Bảo vệ các route dưới đây, yêu cầu đăng nhập

// --- User routes ---
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/change-password', changePassword);

// --- Instructor profile ---
router.put('/instructor-profile', updateOrCreateInstructorProfile);

// --- Instructor approval (admin/mod only) ---
router.get('/instructor-approval',
  checkRole(ROLES.ADMIN, ROLES.MODERATOR),
  getPendingInstructors,
);

router.post('/instructor-approval',
  checkRole(ROLES.ADMIN, ROLES.MODERATOR),
  approveInstructorProfile,
);

module.exports = router;
