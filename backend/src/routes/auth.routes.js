const express = require('express');
const router = express.Router();
const { ROLES } = require('../models/Role');
const User = require('../models/User');

const { auth, checkRole, checkPermission, requireVerifiedEmail, requireAuth } = require('../middlewares/auth');
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
} = require('../controllers/auth.controller');
const { getInstructorProfile, updateOrCreateInstructorProfile, getInstructorApplication } = require('../controllers/instructorProfile.controller');
const { getApprovedInstructors, approveInstructorProfile, getPendingInstructors } = require('../controllers/instructorApproval.controller');
const { getCurrentUser, updateCurrentUser, uploadAvatar } = require('../controllers/user.controller');
const upload = require('../middlewares/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});
router.get('/verify-email/:slug/:token', verifyEmail); // Route xác thực email, không cần middleware auth
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Routes cho tất cả user đã đăng nhập
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);

// Routes hồ sơ cá nhân
router.get('/use-me', auth, requireAuth, getCurrentUser);
router.put('/update-me', auth, requireAuth, updateCurrentUser);
router.post('/upload-avatar', auth, requireAuth, upload.single('avatar'), uploadAvatar);

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