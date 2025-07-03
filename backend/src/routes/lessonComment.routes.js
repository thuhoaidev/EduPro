const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const lessonCommentController = require('../controllers/lessonComment.controller');

router.use(auth);

// Thêm bình luận mới cho bài học
router.post('/:lessonId/comment', lessonCommentController.addComment);
// Lấy danh sách bình luận của bài học
router.get('/:lessonId/comments', lessonCommentController.getComments);
// Trả lời bình luận
router.post('/comment/:commentId/reply', lessonCommentController.replyComment);

module.exports = router; 