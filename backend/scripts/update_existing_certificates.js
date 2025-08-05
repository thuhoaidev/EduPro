const mongoose = require('mongoose');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
require('dotenv').config();

async function updateExistingCertificates() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Lấy tất cả chứng chỉ cũ
    const certificates = await Certificate.find({});
    console.log(`Tìm thấy ${certificates.length} chứng chỉ cần cập nhật`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const cert of certificates) {
      try {
        // Kiểm tra xem chứng chỉ đã có thông tin mới chưa
        if (cert.certificateNumber && cert.issuingUnit && cert.instructorName) {
          console.log(`Chứng chỉ ${cert._id} đã có thông tin mới, bỏ qua`);
          continue;
        }

        // Lấy thông tin course và instructor
        const course = await Course.findById(cert.course).populate('instructor');
        if (!course) {
          console.log(`Không tìm thấy course cho chứng chỉ ${cert._id}`);
          continue;
        }

        // Lấy thông tin giảng viên
        let instructorName = 'Edu Pro';
        if (course.instructor && course.instructor.user) {
          const instructorUser = await User.findById(course.instructor.user);
          if (instructorUser) {
            instructorName = instructorUser.fullname || instructorUser.nickname || 'Edu Pro';
          }
        }

        // Tạo số chứng chỉ mới nếu chưa có
        const certificateNumber = cert.certificateNumber || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Cập nhật chứng chỉ
        await Certificate.findByIdAndUpdate(cert._id, {
          certificateNumber,
          issuingUnit: 'Edu Pro',
          instructorSignature: instructorName,
          instructorName,
          motivationalText: 'Cảm ơn bạn vì tất cả sự chăm chỉ và cống hiến của mình. Hãy tiếp tục học hỏi, vì càng có nhiều kiến thức, bạn càng có cơ hội thành công trong cuộc sống.',
          templateUsed: 'Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png'
        });

        console.log(`Đã cập nhật chứng chỉ ${cert._id}`);
        updatedCount++;

      } catch (error) {
        console.error(`Lỗi khi cập nhật chứng chỉ ${cert._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== KẾT QUẢ CẬP NHẬT ===');
    console.log(`Tổng số chứng chỉ: ${certificates.length}`);
    console.log(`Đã cập nhật: ${updatedCount}`);
    console.log(`Lỗi: ${errorCount}`);

    // Kiểm tra kết quả
    const updatedCertificates = await Certificate.find({
      certificateNumber: { $exists: true },
      issuingUnit: { $exists: true },
      instructorName: { $exists: true }
    });

    console.log(`\nSố chứng chỉ đã có thông tin mới: ${updatedCertificates.length}`);

    if (updatedCertificates.length > 0) {
      console.log('\n=== MẪU CHỨNG CHỈ ĐÃ CẬP NHẬT ===');
      const sampleCert = updatedCertificates[0];
      console.log('Số chứng chỉ:', sampleCert.certificateNumber);
      console.log('Đơn vị cấp:', sampleCert.issuingUnit);
      console.log('Giảng viên:', sampleCert.instructorName);
      console.log('Template:', sampleCert.templateUsed);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateExistingCertificates(); 