const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Course = require('../src/models/Course');
const Category = require('../src/models/Category');

async function fixCourseSimple() {
  try {
    const slug = 'khoa-hoc-react-tu-co-ban-den-nang-cao';
    console.log(`🔧 Đang fix dữ liệu cho khóa học: ${slug}`);
    
    // Tìm khóa học
    const course = await Course.findOne({ slug });
    if (!course) {
      console.log('❌ Không tìm thấy khóa học!');
      return;
    }
    
    console.log(`✅ Tìm thấy khóa học: ${course.title}`);
    console.log(`   Category ID hiện tại: ${course.category}`);
    console.log(`   Discount hiện tại: ${course.discount}%`);
    
    // Fix discount nếu vượt quá 100%
    if (course.discount > 100) {
      console.log(`⚠️  Discount ${course.discount}% vượt quá 100%, đang fix thành 50%...`);
      course.discount = 50;
    }
    
    // Fix category - tạo category mới nếu cần
    let targetCategory = await Category.findById(course.category);
    if (!targetCategory) {
      console.log('❌ Category hiện tại không tồn tại, đang tạo category mới...');
      
      targetCategory = new Category({
        name: 'Frontend Development',
        description: 'Khóa học về phát triển giao diện người dùng',
        slug: 'frontend-development'
      });
      
      await targetCategory.save();
      console.log(`✅ Đã tạo category mới: ${targetCategory.name} (ID: ${targetCategory._id})`);
      
      course.category = targetCategory._id;
    }
    
    // Lưu thay đổi
    await course.save();
    
    console.log(`✅ Đã fix dữ liệu khóa học thành công!`);
    console.log(`   Category ID: ${course.category}`);
    console.log(`   Discount: ${course.discount}%`);
    
  } catch (error) {
    console.error('❌ Lỗi khi fix dữ liệu khóa học:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
fixCourseSimple(); 