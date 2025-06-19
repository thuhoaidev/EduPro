const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Routes cho quiz
router.post('/', quizController.createQuiz);
router.get('/video/:video_id', quizController.getQuizByVideo);
router.post('/:quiz_id/submit', quizController.submitQuiz);
// Thêm, sửa, xóa câu hỏi - public
router.post('/:quiz_id/questions', quizController.addQuestion);
router.put('/:quiz_id/questions/:question_index', quizController.updateQuestion);
router.delete('/:quiz_id/questions/:question_index', quizController.deleteQuestion);

module.exports = router; 