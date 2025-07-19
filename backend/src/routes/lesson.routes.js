const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const { validateSchema } = require('../utils/validateSchema');
const { createLessonSchema, updateLessonSchema, updateLessonsOrderSchema } = require('../validations/lesson.validation');
const {
  createLessons,
  updateLesson,
  deleteLesson,
  getLessonsBySection,
  updateLessonsOrder,
  getLessonById,
} = require('../controllers/lesson.controller');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Lesson routes working' });
});

// Public GET routes for lesson info
router.get('/section/:section_id', getLessonsBySection);
router.get('/:id', getLessonById);

// Protect all routes below with auth
router.use(auth);

// Routes cho giảng viên và admin
router.post('/', requireAuth(['admin', 'instructor']), createLessons);

router.put('/:id', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(updateLessonSchema, req.body)
    .then(() => next())
    .catch(next);
}, updateLesson);

router.delete('/:id', requireAuth(['admin', 'instructor']), deleteLesson);

router.put('/section/:section_id/order', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(updateLessonsOrderSchema, req.body)
    .then(() => next())
    .catch(next);
}, updateLessonsOrder);

module.exports = router; 