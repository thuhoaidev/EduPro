const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const { validateSchema } = require('../utils/validateSchema');
const { createLessonSchema, updateLessonSchema, updateLessonsOrderSchema } = require('../validations/lesson.validation');
const {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsBySection,
  updateLessonsOrder,
  getLessonById,
} = require('../controllers/lesson.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho giảng viên và admin
router.post('/', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(createLessonSchema, req.body)
    .then(() => next())
    .catch(next);
}, createLesson);

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

// Route cho tất cả người dùng đã xác thực
router.get('/section/:section_id', getLessonsBySection);

// Route lấy thông tin 1 bài học theo id
router.get('/:id', getLessonById);

module.exports = router; 