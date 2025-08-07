const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function fixInstructorLogin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối database thành công');

    const user = await User.findOne({ email }).populate('role_id');
    
    if (!user) {
      console.log('❌ Không tìm thấy user với email:', email);
      return;
    }

    console.log(`\n🔧 Đang sửa tài khoản: ${user.fullname} (${user.email})`);

    let hasChanges = false;

    // 1. Kiểm tra và sửa email verification
    if (!user.email_verified) {
      console.log('📧 Sửa: Email verification -> true');
      user.email_verified = true;
      hasChanges = true;
    }

    // 2. Kiểm tra và sửa status
    if (user.status !== 'active') {
      console.log(`📊 Sửa: Status ${user.status} -> active`);
      user.status = 'active';
      hasChanges = true;
    }

    // 3. Kiểm tra và sửa approval_status
    if (user.approval_status !== 'approved') {
      console.log(`🔐 Sửa: Approval status ${user.approval_status} -> approved`);
      user.approval_status = 'approved';
      hasChanges = true;
    }

    // 4. Nếu là instructor, sửa instructorInfo
    if (user.role_id?.name === 'instructor') {
      console.log('👨‍🏫 Đang sửa thông tin giảng viên...');
      
      // Tạo instructorInfo nếu chưa có
      if (!user.instructorInfo) {
        console.log('📝 Tạo: InstructorInfo mới');
        user.instructorInfo = {
          is_approved: true,
          instructor_profile_status: 'approved',
          experience_years: 0,
          specializations: [],
          application_date: new Date(),
          approval_date: new Date()
        };
        hasChanges = true;
      } else {
        // Sửa các trường trong instructorInfo
        if (user.instructorInfo.instructor_profile_status !== 'approved') {
          console.log(`📋 Sửa: Profile status ${user.instructorInfo.instructor_profile_status} -> approved`);
          user.instructorInfo.instructor_profile_status = 'approved';
          hasChanges = true;
        }
        
        if (!user.instructorInfo.is_approved) {
          console.log('✅ Sửa: Is approved -> true');
          user.instructorInfo.is_approved = true;
          hasChanges = true;
        }
        
        if (!user.instructorInfo.approval_date) {
          console.log('📅 Tạo: Approval date');
          user.instructorInfo.approval_date = new Date();
          hasChanges = true;
        }
      }
      
      // Đánh dấu instructorInfo đã thay đổi
      if (hasChanges) {
        user.markModified('instructorInfo');
      }
    }

    // Lưu thay đổi nếu có
    if (hasChanges) {
      await user.save();
      console.log('💾 Đã lưu thay đổi thành công!');
    } else {
      console.log('✅ Tài khoản đã ổn, không cần sửa gì');
    }

    // Kiểm tra lại sau khi sửa
    console.log('\n🔍 KIỂM TRA SAU KHI SỬA:');
    console.log('----------------------------------------');
    console.log(`✅ Email Verified: ${user.email_verified}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`🔐 Approval Status: ${user.approval_status}`);
    
    if (user.role_id?.name === 'instructor' && user.instructorInfo) {
      console.log(`📋 Profile Status: ${user.instructorInfo.instructor_profile_status}`);
      console.log(`✅ Is Approved: ${user.instructorInfo.is_approved}`);
    }

    console.log('\n🎉 Hoàn thành! Tài khoản đã có thể đăng nhập.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Lấy email từ command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Vui lòng cung cấp email: node fix_instructor_login.js <email>');
  process.exit(1);
}

fixInstructorLogin(email); 