const mongoose = require('mongoose');
const Enrollment = require('./src/models/Enrollment');
const Course = require('./src/models/Course');
const User = require('./src/models/User');

require('dotenv').config();

async function checkEnrollment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro');
    console.log('✅ Connected to MongoDB');

    const courseId = '6879caf1856109989beda9af';
    
    // Kiểm tra course có tồn tại không
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return;
    }
    console.log('✅ Course found:', course.title);

    // Kiểm tra tất cả enrollments cho course này
    const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'fullname email');
    console.log('📊 Total enrollments for this course:', enrollments.length);
    
    enrollments.forEach(enrollment => {
      console.log(`- Student: ${enrollment.student.fullname} (${enrollment.student.email}) - Enrolled at: ${enrollment.enrolledAt}`);
    });

    // Kiểm tra một user cụ thể (nếu có)
    const testUserId = '6880bd329862cd83e5a1b889'; // Thay bằng user ID thực tế
    const userEnrollment = await Enrollment.findOne({ student: testUserId, course: courseId });
    if (userEnrollment) {
      console.log('❌ User already enrolled in this course');
    } else {
      console.log('✅ User not enrolled yet');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkEnrollment(); 