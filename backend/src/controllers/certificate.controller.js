const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');
const Notification = require('../models/Notification');

// Cấp chứng chỉ khi hoàn thành khóa học
exports.issueCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    // Kiểm tra đã hoàn thành khóa học chưa
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    // Lấy danh sách bài học đã hoàn thành
    const progress = enrollment.progress || {};
    const allCompleted = Object.values(progress).length > 0 && Object.values(progress).every(p => p.completed);
    if (!allCompleted) throw new ApiError(400, 'Bạn chưa hoàn thành tất cả bài học');
    // Kiểm tra đã có chứng chỉ chưa
    let cert = await Certificate.findOne({ user: userId, course: courseId });
    if (cert) return res.json({ success: true, data: cert });
    // Tạo mã chứng chỉ duy nhất
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    cert = await Certificate.create({ user: userId, course: courseId, code });
    // Gửi thông báo cho user
/*
    const notification = await Notification.create({
      title: 'Chúc mừng bạn nhận được chứng chỉ!',
      content: 'Bạn đã hoàn thành khóa học và nhận được chứng chỉ. Hãy kiểm tra hồ sơ của bạn.',
      type: 'success',
      receiver: userId,
      icon: 'award',
      meta: { link: `/certificates/${cert._id}` }
    });
    const io = req.app.get && req.app.get('io');
    if (io && notification.receiver) {
      io.to(notification.receiver.toString()).emit('new-notification', notification);
    }
*/
    res.status(201).json({ success: true, data: cert });
  } catch (err) { next(err); }
};

// Lấy chứng chỉ của user cho một khóa học
exports.getCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const cert = await Certificate.findOne({ user: userId, course: courseId });
    if (!cert) throw new ApiError(404, 'Chưa có chứng chỉ cho khóa học này');
    res.json({ success: true, data: cert });
  } catch (err) { next(err); }
}; 