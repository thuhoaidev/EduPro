const express = require('express');
const router = express.Router();
const { ROLES } = require('../models/Role');

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
  registerInstructor,
} = require('../controllers/authController');
const { getInstructorProfile, updateOrCreateInstructorProfile } = require('../controllers/instructorprofile');
const { getApprovedInstructors, approveInstructorProfile, getPendingInstructors  } = require('../controllers/instructorapproval');
// Routes công khai
router.post('/register', register);
router.post('/register/instructor', registerInstructor);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Routes hồ sơ giảng viên
// router.put('/instructor-profile', auth, requireAuth, updateOrCreateInstructorProfile);
router.get('/admin/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), getPendingInstructors);
router.post('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), approveInstructorProfile);

// Route chỉ cho admin
// router.get('/admin/users', auth, checkRole(ROLES.ADMIN), userController.getAllUsers);

// Routes yêu cầu xác thực
router.use(auth); // Middleware xác thực cho tất cả routes bên dưới

// Routes cho tất cả user đã đăng nhập
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);

// Routes hồ sơ giảng viên
router.get('/instructor-profile/:id?', requireAuth, getInstructorProfile);
router.put('/instructor-profile', requireAuth, updateOrCreateInstructorProfile);
router.get('/instructors-unapproved', requireAuth, getApprovedInstructors);
router.get('/instructors-pending', requireAuth, getPendingInstructors);
router.post('/instructors-approve', requireAuth, approveInstructorProfile);


module.exports = router; 