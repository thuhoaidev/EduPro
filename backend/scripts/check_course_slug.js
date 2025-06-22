const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Course model
const Course = require('../src/models/Course');

async function checkCourseSlug() {
  try {
    const slug = 'khoa-hoc-react-tu-co-ban-den-nang-cao';
    console.log(`🔍 Đang tìm khóa học với slug: ${slug}`);
    
    // Tìm khóa học theo slug
    const course = await Course.findOne({ slug });
    
    if (!course) {
      console.log('❌ Không tìm thấy khóa học với slug này!');
      
      // Liệt kê tất cả slug có sẵn
      const allCourses = await Course.find({}, 'title slug');
      console.log('\n📋 Danh sách các khóa học có sẵn:');
      allCourses.forEach((c, index) => {
        console.log(`${index + 1}. ${c.title} -> slug: ${c.slug}`);
      });
      
      return;
    }
    
    console.log('✅ Tìm thấy khóa học:');
    console.log(`   - ID: ${course._id}`);
    console.log(`   - Title: ${course.title}`);
    console.log(`   - Slug: ${course.slug}`);
    console.log(`   - Views: ${course.views}`);
    console.log(`   - Instructor: ${course.instructor}`);
    console.log(`   - Category: ${course.category}`);
    console.log(`   - Status: ${course.status}`);
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['instructor', 'category', 'title', 'description', 'thumbnail', 'level', 'language', 'price'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!course[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Khóa học thiếu các trường: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ Khóa học có đầy đủ các trường bắt buộc');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra khóa học:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
checkCourseSlug(); 