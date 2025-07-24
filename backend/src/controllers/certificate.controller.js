const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');
const Notification = require('../models/Notification');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

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

    // Lấy thông tin user và course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user || !course) throw new ApiError(404, 'Không tìm thấy thông tin user hoặc khóa học');

    // Tạo file PDF chứng chỉ
    const certDir = path.join(__dirname, '../../certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);
    const fileName = `certificate_${userId}_${courseId}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    // Thiết kế đơn giản, có thể tuỳ chỉnh thêm
    doc.fontSize(28).text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(20).text(`Học viên: ${user.fullname}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text(`Khóa học: ${course.title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Mã chứng chỉ: ${code}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Ngày cấp: ${(new Date()).toLocaleDateString('vi-VN')}`, { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(14).text('Chúc mừng bạn đã hoàn thành xuất sắc khóa học!', { align: 'center' });
    doc.end();

    // Lưu bản ghi chứng chỉ, thêm đường dẫn file
    cert = await Certificate.create({ user: userId, course: courseId, code, file: fileName });
    res.status(201).json({ success: true, data: cert, fileUrl: `/certificates/${fileName}` });
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

// Tải file PDF chứng chỉ
exports.downloadCertificate = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    // Tìm chứng chỉ theo fileName và user
    const cert = await Certificate.findOne({ file: fileName, user: req.user._id });
    if (!cert) return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ hoặc bạn không có quyền truy cập.' });
    const filePath = require('path').join(__dirname, '../../certificates', fileName);
    res.download(filePath, fileName);
  } catch (err) { next(err); }
}; 