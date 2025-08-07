const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middlewares/videoUpload.middleware');
const {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoByLesson,
} = require('../controllers/video.controller');

// Route public cho video
router.post('/', upload.single('video'), handleUploadError, createVideo);
router.put('/:id', upload.single('video'), handleUploadError, updateVideo);
router.delete('/:id', deleteVideo);
router.get('/lesson/:lesson_id', getVideoByLesson);

module.exports = router;
