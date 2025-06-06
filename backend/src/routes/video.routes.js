const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/videoUpload.middleware');
const {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoByLesson,
} = require('../controllers/video.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho video
router.post('/', requireAuth, upload.single('video'), handleUploadError, createVideo);
router.put('/:id', requireAuth, upload.single('video'), handleUploadError, updateVideo);
router.delete('/:id', requireAuth, deleteVideo);
router.get('/lesson/:lesson_id', getVideoByLesson);

module.exports = router; 