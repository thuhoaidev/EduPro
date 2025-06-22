const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Course = require('../src/models/Course');
const InstructorProfile = require('../src/models/InstructorProfile');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

async function checkRelatedData() {
  try {
    const slug = 'khoa-hoc-react-tu-co-ban-den-nang-cao';
    console.log(`🔍 Đang kiểm tra dữ liệu liên quan cho khóa học: ${slug}`);
    
    // Tìm khóa học
    const course = await Course.findOne({ slug });
    if (!course) {
      console.log('❌ Không tìm thấy khóa học!');
      return;
    }
    
    console.log(`✅ Tìm thấy khóa học: ${course.title}`);
    
    // Kiểm tra InstructorProfile
    console.log('\n👨‍🏫 Kiểm tra InstructorProfile...');
    const instructor = await InstructorProfile.findById(course.instructor);
    if (!instructor) {
      console.log('❌ Không tìm thấy InstructorProfile!');
      console.log(`   Instructor ID: ${course.instructor}`);
    } else {
      console.log('✅ Tìm thấy InstructorProfile:');
      console.log(`   - ID: ${instructor._id}`);
      console.log(`   - Status: ${instructor.status}`);
      console.log(`   - Is Approved: ${instructor.is_approved}`);
      
      // Kiểm tra User của instructor
      const user = await User.findById(instructor.user);
      if (!user) {
        console.log('❌ Không tìm thấy User của instructor!');
        console.log(`   User ID: ${instructor.user}`);
      } else {
        console.log('✅ Tìm thấy User của instructor:');
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Fullname: ${user.fullname}`);
        console.log(`   - Email: ${user.email}`);
      }
    }
    
    // Kiểm tra Category
    console.log('\n📂 Kiểm tra Category...');
    const category = await Category.findById(course.category);
    if (!category) {
      console.log('❌ Không tìm thấy Category!');
      console.log(`   Category ID: ${course.category}`);
    } else {
      console.log('✅ Tìm thấy Category:');
      console.log(`   - ID: ${category._id}`);
      console.log(`   - Name: ${category.name}`);
    }
    
    // Test populate
    console.log('\n🧪 Test populate...');
    try {
      const courseWithPopulate = await Course.findOne({ slug })
        .populate({
          path: 'instructor',
          populate: {
            path: 'user',
            select: 'fullname avatar'
          }
        })
        .populate('category', 'name');
      
      if (courseWithPopulate) {
        console.log('✅ Populate thành công!');
        console.log(`   - Instructor User: ${courseWithPopulate.instructor?.user?.fullname || 'N/A'}`);
        console.log(`   - Category: ${courseWithPopulate.category?.name || 'N/A'}`);
      } else {
        console.log('❌ Populate thất bại!');
      }
    } catch (populateError) {
      console.error('❌ Lỗi khi populate:', populateError.message);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu liên quan:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
checkRelatedData(); 