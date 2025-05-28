const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
} = require('../controllers/userProfileController');

// Áp dụng middleware auth cho tất cả routes
router.use(auth);

// Lấy thông tin profile
router.get('/profile', requireAuth, getProfile);

// Cập nhật thông tin profile
router.patch('/profile', requireAuth, updateProfile);

// Upload ảnh đại diện
router.post('/profile/avatar', requireAuth, uploadAvatar);

module.exports = router; 