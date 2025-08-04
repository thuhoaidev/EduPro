const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { title, content, type, receiver, is_global, icon, meta } = req.body;
    const notification = new Notification({
      title,
      content,
      type,
      receiver: receiver || null,
      is_global: is_global || false,
      icon,
      meta
    });
    await notification.save();
    res.status(201).json({ success: true, message: 'Tạo thông báo thành công', data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tạo thông báo thất bại', error: err.message });
  }
};

// Lấy danh sách thông báo cho user (bao gồm global và cá nhân)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });

    let receiverQuery = [];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      receiverQuery.push({ receiver: new mongoose.Types.ObjectId(userId) });
    }

    const notifications = await Notification.find({
      $or: [
        { is_global: true },
        ...receiverQuery
      ]
    }).sort({ created_at: -1 });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy thông báo', error: err.message });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, message: 'Đã đánh dấu đã đọc', data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi đánh dấu đã đọc', error: err.message });
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi xóa thông báo', error: err.message });
  }
}; 