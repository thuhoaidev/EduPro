const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  sendVerification,
  verifyEmail,
} = require('../controllers/auth');
const {updateOrCreateInstructorProfile} = require('../controllers/instructorprofile')
const {getPendingInstructors, approveInstructorProfile} = require('../controllers/instructorapproval')
const { auth, checkRole, checkPermission, requireAuth } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');
// const userController = require('../controllers/user');
// const courseController = require('../controllers/course');

// Routes xác thực
router.post('/register', register); // Đăng ký tài khoản
router.post('/login', login); // Đăng nhập
router.get('/profile', auth, requireAuth, getProfile); // Lấy thông tin người dùng
router.put('/profile', auth, updateProfile); // Cập nhật thông tin người dùng

// Routes xác thực email
router.post('/send-verification', auth, sendVerification);
router.post('/verify-email', verifyEmail);

// Routes hồ sơ giảng viên
router.put('/instructor-profile', auth, requireAuth, updateOrCreateInstructorProfile);
router.get('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), getPendingInstructors);
router.post('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), approveInstructorProfile);

// Route chỉ cho admin
// router.get('/admin/users', auth, checkRole(ROLES.ADMIN), userController.getAllUsers);

// Route cho instructor và admin
// router.post('/courses', auth, checkRole(ROLES.ADMIN, ROLES.INSTRUCTOR), courseController.createCourse);

// Route kiểm tra quyền cụ thể
// router.delete('/courses/:id', auth, checkPermission('manage_courses'), courseController.deleteCourse);

module.exports = router; 