const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');
const { auth, requireAuth } = require('../middlewares/auth');

// Routes
router.post('/', auth, requireAuth, upload.single('thumbnail'), handleUploadError, courseController.createCourse);
router.put('/:id', auth, requireAuth, upload.single('thumbnail'), handleUploadError, courseController.updateCourse);
router.patch('/:id/status', auth, requireAuth, courseController.updateCourseStatus);
router.delete('/:id', auth, requireAuth, courseController.deleteCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.get('/slug/:slug', courseController.getCourseBySlug);

// Lấy danh sách chương học và bài học theo khóa học
router.get('/:course_id/sections', courseController.getCourseSectionsAndLessons);

module.exports = router; 