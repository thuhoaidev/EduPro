const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizByLesson,
} = require('../controllers/quiz.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(protect);

// Routes cho quiz
router.post('/', authorize('admin', 'instructor'), createQuiz);
router.put('/:id', authorize('admin', 'instructor'), updateQuiz);
router.delete('/:id', authorize('admin', 'instructor'), deleteQuiz);
router.get('/lesson/:lesson_id', getQuizByLesson);

module.exports = router; 