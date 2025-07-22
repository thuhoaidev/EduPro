const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { auth } = require('../middlewares/auth');

// Gửi tin nhắn
router.post('/', auth, messageController.sendMessage);
// Lấy tin nhắn giữa 2 user
router.get('/:otherUserId', auth, messageController.getMessages);
// Đánh dấu đã đọc
router.post('/:otherUserId/read', auth, messageController.markAsRead);

module.exports = router; 