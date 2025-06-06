const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const { auth, requireAuth } = require('../middlewares/auth');

// Routes cho Section
router.post('/', auth, requireAuth, sectionController.createSection);
router.put('/:id', auth, requireAuth, sectionController.updateSection);
router.delete('/:id', auth, requireAuth, sectionController.deleteSection);
router.get('/course/:course_id', sectionController.getSectionsByCourse);
router.put('/reorder', auth, requireAuth, sectionController.updateSectionsOrder);

module.exports = router; 