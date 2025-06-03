const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// Routes
router.post('/', upload.single('thumbnail'), handleUploadError, courseController.createCourse);
router.put('/:id', upload.single('thumbnail'), handleUploadError, courseController.updateCourse);
router.patch('/:id/status', courseController.updateCourseStatus);
router.delete('/:id', courseController.deleteCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.get('/slug/:slug', courseController.getCourseBySlug);

module.exports = router; 