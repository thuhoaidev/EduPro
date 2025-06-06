const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { auth, requireAuth } = require('../middlewares/auth');

// Routes cho Lesson
router.post('/', auth, requireAuth, lessonController.createLesson);
router.put('/:id', auth, requireAuth, lessonController.updateLesson);
router.delete('/:id', auth, requireAuth, lessonController.deleteLesson);
router.get('/section/:section_id', lessonController.getLessonsBySection);
router.put('/reorder', auth, requireAuth, lessonController.updateLessonsOrder);

module.exports = router; 