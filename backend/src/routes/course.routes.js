const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { uploadCourseAvatar, handleUploadError } = require('../middlewares/upload.middleware');
const { auth, requireAuth } = require('../middlewares/auth');
const { enrollCourse } = require('../controllers/course.controller');

// Routes
router.post('/', auth, requireAuth(['instructor']), uploadCourseAvatar, handleUploadError, courseController.createCourse);
router.put('/:id', auth, requireAuth(['instructor']), uploadCourseAvatar, handleUploadError, courseController.updateCourse);
router.patch('/:id/status', auth, requireAuth(['instructor', 'admin', 'moderator']), courseController.updateCourseStatus);
router.delete('/:id', auth, requireAuth(['instructor']), courseController.deleteCourse);
// Lấy danh sách khóa học
router.get('/', courseController.getCourses);

// Lấy chi tiết khóa học
router.get('/:id', courseController.getCourseById);
router.get('/slug/:slug', courseController.getCourseBySlug);

// Lấy danh sách chương học và bài học theo khóa học
router.get('/:course_id/sections', courseController.getCourseSectionsAndLessons);

router.post('/:courseId/enroll', auth, enrollCourse);

module.exports = router; 