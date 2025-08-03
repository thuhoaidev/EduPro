const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('./src/models/User');
require('./src/models/Role');

const User = mongoose.model('User');

async function checkUserStatus(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối database thành công');

    const user = await User.findOne({ email }).populate('role_id');
    
    if (!user) {
      console.log('❌ Không tìm thấy user với email:', email);
      return;
    }

    console.log('\n📋 THÔNG TIN TÀI KHOẢN:');
    console.log('----------------------------------------');
    console.log(`👤 Tên: ${user.fullname}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role: ${user.role_id?.name || 'N/A'}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`✅ Email Verified: ${user.email_verified}`);
    console.log(`🔐 Approval Status: ${user.approval_status}`);

    if (user.role_id?.name === 'instructor') {
      console.log('\n👨‍🏫 THÔNG TIN GIẢNG VIÊN:');
      console.log('----------------------------------------');
      console.log(`📝 Instructor Info:`, user.instructorInfo ? 'Có' : 'Không có');
      
      if (user.instructorInfo) {
        console.log(`📋 Profile Status: ${user.instructorInfo.instructor_profile_status || 'N/A'}`);
        console.log(`✅ Is Approved: ${user.instructorInfo.is_approved || false}`);
        console.log(`📅 Application Date: ${user.instructorInfo.application_date || 'N/A'}`);
        console.log(`📅 Approval Date: ${user.instructorInfo.approval_date || 'N/A'}`);
        console.log(`❌ Rejection Reason: ${user.instructorInfo.rejection_reason || 'N/A'}`);
      }
    }

    console.log('\n🔍 PHÂN TÍCH LỖI ĐĂNG NHẬP:');
    console.log('----------------------------------------');
    
    if (!user.email_verified) {
      console.log('❌ LỖI: Email chưa được xác thực');
    }
    
    if (user.status === 'blocked') {
      console.log('❌ LỖI: Tài khoản đã bị khóa');
    }
    
    if (user.role_id?.name === 'instructor') {
      const profileStatus = user.instructorInfo?.instructor_profile_status;
      
      if (profileStatus === 'pending') {
        console.log('❌ LỖI: Tài khoản giảng viên đang chờ duyệt');
      } else if (profileStatus === 'rejected') {
        console.log('❌ LỖI: Tài khoản giảng viên bị từ chối');
      } else if (profileStatus !== 'approved') {
        console.log('❌ LỖI: Tài khoản giảng viên chưa được duyệt');
      }
      
      if (user.status !== 'active') {
        console.log('❌ LỖI: Tài khoản giảng viên chưa được kích hoạt');
      }
    }

    console.log('\n✅ Tài khoản có thể đăng nhập nếu không có lỗi nào ở trên');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Lấy email từ command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Vui lòng cung cấp email: node check_user_status.js <email>');
  process.exit(1);
}

checkUserStatus(email); 