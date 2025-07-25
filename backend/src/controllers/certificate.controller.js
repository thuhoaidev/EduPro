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
    // Nếu đã đánh dấu hoàn thành toàn bộ khóa học thì cho phép nhận chứng chỉ
    if (!enrollment.completed) {
      // Lấy danh sách bài học chưa hoàn thành
      const progress = enrollment.progress || {};
      const incompleteLessons = Object.entries(progress)
        .filter(([_, p]) => !p.completed)
        .map(([lessonId]) => lessonId);
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa hoàn thành tất cả bài học',
        incompleteLessons
      });
    }
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
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const fontPath = path.join(certDir, 'Roboto-Regular.ttf');
    // Chèn phôi nền
    const templatePath = path.join(certDir, 'certificate.png');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
    }
    // Sử dụng font Unicode cho mọi text
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    // Tiêu đề
    doc.fontSize(32).fillColor('#0e7490').text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', 0, 120, { align: 'center', width: doc.page.width });
    // Tên học viên
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc.fontSize(22).fillColor('#222').text(`Học viên: ${user.fullname}`, 0, 200, { align: 'center', width: doc.page.width });
    // Tên khóa học
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc.fontSize(20).fillColor('#222').text(`Khóa học: ${course.title}`, 0, 240, { align: 'center', width: doc.page.width });
    // Mã chứng chỉ
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc.fontSize(16).fillColor('#222').text(`Mã chứng chỉ: ${code}`, 0, 290, { align: 'center', width: doc.page.width });
    // Ngày cấp
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc.fontSize(16).fillColor('#222').text(`Ngày cấp: ${(new Date()).toLocaleDateString('vi-VN')}`, 0, 320, { align: 'center', width: doc.page.width });
    // Lời chúc
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc.fontSize(15).fillColor('#0e7490').text('Chúc mừng bạn đã hoàn thành xuất sắc khóa học!', 0, 370, { align: 'center', width: doc.page.width });
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