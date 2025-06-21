const mongoose = require('mongoose');
const User = require('./src/models/User');
const { Role } = require('./src/models/Role');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/edupro', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
});

async function updateStudentApproval() {
  try {
    console.log('Bắt đầu cập nhật approval_status cho student...');
    
    // Tìm role student
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.error('Không tìm thấy role student');
      return;
    }
    
    // Tìm tất cả user có role student và approval_status là null
    const studentsToUpdate = await User.find({
      role_id: studentRole._id,
      approval_status: null
    });
    
    console.log(`Tìm thấy ${studentsToUpdate.length} tài khoản student cần cập nhật`);
    
    if (studentsToUpdate.length === 0) {
      console.log('Không có tài khoản nào cần cập nhật');
      return;
    }
    
    // Cập nhật approval_status thành 'approved'
    const result = await User.updateMany(
      {
        role_id: studentRole._id,
        approval_status: null
      },
      {
        $set: { approval_status: 'approved' }
      }
    );
    
    console.log(`Đã cập nhật ${result.modifiedCount} tài khoản student`);
    console.log('Cập nhật thành công!');
    
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy script
updateStudentApproval(); 