const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const progressController = require('../controllers/progress.controller');

router.use(auth);

// Lấy tiến độ học của học viên trong một khóa học
router.get('/:courseId/progress', progressController.getProgress);
// Cập nhật tiến độ học cho một bài học
router.post('/:courseId/progress/:lessonId', progressController.updateProgress);
// Lấy danh sách bài học đã mở khóa
router.get('/:courseId/unlocked-lessons', progressController.getUnlockedLessons);

module.exports = router; 