const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');

async function updateCategoryCourseCounts() {
  try {
    console.log('🚀 Bắt đầu cập nhật số lượng khóa học cho các danh mục...');
    
    // Lấy tất cả danh mục active
    const categories = await Category.find({ status: 'active' });
    
    for (const category of categories) {
      // Đếm số khóa học trong danh mục này
      const courseCount = await Course.countDocuments({ 
        category: category._id,
        displayStatus: 'published' // Chỉ đếm khóa học đã publish
      });
      
      console.log(`📊 ${category.name}: ${courseCount} khóa học`);
      
      // Có thể lưu số lượng này vào database nếu cần
      // category.courseCount = courseCount;
      // await category.save();
    }
    
    // Hiển thị tổng kết
    const totalCourses = await Course.countDocuments({ displayStatus: 'published' });
    console.log(`\n📈 Tổng cộng: ${totalCourses} khóa học đã publish`);
    
    // Hiển thị danh mục có nhiều khóa học nhất
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Course.countDocuments({ 
          category: category._id,
          displayStatus: 'published'
        });
        return { name: category.name, count };
      })
    );
    
    categoryStats.sort((a, b) => b.count - a.count);
    
    console.log('\n🏆 Top danh mục có nhiều khóa học nhất:');
    categoryStats.slice(0, 5).forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.name}: ${stat.count} khóa học`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật số lượng khóa học:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
updateCategoryCourseCounts(); 