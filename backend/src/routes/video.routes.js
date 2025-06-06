const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoByLesson,
} = require('../controllers/video.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(protect);

// Routes cho video
router.post('/', authorize('admin', 'instructor'), createVideo);
router.put('/:id', authorize('admin', 'instructor'), updateVideo);
router.delete('/:id', authorize('admin', 'instructor'), deleteVideo);
router.get('/lesson/:lesson_id', getVideoByLesson);

module.exports = router; 