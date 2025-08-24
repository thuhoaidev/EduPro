const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { auth, optionalAuth } = require('../middlewares/auth');

// Route health check không cần auth
router.get('/health', optionalAuth, (req, res) => {
  res.json({ success: true, message: 'Messages API is working' });
});

// Gửi tin nhắn
router.post('/', auth, messageController.sendMessage);

// Lấy số tin nhắn chưa đọc tổng
router.get('/unread-count', auth, messageController.getUnreadCount);

// Lấy số tin nhắn chưa đọc từ một người cụ thể
router.get('/unread-count/:senderId', auth, messageController.getUnreadCountFromUser);

// Lấy danh sách cuộc trò chuyện (bao gồm cả người lạ)
router.get('/conversations', auth, messageController.getConversationList);

// Lấy cuộc trò chuyện với một người (có phân trang)
router.get('/conversation/:otherUserId', auth, messageController.getConversation);

// Lấy tin nhắn giữa 2 user (legacy)
router.get('/:otherUserId', auth, messageController.getMessages);

// Đánh dấu đã đọc
router.post('/:otherUserId/read', auth, messageController.markAsRead);

module.exports = router;