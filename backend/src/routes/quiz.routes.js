const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middlewares/auth');
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizByLesson,
  getQuizByVideo,
  submitQuiz,
} = require('../controllers/quiz.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho quiz
router.post('/', requireAuth, createQuiz);
router.put('/:id', requireAuth, updateQuiz);
router.delete('/:id', requireAuth, deleteQuiz);
router.get('/lesson/:lesson_id', getQuizByLesson);
router.get('/video/:video_id', getQuizByVideo);
router.post('/:quiz_id/submit', submitQuiz);

module.exports = router; 