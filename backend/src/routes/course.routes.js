const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload.middleware');
const { auth, requireAuth } = require('../middlewares/auth');

// Routes
router.post('/', auth, requireAuth(['instructor', 'admin']), uploadAvatar, handleUploadError, courseController.createCourse);
router.put('/:id', auth, requireAuth, uploadAvatar, handleUploadError, courseController.updateCourse);
router.patch('/:id/status', auth, requireAuth, courseController.updateCourseStatus);
router.delete('/:id', auth, requireAuth(['instructor', 'admin']), courseController.deleteCourse);
// Lấy danh sách khóa học
router.get('/', auth, requireAuth(['instructor', 'admin']), courseController.getCourses);

// Lấy chi tiết khóa học
router.get('/:id', auth, requireAuth(['admin', 'instructor']), courseController.getCourseById);
router.get('/slug/:slug', auth, requireAuth(['admin', 'instructor']), courseController.getCourseBySlug);

// Lấy danh sách chương học và bài học theo khóa học
router.get('/:course_id/sections', auth, requireAuth(['admin', 'instructor']), courseController.getCourseSectionsAndLessons);

module.exports = router; 