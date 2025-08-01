const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Enrollment = require('./src/models/Enrollment');
require('dotenv').config();

async function testNewCertificate() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Tìm user và course test đã tạo
    const user = await User.findOne({ email: 'test@certificate.com' });
    const course = await Course.findOne({ title: 'Khóa Học Test Chứng Chỉ' });
    
    if (!user || !course) {
      console.log('Không tìm thấy user hoặc course để test');
      console.log('User found:', user ? 'Yes' : 'No');
      console.log('Course found:', course ? 'Yes' : 'No');
      return;
    }

    console.log('Test user:', user.fullname);
    console.log('Test course:', course.title);

    // Kiểm tra enrollment
    let enrollment = await Enrollment.findOne({ student: user._id, course: course._id });
    if (!enrollment) {
      console.log('Tạo enrollment mới...');
      enrollment = await Enrollment.create({
        student: user._id,
        course: course._id,
        completed: true,
        progress: {}
      });
    } else {
      console.log('Enrollment đã tồn tại, cập nhật thành completed...');
      enrollment.completed = true;
      await enrollment.save();
    }

    // Xóa chứng chỉ cũ nếu có
    await Certificate.deleteMany({ user: user._id, course: course._id });
    console.log('Đã xóa chứng chỉ cũ');

    // Tạo chứng chỉ mới
    const certificateNumber = `CERT-${Date.now()}`;
    const code = require('crypto').randomBytes(8).toString('hex').toUpperCase();
    
    // Lấy thông tin giảng viên
    let instructorName = 'Edu Pro';
    if (course.instructor) {
      const instructorUser = await User.findById(course.instructor);
      if (instructorUser) {
        instructorName = instructorUser.fullname || instructorUser.nickname || 'Edu Pro';
      }
    }

    const certificate = await Certificate.create({
      user: user._id,
      course: course._id,
      code,
      certificateNumber,
      issuingUnit: 'Edu Pro',
      instructorSignature: instructorName,
      instructorName,
      motivationalText: 'Cảm ơn bạn vì tất cả sự chăm chỉ và cống hiến của mình. Hãy tiếp tục học hỏi, vì càng có nhiều kiến thức, bạn càng có cơ hội thành công trong cuộc sống.',
      templateUsed: 'Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png'
    });

    console.log('Chứng chỉ mới được tạo:', certificate._id);
    console.log('Số chứng chỉ:', certificate.certificateNumber);
    console.log('Mã chứng chỉ:', certificate.code);
    console.log('Đơn vị cấp:', certificate.issuingUnit);
    console.log('Chữ ký giảng viên:', certificate.instructorName);
    console.log('Template sử dụng:', certificate.templateUsed);

    // Test lấy thông tin chi tiết
    const certDetails = await Certificate.findById(certificate._id)
      .populate('user', 'fullname nickname email')
      .populate('course', 'title');

    console.log('\n=== THÔNG TIN CHI TIẾT CHỨNG CHỈ ===');
    console.log('Học viên:', certDetails.user.fullname);
    console.log('Khóa học:', certDetails.course.title);
    console.log('Giảng viên:', certDetails.instructorName);
    console.log('Ngày cấp:', certDetails.issuedAt);
    console.log('Lời chúc:', certDetails.motivationalText);

    console.log('\nTest hoàn thành!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testNewCertificate(); 