const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const sectionController = require('../controllers/section.controller');
const { uploadCourseAvatar, handleUploadError } = require('../middlewares/upload.middleware');
const { auth, requireAuth } = require('../middlewares/auth');
const { enrollCourse } = require('../controllers/course.controller');

// Routes
// Lấy danh sách khóa học
router.get('/', courseController.getCourses);

// Lấy danh sách khóa học của instructor hiện tại (phải đặt trước /:id để tránh conflict)
router.get('/instructor', auth, requireAuth(['instructor', 'admin']), courseController.getInstructorCourses);

// Lấy chi tiết khóa học
router.get('/:id', courseController.getCourseById);
router.get('/slug/:slug', courseController.getCourseBySlug);

// Public GET route for course sections
router.get('/:course_id/sections', sectionController.getSectionsByCourse);

// Lấy nội dung khóa học công khai (cho tất cả mọi người)
router.get('/:course_id/content', courseController.getCourseSectionsAndLessons);

// Các route cần xác thực bên dưới
router.post('/', auth, requireAuth(['instructor']), uploadCourseAvatar, handleUploadError, courseController.createCourse);
router.put('/:id', auth, requireAuth(['instructor']), uploadCourseAvatar, handleUploadError, courseController.updateCourse);
router.patch('/:id/status', auth, requireAuth(['instructor', 'admin', 'moderator']), courseController.updateCourseStatus);
router.post('/:id/submit', auth, requireAuth(['instructor']), courseController.submitCourseForApproval);
router.post('/:id/approve', auth, requireAuth(['admin', 'moderator']), courseController.approveCourse);
router.delete('/:id', auth, requireAuth(['instructor']), courseController.deleteCourse);
router.post('/:courseId/enroll', auth, enrollCourse);

module.exports = router; 