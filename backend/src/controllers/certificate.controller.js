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

// Helper: generate certificate PDF to a specific file path
async function generateCertificatePDF({
  certDir,
  filePath,
  fileName,
  displayName,
  courseTitle,
  instructorName,
  certificateNumber
}) {
  // Ensure directory exists
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  try {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

    const templatePath = path.join(certDir, 'certificate.png');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height
      });
    } else {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    }

    const robotoFontPath = path.join(certDir, 'Roboto-Regular.ttf');
    const robotoBoldPath = path.join(certDir, 'Roboto-Bold.ttf');
    const robotoItalicPath = path.join(certDir, 'Roboto-Italic.ttf');

    if (fs.existsSync(robotoFontPath)) doc.font(robotoFontPath);
    const pageBottom = doc.page.height;

    // Student name (center)
    if (fs.existsSync(robotoItalicPath)) doc.font(robotoItalicPath);
    doc.fontSize(42)
      .fillColor('#dc2626')
      .text(displayName || 'Học viên', 0, 250, {
        align: 'center',
        width: doc.page.width,
        characterSpacing: 2
      });

    // Course title (beneath name)
    if (fs.existsSync(robotoFontPath)) doc.font(robotoFontPath);
    doc.fontSize(20)
      .fillColor('#dc2626')
      .text(`Đã hoàn thành khóa học: ${courseTitle}`, 0, 310, {
        align: 'center',
        width: doc.page.width
      });

    // Issuing unit (bottom-left)
    if (fs.existsSync(robotoBoldPath)) doc.font(robotoBoldPath);
    doc.fontSize(18)
      .fillColor('#dc2626')
      .text('EduPro', 100, pageBottom - 120, {
        width: 200,
        align: 'center'
      });

    // Instructor name (bottom-right)
    if (fs.existsSync(robotoItalicPath)) doc.font(robotoItalicPath);
    doc.fontSize(18)
      .fillColor('#dc2626')
      .text(instructorName || 'Edu Pro', doc.page.width - 300, pageBottom - 120, {
        width: 200,
        align: 'center'
      });

    // Certificate number + issue date (bottom center)
    if (fs.existsSync(robotoFontPath)) doc.font(robotoFontPath);
    const issueDate = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    doc.fontSize(12)
      .fillColor('#dc2626')
      .text(`Chứng nhận số: ${certificateNumber}`, 0, pageBottom - 50, {
        width: doc.page.width,
        align: 'center'
      });

    doc.fontSize(12)
      .text(`Cấp ngày: ${issueDate}`, 0, pageBottom - 30, {
        width: doc.page.width,
        align: 'center'
      });

    // Write PDF to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      doc.on('error', reject);
      doc.end();
    });

    const stats = fs.statSync(filePath);
    if (!fs.existsSync(filePath) || stats.size === 0) {
      throw new Error('Không thể tạo file chứng chỉ hoặc file rỗng');
    }

    console.log('Certificate PDF created successfully:', fileName, 'Size:', stats.size);
  } catch (pdfError) {
    console.error('PDF creation error:', pdfError);
    throw new ApiError(500, 'Không thể tạo file chứng chỉ: ' + pdfError.message);
  }
}

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
    const certificateNumber = `CERT-${Date.now()}`;

    // Lấy thông tin user và course
    console.log('Check user...');
    const user = await User.findById(userId);
    console.log('User:', user);
    console.log('Check course...');
    const course = await Course.findById(courseId).populate('instructor');
    console.log('Course:', course);
    if (!user || !course) throw new ApiError(404, 'Không tìm thấy thông tin user hoặc khóa học');

    // Lấy thông tin giảng viên
    let instructorName = 'Edu Pro';
    if (course.instructor && course.instructor.user) {
      const instructorUser = await User.findById(course.instructor.user);
      if (instructorUser) {
        instructorName = instructorUser.fullname || instructorUser.nickname || 'Edu Pro';
      }
    }

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

// Generate certificate PDF
await generateCertificatePDF({
  certDir,
  filePath,
  fileName,
  displayName: user.fullname || user.nickname || 'Học viên',
  courseTitle: course.title,
  instructorName,
  certificateNumber
});

    // Lưu bản ghi chứng chỉ với đầy đủ thông tin
    cert = await Certificate.create({ 
      user: userId, 
      course: courseId, 
      code, 
      file: fileName,
      certificateNumber,
      issuingUnit: 'Edu Pro',
      instructorSignature: instructorName,
      instructorName,
      motivationalText: 'Cảm ơn bạn vì tất cả sự chăm chỉ và cống hiến của mình. Hãy tiếp tục học hỏi, vì càng có nhiều kiến thức, bạn càng có cơ hội thành công trong cuộc sống.',
      templateUsed: 'certificate.png',
    });
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

// Lấy thông tin chi tiết chứng chỉ với đầy đủ thông tin
exports.getCertificateDetails = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    const cert = await Certificate.findOne({ user: userId, course: courseId })
      .populate('user', 'fullname nickname email')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          populate: {
            path: 'user',
            select: 'fullname nickname'
          }
        }
      });
    
    if (!cert) throw new ApiError(404, 'Chưa có chứng chỉ cho khóa học này');
    
    // Format dữ liệu trả về
    const certificateData = {
      id: cert._id,
      certificateNumber: cert.certificateNumber,
      code: cert.code,
      issuedAt: cert.issuedAt,
      file: cert.file,
      fileUrl: `/certificates/${cert.file}`,
      templateUsed: cert.templateUsed,
      issuingUnit: cert.issuingUnit,
      instructorName: cert.instructorName,
      instructorSignature: cert.instructorSignature,
      motivationalText: cert.motivationalText,
      student: {
        name: cert.user.fullname || cert.user.nickname,
        email: cert.user.email
      },
      course: {
        title: cert.course.title,
        instructor: cert.course.instructor?.user?.fullname || cert.course.instructor?.user?.nickname || 'Edu Pro'
      }
    };
    
    res.json({ success: true, data: certificateData });
  } catch (err) { next(err); }
};

// Lấy danh sách tất cả chứng chỉ của user
exports.getUserCertificates = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const certificates = await Certificate.find({ user: userId })
      .populate('user', 'fullname nickname email')
      .populate({
        path: 'course',
        select: 'title thumbnail',
        populate: {
          path: 'instructor',
          populate: {
            path: 'user',
            select: 'fullname nickname'
          }
        }
      })
      .sort({ issuedAt: -1 });
    
    const certificatesData = certificates.map(cert => ({
      id: cert._id,
      certificateNumber: cert.certificateNumber,
      code: cert.code,
      issuedAt: cert.issuedAt,
      file: cert.file,
      fileUrl: `/certificates/${cert.file}`,
      templateUsed: cert.templateUsed,
      issuingUnit: cert.issuingUnit,
      instructorName: cert.instructorName,
      course: {
        title: cert.course.title,
        thumbnail: cert.course.thumbnail,
        instructor: cert.course.instructor?.user?.fullname || cert.course.instructor?.user?.nickname || 'Edu Pro'
      }
    }));
    
    res.json({ success: true, data: certificatesData });
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
      console.log('File not found on disk, attempting to regenerate:', filePath);
      try {
        const certDir = path.join(__dirname, '../../certificates');
        const user = await User.findById(req.user._id);
        const course = await Course.findById(cert.course).populate('instructor');

        let instructorName = cert.instructorName || 'Edu Pro';
        if (!cert.instructorName && course && course.instructor && course.instructor.user) {
          const instructorUser = await User.findById(course.instructor.user);
          if (instructorUser) {
            instructorName = instructorUser.fullname || instructorUser.nickname || 'Edu Pro';
          }
        }

        await generateCertificatePDF({
          certDir,
          filePath,
          fileName,
          displayName: (user && (user.fullname || user.nickname)) || 'Học viên',
          courseTitle: course ? course.title : 'Khóa học',
          instructorName,
          certificateNumber: cert.certificateNumber
        });
      } catch (regenError) {
        console.error('Failed to regenerate certificate file:', regenError);
        return res.status(404).json({ success: false, message: 'File chứng chỉ không tồn tại và không thể tạo lại.' });
      }
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