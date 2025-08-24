const mongoose = require('mongoose');
const Course = require('./src/models/Course');

require('dotenv').config();

async function checkCourseStatus() {
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
    
    console.log('📚 Course details:');
    console.log('- Title:', course.title);
    console.log('- Status:', course.status);
    console.log('- Display Status:', course.displayStatus);
    console.log('- Price:', course.price);
    console.log('- Instructor:', course.instructor);

    // Kiểm tra các điều kiện enroll
    console.log('\n🔍 Enrollment conditions:');
    
    // 1. Kiểm tra course có được publish không
    const isPublished = course.status === 'approved' && course.displayStatus === 'published';
    console.log('1. Course published:', isPublished, `(status: ${course.status}, displayStatus: ${course.displayStatus})`);
    
    // 2. Kiểm tra course có miễn phí không
    const isFree = course.price === 0;
    console.log('2. Course is free:', isFree, `(price: ${course.price})`);
    
    // 3. Kiểm tra instructor
    console.log('3. Instructor ID:', course.instructor);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCourseStatus(); 