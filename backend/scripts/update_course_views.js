const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Course model
const Course = require('../src/models/Course');

async function updateCourseViews() {
  try {
    console.log('🔍 Đang kiểm tra các khóa học thiếu trường views...');
    
    // Tìm tất cả khóa học không có trường views
    const coursesWithoutViews = await Course.find({ views: { $exists: false } });
    
    if (coursesWithoutViews.length === 0) {
      console.log('✅ Tất cả khóa học đã có trường views!');
      return;
    }
    
    console.log(`📊 Tìm thấy ${coursesWithoutViews.length} khóa học thiếu trường views`);
    
    // Update tất cả khóa học thiếu trường views
    const result = await Course.updateMany(
      { views: { $exists: false } },
      { $set: { views: 0 } }
    );
    
    console.log(`✅ Đã cập nhật ${result.modifiedCount} khóa học với trường views = 0`);
    
    // Kiểm tra lại
    const remainingCourses = await Course.find({ views: { $exists: false } });
    if (remainingCourses.length === 0) {
      console.log('✅ Hoàn thành! Tất cả khóa học đã có trường views');
    } else {
      console.log(`⚠️  Vẫn còn ${remainingCourses.length} khóa học thiếu trường views`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật trường views:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
updateCourseViews(); 