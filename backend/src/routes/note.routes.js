const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const noteController = require('../controllers/note.controller');

// Tất cả các route ở đây đều yêu cầu xác thực
router.use(auth);

// Tạo ghi chú mới
router.post('/', noteController.createNote);

// Lấy tất cả ghi chú của user cho một bài học
router.get('/lesson/:lessonId', noteController.getNotesByLesson);

// Xóa một ghi chú
router.delete('/:noteId', noteController.deleteNote);

// Sửa một ghi chú
router.put('/:noteId', noteController.updateNote);

module.exports = router; 