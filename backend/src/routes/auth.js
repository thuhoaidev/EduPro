const express = require('express');
const router = express.Router();
const { protect, checkRole, checkPermission, requireVerifiedEmail,auth,requireAuth } = require('../middlewares/auth');
const {
  register,
  login,
  verifyEmail,getMe
} = require('../controllers/authController');
const {updateOrCreateInstructorProfile} = require('../controllers/instructorprofile')
const {getPendingInstructors, approveInstructorProfile} = require('../controllers/instructorapproval')
// const { auth, checkRole, checkPermission, requireAuth } = require('../middlewares/auth');
const { ROLES } = require('../models/Role');
// const userController = require('../controllers/user');
// const courseController = require('../controllers/course');
const { forgotPassword } = require('../controllers/authController');
const { resetPassword } = require('../controllers/authController');
// Routes xác thực
router.post('/register', register); // Đăng ký tài khoản
router.post('/login', login); // Đăng nhập
router.post('/forgot-password', forgotPassword);//Quên mật khẩu
router.post('/reset-password/:token', resetPassword);//Đặt lại mật khẩu

// router.get('/profile', auth, requireAuth, getProfile); // Lấy thông tin người dùng
// router.put('/profile', auth, updateProfile); // Cập nhật thông tin người dùng

// Routes xác thực email
// router.post('/send-verification', auth, sendVerification);
router.get('/verify-email/:token', verifyEmail);

// Routes hồ sơ giảng viên
// router.put('/instructor-profile', auth, requireAuth, updateOrCreateInstructorProfile);
// router.get('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), getPendingInstructors);
// router.post('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), approveInstructorProfile);

// Route chỉ cho admin
// router.get('/admin/users', auth, checkRole(ROLES.ADMIN), userController.getAllUsers);

// Routes yêu cầu xác thực
router.use(protect);

// Routes cho tất cả user đã đăng nhập
router.get('/me', getMe);
// router.patch('/me', updateMe);
// router.patch('/change-password', changePassword);

module.exports = router; 