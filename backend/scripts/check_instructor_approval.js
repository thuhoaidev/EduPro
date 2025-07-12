const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../src/models/User');
const Role = require('../src/models/Role');

async function checkInstructorApproval() {
  try {
    console.log('🔍 Kiểm tra trạng thái duyệt giảng viên...\n');

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.error('❌ Không tìm thấy role instructor');
      return;
    }

    // Tìm tất cả user có role instructor
    const instructors = await User.find({ role_id: instructorRole._id }).populate('role_id');
    console.log(`📊 Tìm thấy ${instructors.length} user có role instructor\n`);

    for (const instructor of instructors) {
      console.log(`👤 User: ${instructor.fullname} (${instructor.email})`);
      console.log(`   Role: ${instructor.role_id?.name}`);
      console.log(`   Status: ${instructor.status}`);
      console.log(`   Approval Status: ${instructor.approval_status}`);
      
      if (instructor.instructorInfo) {
        console.log(`   Instructor Info:`);
        console.log(`     - is_approved: ${instructor.instructorInfo.is_approved}`);
        console.log(`     - instructor_profile_status: ${instructor.instructorInfo.instructor_profile_status}`);
        console.log(`     - approval_status: ${instructor.instructorInfo.approval_status}`);
      } else {
        console.log(`   ❌ Không có instructorInfo`);
      }

      // Kiểm tra xem có thể truy cập API /courses/instructor không
      const canAccess = instructor.instructorInfo?.instructor_profile_status === 'approved' && 
                       instructor.instructorInfo?.is_approved === true;
      
      console.log(`   🔐 Có thể truy cập /courses/instructor: ${canAccess ? '✅ Có' : '❌ Không'}`);
      
      if (!canAccess) {
        console.log(`   🔧 Cần sửa: Cập nhật instructor_profile_status = 'approved' và is_approved = true`);
        
        // Hỏi người dùng có muốn sửa không
        // Trong thực tế, bạn có thể tự động sửa hoặc tạo UI để admin sửa
      }
      
      console.log('---');
    }

    console.log('\n✅ Hoàn thành kiểm tra!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkInstructorApproval(); 