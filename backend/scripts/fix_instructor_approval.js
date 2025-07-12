const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../src/models/User');
const { Role } = require('../src/models/Role');

async function fixInstructorApproval() {
  try {
    console.log('🔧 Sửa lỗi trạng thái duyệt giảng viên...\n');

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.error('❌ Không tìm thấy role instructor');
      return;
    }

    // Tìm tất cả user có role instructor nhưng chưa được duyệt
    const instructorsToFix = await User.find({
      role_id: instructorRole._id,
      $or: [
        { 'instructorInfo.instructor_profile_status': { $ne: 'approved' } },
        { 'instructorInfo.is_approved': { $ne: true } },
        { 'instructorInfo': { $exists: false } }
      ]
    });

    console.log(`📊 Tìm thấy ${instructorsToFix.length} instructor cần sửa\n`);

    for (const instructor of instructorsToFix) {
      console.log(`👤 Đang sửa: ${instructor.fullname} (${instructor.email})`);
      
      // Tạo instructorInfo nếu chưa có
      if (!instructor.instructorInfo) {
        instructor.instructorInfo = {
          is_approved: true,
          instructor_profile_status: 'approved',
          approval_status: 'approved',
          experience_years: 0,
          specializations: [],
          application_date: new Date(),
          approval_date: new Date()
        };
        console.log(`   ✅ Tạo instructorInfo mới`);
      } else {
        // Cập nhật trạng thái
        instructor.instructorInfo.is_approved = true;
        instructor.instructorInfo.instructor_profile_status = 'approved';
        instructor.instructorInfo.approval_status = 'approved';
        instructor.instructorInfo.approval_date = new Date();
        console.log(`   ✅ Cập nhật trạng thái duyệt`);
      }

      // Cập nhật status của user
      instructor.status = 'active';
      instructor.approval_status = 'approved';
      
      // Đánh dấu instructorInfo đã thay đổi
      instructor.markModified('instructorInfo');
      
      await instructor.save();
      console.log(`   ✅ Đã lưu thay đổi`);
      console.log('---');
    }

    console.log(`\n🎉 Hoàn thành! Đã sửa ${instructorsToFix.length} instructor`);
    
    // Kiểm tra lại
    const allInstructors = await User.find({ role_id: instructorRole._id });
    const approvedCount = allInstructors.filter(i => 
      i.instructorInfo?.instructor_profile_status === 'approved' && 
      i.instructorInfo?.is_approved === true
    ).length;
    
    console.log(`📈 Tổng số instructor: ${allInstructors.length}`);
    console.log(`✅ Số instructor đã duyệt: ${approvedCount}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixInstructorApproval(); 