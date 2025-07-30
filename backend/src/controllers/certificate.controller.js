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
  console.log('=== ĐÃ VÀO HÀM issueCertificate ===');
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    console.log('courseId:', courseId);
    console.log('userId:', userId);
    // Kiểm tra đã hoàn thành khóa học chưa
    console.log('Check enrollment...');
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    console.log('Enrollment:', enrollment);
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    // Nếu đã đánh dấu hoàn thành toàn bộ khóa học thì cho phép nhận chứng chỉ
    if (!enrollment.completed) {
      // Lấy danh sách bài học chưa hoàn thành
      const progress = enrollment.progress || {};
      const incompleteLessons = Object.entries(progress)
        .filter(([_, p]) => !p.completed)
        .map(([lessonId]) => lessonId);
      console.log('Chưa hoàn thành tất cả bài học:', incompleteLessons);
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa hoàn thành tất cả bài học',
        incompleteLessons
      });
    }
    // Kiểm tra đã có chứng chỉ chưa
    console.log('Check existing certificate...');
    let cert = await Certificate.findOne({ user: userId, course: courseId });
    console.log('Certificate:', cert);
    if (cert) return res.json({ success: true, data: cert });
    // Tạo mã chứng chỉ duy nhất
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Lấy thông tin user và course
    console.log('Check user...');
    const user = await User.findById(userId);
    console.log('User:', user);
    console.log('Check course...');
    const course = await Course.findById(courseId);
    console.log('Course:', course);
    if (!user || !course) throw new ApiError(404, 'Không tìm thấy thông tin user hoặc khóa học');

    // Tạo file PDF chứng chỉ
    const certDir = path.join(__dirname, '../../certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);
    const fileName = `certificate_${userId}_${courseId}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    
    // Thêm log kiểm tra đường dẫn và quyền ghi
    console.log('=== DEBUG CERTIFICATE ===');
    console.log('certDir:', certDir);
    console.log('filePath:', filePath);

    // Kiểm tra quyền ghi thư mục
    try {
      fs.accessSync(certDir, fs.constants.W_OK);
      console.log('Có quyền ghi vào thư mục certificates.');
    } catch (err) {
      console.error('KHÔNG có quyền ghi vào thư mục certificates:', err);
    }

    // Thử tạo file test.txt
    try {
      fs.writeFileSync(path.join(certDir, 'test.txt'), 'test');
      console.log('Tạo file test.txt thành công.');
    } catch (err) {
      console.error('KHÔNG tạo được file test.txt:', err);
    }

    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      
      // Chèn phôi nền nếu có
      const templatePath = path.join(certDir, 'certificate.png');
      if (fs.existsSync(templatePath)) {
        doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      }
      
      // Sử dụng font Roboto Unicode cho PDFKit
      const robotoFontPath = path.join(certDir, 'Roboto-Regular.ttf');
      doc.font(robotoFontPath);
      
      // Tiêu đề
      doc.fontSize(32).fillColor('#0e7490').text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', 0, 120, { align: 'center', width: doc.page.width });
      // Tên học viên
      doc.fontSize(22).fillColor('#222').text(`Học viên: ${user.fullname}`, 0, 200, { align: 'center', width: doc.page.width });
      // Tên khóa học
      doc.fontSize(20).fillColor('#222').text(`Khóa học: ${course.title}`, 0, 240, { align: 'center', width: doc.page.width });
      // Mã chứng chỉ
      doc.fontSize(16).fillColor('#222').text(`Mã chứng chỉ: ${code}`, 0, 290, { align: 'center', width: doc.page.width });
      // Ngày cấp
      doc.fontSize(16).fillColor('#222').text(`Ngày cấp: ${(new Date()).toLocaleDateString('vi-VN')}`, 0, 320, { align: 'center', width: doc.page.width });
      // Lời chúc
      doc.fontSize(15).fillColor('#0e7490').text('Chúc mừng bạn đã hoàn thành xuất sắc khóa học!', 0, 370, { align: 'center', width: doc.page.width });
      
          // Lưu file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    
    // Đợi file được tạo xong
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('PDF file created successfully:', filePath);
        resolve();
      });
      writeStream.on('error', (error) => {
        console.error('PDF write stream error:', error);
        reject(error);
      });
      doc.on('error', (error) => {
        console.error('PDF document error:', error);
        reject(error);
      });
      doc.end();
    });
      
      // Kiểm tra file đã được tạo thành công
      if (!fs.existsSync(filePath)) {
        throw new Error('Không thể tạo file PDF');
      }
      
      // Kiểm tra file có kích thước hợp lệ không
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error('File PDF trống');
      }
      
      console.log('Certificate PDF created successfully:', fileName, 'Size:', stats.size);
    } catch (pdfError) {
      console.error('PDF creation error:', pdfError);
      throw new ApiError(500, 'Không thể tạo file chứng chỉ: ' + pdfError.message);
    }

    // Lưu bản ghi chứng chỉ, thêm đường dẫn file
    cert = await Certificate.create({ user: userId, course: courseId, code, file: fileName });
    console.log('Certificate record created:', cert._id);
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
    console.log('Downloading certificate:', fileName);
    
    // Tìm chứng chỉ theo fileName và user
    const cert = await Certificate.findOne({ file: fileName, user: req.user._id });
    if (!cert) {
      console.log('Certificate not found for user:', req.user._id, 'file:', fileName);
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ hoặc bạn không có quyền truy cập.' });
    }
    
    const filePath = path.join(__dirname, '../../certificates', fileName);
    console.log('File path:', filePath);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return res.status(404).json({ success: false, message: 'File chứng chỉ không tồn tại.' });
    }
    
    // Kiểm tra file có thể đọc được không
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (accessError) {
      console.log('File access error:', accessError);
      return res.status(500).json({ success: false, message: 'Không thể đọc file chứng chỉ.' });
    }
    
    // Set header để browser có thể hiển thị PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Gửi file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Send file error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Lỗi khi gửi file chứng chỉ.' });
        }
      }
    });
  } catch (err) { 
    console.error('Download certificate error:', err);
    next(err); 
  }
}; 