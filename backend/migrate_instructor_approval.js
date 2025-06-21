const mongoose = require('mongoose');
const User = require('./src/models/User');
const { Role } = require('./src/models/Role');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/edupro', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
});

async function migrateInstructorApproval() {
  try {
    console.log('Bắt đầu migration instructor_approval_status...');
    
    // Tìm role student và instructor
    const studentRole = await Role.findOne({ name: 'student' });
    const instructorRole = await Role.findOne({ name: 'instructor' });
    
    if (!studentRole || !instructorRole) {
      console.error('Không tìm thấy role student hoặc instructor');
      return;
    }
    
    // 1. Cập nhật tất cả user có approval_status thành instructor_approval_status
    const usersToUpdate = await User.find({
      $or: [
        { role_id: studentRole._id, approval_status: { $in: ['pending', 'approved', 'rejected'] } },
        { role_id: instructorRole._id, approval_status: { $in: ['pending', 'approved', 'rejected'] } }
      ]
    });
    
    console.log(`Tìm thấy ${usersToUpdate.length} user cần cập nhật instructor_approval_status`);
    
    for (const user of usersToUpdate) {
      // Copy approval_status sang instructor_approval_status
      user.instructor_approval_status = user.approval_status;
      await user.save();
      console.log(`Đã cập nhật user ${user.email}: ${user.approval_status} -> ${user.instructor_approval_status}`);
    }
    
    // 2. Cập nhật user có instructorInfo nhưng chưa có instructor_approval_status
    const usersWithInstructorInfo = await User.find({
      instructorInfo: { $exists: true, $ne: null },
      instructor_approval_status: null
    });
    
    console.log(`Tìm thấy ${usersWithInstructorInfo.length} user có instructorInfo cần cập nhật`);
    
    for (const user of usersWithInstructorInfo) {
      // Nếu có instructorInfo thì set instructor_approval_status = 'pending'
      user.instructor_approval_status = 'pending';
      await user.save();
      console.log(`Đã cập nhật user ${user.email}: instructor_approval_status = 'pending'`);
    }
    
    console.log('Migration hoàn thành!');
    
    // 3. Thống kê sau migration
    const stats = {
      totalPending: await User.countDocuments({ instructor_approval_status: 'pending' }),
      totalApproved: await User.countDocuments({ instructor_approval_status: 'approved' }),
      totalRejected: await User.countDocuments({ instructor_approval_status: 'rejected' }),
      totalNull: await User.countDocuments({ instructor_approval_status: null })
    };
    
    console.log('Thống kê sau migration:', stats);
    
  } catch (error) {
    console.error('Lỗi khi migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy migration
migrateInstructorApproval(); 