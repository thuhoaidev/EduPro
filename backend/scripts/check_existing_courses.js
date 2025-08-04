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

async function checkExistingCourses() {
  try {
    console.log('🔍 Kiểm tra tất cả khóa học trong database...\n');
    
    // Lấy tất cả khóa học
    const allCourses = await Course.find({}).populate('category', 'name');
    
    console.log(`📊 Tổng cộng: ${allCourses.length} khóa học trong database\n`);
    
    if (allCourses.length === 0) {
      console.log('❌ Không có khóa học nào trong database');
      return;
    }
    
    // Phân loại theo trạng thái
    const publishedCourses = allCourses.filter(course => course.displayStatus === 'published');
    const draftCourses = allCourses.filter(course => course.status === 'draft');
    const pendingCourses = allCourses.filter(course => course.status === 'pending');
    const approvedCourses = allCourses.filter(course => course.status === 'approved');
    const rejectedCourses = allCourses.filter(course => course.status === 'rejected');
    
    console.log('📈 Thống kê theo trạng thái:');
    console.log(`   - Đã publish: ${publishedCourses.length}`);
    console.log(`   - Draft: ${draftCourses.length}`);
    console.log(`   - Pending: ${pendingCourses.length}`);
    console.log(`   - Approved: ${approvedCourses.length}`);
    console.log(`   - Rejected: ${rejectedCourses.length}\n`);
    
    // Hiển thị chi tiết từng khóa học
    console.log('📋 Chi tiết tất cả khóa học:');
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   - Slug: ${course.slug}`);
      console.log(`   - Category: ${course.category?.name || 'N/A'}`);
      console.log(`   - Status: ${course.status}`);
      console.log(`   - Display Status: ${course.displayStatus}`);
      console.log(`   - Price: ${course.price?.toLocaleString('vi-VN')} ₫`);
      console.log(`   - Instructor: ${course.instructor}`);
      console.log(`   - Created: ${course.createdAt?.toLocaleDateString('vi-VN')}`);
      console.log('');
    });
    
    // Kiểm tra khóa học theo danh mục
    console.log('🏷️  Khóa học theo danh mục:');
    const categories = await Category.find({ status: 'active' });
    
    for (const category of categories) {
      const coursesInCategory = allCourses.filter(course => 
        course.category && course.category._id.toString() === category._id.toString()
      );
      
      if (coursesInCategory.length > 0) {
        console.log(`\n${category.name} (${coursesInCategory.length} khóa học):`);
        coursesInCategory.forEach(course => {
          console.log(`   - ${course.title} (${course.displayStatus})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra khóa học:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
checkExistingCourses(); 