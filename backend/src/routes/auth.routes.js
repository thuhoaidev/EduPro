const express = require('express');
const router = express.Router();

const {requireAuth } = require('../middlewares/auth');
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/auth.controller');

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
router.patch('/change-password', requireAuth, changePassword);

module.exports = router; 