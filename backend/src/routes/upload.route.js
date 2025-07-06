// routes/upload.route.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { uploadAvatar, processAvatarUpload } = require('../middlewares/upload.middleware');

// Upload ảnh blog (dùng cho viết blog)
router.post('/image', auth, uploadAvatar, processAvatarUpload, (req, res) => {
  if (req.uploadedAvatar) {
    return res.json({
      success: true,
      url: req.uploadedAvatar.url
    });
  }

  return res.status(400).json({
    success: false,
    message: 'Không có ảnh được upload.'
  });
});

module.exports = router;
