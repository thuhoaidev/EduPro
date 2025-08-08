const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth, optionalAuth } = require('../middlewares/auth');

// Lấy danh sách thông báo cho user (bao gồm global và cá nhân)
router.get('/', auth, notificationController.getNotifications);

// Route không cần auth để kiểm tra kết nối
router.get('/health', optionalAuth, (req, res) => {
  res.json({ success: true, message: 'Notifications API is working' });
});

// Tạo thông báo mới (có thể cần quyền admin, ở đây để public cho demo)
router.post('/', notificationController.createNotification);

// Đánh dấu đã đọc
router.patch('/:id/read', auth, notificationController.markAsRead);

// Xóa thông báo
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router; 