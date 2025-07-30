const express = require('express');
const router = express.Router();

const {requireAuth, auth} = require('../middlewares/auth');
const {
  getMe,
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/auth.controller');
const { uploadInstructorFiles, processInstructorFilesUpload } = require('../middlewares/upload');
const { registerInstructor, verifyInstructorEmail } = require('../controllers/user.controller');
const passport = require('../config/passport');
const { createToken } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công',
  });
});
router.get('/verify-email/:token', verifyEmail); // Route xác thực email, không cần middleware auth
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Routes cho tất cả user đã đăng nhập
router.patch('/change-password', auth, requireAuth(), changePassword);

// Đăng ký giảng viên mới (KHÔNG cần đăng nhập)
router.post('/instructor-register', uploadInstructorFiles, processInstructorFilesUpload, registerInstructor);
// Xác minh email cho instructor (KHÔNG cần đăng nhập)
router.get('/verify-instructor-email/:token', verifyInstructorEmail);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = createToken(req.user._id);
  const user = encodeURIComponent(JSON.stringify({
    _id: req.user._id,
    email: req.user.email,
    fullname: req.user.fullname,
    nickname: req.user.nickname,
    role: req.user.role_id?.name || req.user.role,
    avatar: req.user.avatar
  }));
  res.redirect(`http://localhost:5173/social-callback?token=${token}&user=${user}`);
});

router.get('/me', auth, requireAuth(), getMe);

module.exports = router; 