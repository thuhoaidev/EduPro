const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const User = require('./src/models/User');

require('dotenv').config();

async function checkUserInstructor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro');
    console.log('✅ Connected to MongoDB');

    const courseId = '6879caf1856109989beda9af';
    const testUserId = '6880bd329862cd83e5a1b889'; // Thay bằng user ID thực tế
    
    // Kiểm tra course
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return;
    }
    
    console.log('📚 Course:', course.title);
    console.log('👨‍🏫 Course Instructor:', course.instructor);
    
    // Kiểm tra user
    const user = await User.findById(testUserId);
    if (!user) {
      console.log('❌ User not found:', testUserId);
      return;
    }
    
    console.log('👤 User:', user.fullname, `(${user.email})`);
    console.log('🔑 User ID:', user._id);
    
    // Kiểm tra xem user có phải là instructor của course không
    const isInstructor = course.instructor && course.instructor.toString() === user._id.toString();
    console.log('🎯 Is user instructor of this course:', isInstructor);
    
    if (isInstructor) {
      console.log('❌ User is instructor - cannot enroll in own course');
    } else {
      console.log('✅ User is not instructor - can enroll');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserInstructor(); 