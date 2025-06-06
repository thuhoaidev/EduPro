const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizByLesson,
} = require('../controllers/quiz.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho quiz
router.post('/', requireAuth, createQuiz);
router.put('/:id', requireAuth, updateQuiz);
router.delete('/:id', requireAuth, deleteQuiz);
router.get('/lesson/:lesson_id', getQuizByLesson);

module.exports = router; 