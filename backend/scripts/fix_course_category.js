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

async function fixCourseCategory() {
  try {
    const slug = 'khoa-hoc-react-tu-co-ban-den-nang-cao';
    console.log(`🔧 Đang fix category cho khóa học: ${slug}`);
    
    // Tìm khóa học
    const course = await Course.findOne({ slug });
    if (!course) {
      console.log('❌ Không tìm thấy khóa học!');
      return;
    }
    
    console.log(`✅ Tìm thấy khóa học: ${course.title}`);
    console.log(`   Category ID hiện tại: ${course.category}`);
    
    // Kiểm tra category hiện tại
    const currentCategory = await Category.findById(course.category);
    if (currentCategory) {
      console.log(`✅ Category hiện tại tồn tại: ${currentCategory.name}`);
      return;
    }
    
    console.log('❌ Category hiện tại không tồn tại, đang tìm category phù hợp...');
    
    // Tìm category phù hợp (ví dụ: "Frontend Development" hoặc "React")
    let targetCategory = await Category.findOne({
      $or: [
        { name: { $regex: /react/i } },
        { name: { $regex: /frontend/i } },
        { name: { $regex: /javascript/i } },
        { name: { $regex: /web development/i } }
      ]
    });
    
    if (!targetCategory) {
      console.log('⚠️  Không tìm thấy category phù hợp, đang tạo category mới...');
      
      // Tạo category mới
      targetCategory = new Category({
        name: 'Frontend Development',
        description: 'Khóa học về phát triển giao diện người dùng',
        slug: 'frontend-development'
      });
      
      await targetCategory.save();
      console.log(`✅ Đã tạo category mới: ${targetCategory.name} (ID: ${targetCategory._id})`);
    } else {
      console.log(`✅ Tìm thấy category phù hợp: ${targetCategory.name} (ID: ${targetCategory._id})`);
    }
    
    // Cập nhật category cho khóa học
    course.category = targetCategory._id;
    await course.save();
    
    console.log(`✅ Đã cập nhật category cho khóa học thành công!`);
    console.log(`   Category mới: ${targetCategory.name} (ID: ${targetCategory._id})`);
    
    // Kiểm tra lại
    const updatedCourse = await Course.findOne({ slug }).populate('category', 'name');
    console.log(`✅ Kiểm tra lại: ${updatedCourse.category?.name || 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi fix category:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
fixCourseCategory(); 