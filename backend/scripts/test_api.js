const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import tất cả models cần thiết
require('../src/models/Course');
require('../src/models/InstructorProfile');
require('../src/models/Category');
require('../src/models/User');

// Import Course model để sử dụng
const Course = require('../src/models/Course');

async function testAPI() {
  try {
    const slug = 'khoa-hoc-react-tu-co-ban-den-nang-cao';
    console.log(`🧪 Đang test API cho khóa học: ${slug}`);
    
    // Test tìm khóa học theo slug
    const course = await Course.findOne({ slug })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'fullname avatar'
        }
      })
      .populate('category', 'name');
    
    if (!course) {
      console.log('❌ Không tìm thấy khóa học!');
      return;
    }
    
    console.log('✅ Tìm thấy khóa học:');
    console.log(`   - ID: ${course._id}`);
    console.log(`   - Title: ${course.title}`);
    console.log(`   - Slug: ${course.slug}`);
    console.log(`   - Views: ${course.views}`);
    console.log(`   - Discount: ${course.discount}%`);
    console.log(`   - Category: ${course.category?.name || 'N/A'}`);
    console.log(`   - Instructor: ${course.instructor?.user?.fullname || 'N/A'}`);
    
    // Test tăng lượt xem
    console.log('\n📈 Đang test tăng lượt xem...');
    const oldViews = course.views;
    course.views = (course.views || 0) + 1;
    await course.save();
    
    console.log(`✅ Đã tăng lượt xem từ ${oldViews} lên ${course.views}`);
    
    // Test response format
    const response = {
      success: true,
      data: course
    };
    
    console.log('\n📤 Response format:');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('\n✅ API test thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi khi test API:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
testAPI(); 