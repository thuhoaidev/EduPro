const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const { validateSchema } = require('../utils/validateSchema');
const { createSectionSchema, updateSectionSchema, updateSectionsOrderSchema } = require('../validations/section.validation');
const {
  createSection,
  updateSection,
  deleteSection,
  getSectionsByCourse,
  updateSectionsOrder,
} = require('../controllers/section.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho giảng viên và admin
router.post('/', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(createSectionSchema, req.body)
    .then(() => next())
    .catch(next);
}, createSection);

router.put('/:id', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(updateSectionSchema, req.body)
    .then(() => next())
    .catch(next);
}, updateSection);

router.delete('/:id', requireAuth(['admin', 'instructor']), deleteSection);

router.put('/course/:course_id/order', requireAuth(['admin', 'instructor']), (req, res, next) => {
  validateSchema(updateSectionsOrderSchema, req.body)
    .then(() => next())
    .catch(next);
}, updateSectionsOrder);

// Route cho tất cả người dùng đã xác thực
router.get('/course/:course_id', getSectionsByCourse);

module.exports = router; 