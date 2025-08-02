const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('./src/models/User');
require('./src/models/Role');

const User = mongoose.model('User');

async function updateInstructorData(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối database thành công');

    const user = await User.findOne({ email }).populate('role_id');
    
    if (!user) {
      console.log('❌ Không tìm thấy user với email:', email);
      return;
    }

    console.log(`\n🔧 Đang cập nhật dữ liệu cho: ${user.fullname} (${user.email})`);

    // Cập nhật instructorInfo để đảm bảo tất cả trường đều có giá trị
    if (user.role_id?.name === 'instructor') {
      if (!user.instructorInfo) {
        user.instructorInfo = {};
      }

      // Đảm bảo instructor_profile_status có giá trị
      if (!user.instructorInfo.instructor_profile_status) {
        user.instructorInfo.instructor_profile_status = 'approved';
        console.log('📋 Cập nhật: instructor_profile_status -> approved');
      }

      // Đảm bảo is_approved có giá trị
      if (user.instructorInfo.is_approved === undefined || user.instructorInfo.is_approved === null) {
        user.instructorInfo.is_approved = true;
        console.log('✅ Cập nhật: is_approved -> true');
      }

      // Đảm bảo approval_date có giá trị
      if (!user.instructorInfo.approval_date) {
        user.instructorInfo.approval_date = new Date();
        console.log('📅 Cập nhật: approval_date -> now');
      }

      // Đảm bảo application_date có giá trị
      if (!user.instructorInfo.application_date) {
        user.instructorInfo.application_date = new Date();
        console.log('📅 Cập nhật: application_date -> now');
      }

      // Đảm bảo các trường khác có giá trị mặc định
      if (!user.instructorInfo.specializations) {
        user.instructorInfo.specializations = [];
      }

      if (!user.instructorInfo.certificates) {
        user.instructorInfo.certificates = [];
      }

      if (!user.instructorInfo.experience_years) {
        user.instructorInfo.experience_years = 0;
      }

      // Đánh dấu instructorInfo đã thay đổi
      user.markModified('instructorInfo');
      
      await user.save();
      console.log('💾 Đã lưu thay đổi thành công!');
    }

    // Kiểm tra lại sau khi cập nhật
    console.log('\n🔍 KIỂM TRA SAU KHI CẬP NHẬT:');
    console.log('----------------------------------------');
    console.log(`✅ Email Verified: ${user.email_verified}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`🔐 Approval Status: ${user.approval_status}`);
    
    if (user.role_id?.name === 'instructor' && user.instructorInfo) {
      console.log(`📋 Profile Status: ${user.instructorInfo.instructor_profile_status}`);
      console.log(`✅ Is Approved: ${user.instructorInfo.is_approved}`);
      console.log(`📅 Approval Date: ${user.instructorInfo.approval_date}`);
    }

    console.log('\n🎉 Hoàn thành! Tài khoản đã sẵn sàng đăng nhập.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Lấy email từ command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Vui lòng cung cấp email: node update_instructor_data.js <email>');
  process.exit(1);
}

updateInstructorData(email); 