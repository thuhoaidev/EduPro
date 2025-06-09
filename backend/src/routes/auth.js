const express = require('express');
const router = express.Router();
const { ROLES } = require('../models/Role');
const User = require('../models/User');

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
const { getInstructorProfile, updateOrCreateInstructorProfile,getInstructorApplication } = require('../controllers/instructorprofile');
const { getApprovedInstructors, approveInstructorProfile, getPendingInstructors  } = require('../controllers/instructorapproval');
const { getCurrentUser, updateCurrentUser, uploadAvatar } = require('../controllers/userController');
const upload = require('../middlewares/upload');

// Routes công khai
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Routes hồ sơ giảng viên
// router.put('/instructor-profile', auth, requireAuth, updateOrCreateInstructorProfile);
router.get('/admin/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), getPendingInstructors);
router.post('/instructor-approval', auth, checkRole(ROLES.ADMIN, ROLES.MODERATOR), approveInstructorProfile);
router.get('/admin/instructor-profile/:id?', requireAuth, getInstructorApplication);


// Route chỉ cho admin
// router.get('/admin/users', auth, checkRole(ROLES.ADMIN), userController.getAllUsers);

// Routes yêu cầu xác thực
router.use(auth); // Middleware xác thực cho tất cả routes bên dưới
router.post('/register/instructor', registerInstructor);

// Routes cho tất cả user đã đăng nhập
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);

// Routes hồ sơ giảng viên
// router.get('/instructor-profile/:id?', requireAuth, getInstructorProfile);
router.put('/instructor-profile/:id?', requireAuth, updateOrCreateInstructorProfile);
router.get('/instructors-unapproved/:id?', requireAuth, getApprovedInstructors);
router.get('/instructors-pending', requireAuth, getPendingInstructors);
router.post('/instructors-approve', requireAuth, approveInstructorProfile);

// Routes hồ sơ cá nhân

router.get('/user-me', auth, requireAuth, getCurrentUser);
router.put('/update-me', auth, requireAuth, updateCurrentUser);
router.post('/upload-avatar',auth,requireAuth,upload.single('avatar'),uploadAvatar);

router.get('/me/instructor', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Kiểm tra thông tin giảng viên
    const isInstructor =
      user.instructorInfo &&
      Object.keys(user.instructorInfo).length > 0 &&
      user.instructorInfo.is_approved === true;

    return res.status(200).json({ isInstructor });
  } catch (error) {
    console.error('Lỗi khi kiểm tra giảng viên:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});


module.exports = router; 