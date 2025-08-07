const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Course = require('../src/models/Course');

// Danh sách slug của khóa học mẫu cần xóa
const sampleCourseSlugs = [
  'react-tu-co-ban-den-nang-cao',
  'nodejs-backend-development',
  'bao-mat-ung-dung-web',
  'machine-learning-co-ban',
  'mongodb-database-design',
  'thuat-toan-va-cau-truc-du-lieu',
  'agile-development',
  'react-native-mobile-app',
  'digital-marketing-strategy',
  'khoi-nghiep-kinh-doanh'
];

async function deleteSampleCourses() {
  try {
    console.log('🗑️  Bắt đầu xóa khóa học mẫu...\n');
    
    let deletedCount = 0;
    
    for (const slug of sampleCourseSlugs) {
      const course = await Course.findOne({ slug });
      
      if (course) {
        await Course.findByIdAndDelete(course._id);
        console.log(`✅ Đã xóa: ${course.title}`);
        deletedCount++;
      } else {
        console.log(`⚠️  Không tìm thấy khóa học với slug: ${slug}`);
      }
    }
    
    console.log(`\n📊 Đã xóa ${deletedCount} khóa học mẫu`);
    
    // Kiểm tra lại số lượng khóa học còn lại
    const remainingCourses = await Course.countDocuments({});
    console.log(`📈 Còn lại ${remainingCourses} khóa học trong database`);
    
    // Hiển thị danh sách khóa học còn lại
    const remainingCourseList = await Course.find({});
    console.log('\n📋 Danh sách khóa học còn lại:');
    remainingCourseList.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ${course.displayStatus}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi xóa khóa học mẫu:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
deleteSampleCourses(); 