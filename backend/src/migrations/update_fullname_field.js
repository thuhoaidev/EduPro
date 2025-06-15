const mongoose = require('mongoose');
const User = require('../models/User');

async function updateFullnameField() {
  try {
    // Kiểm tra và cập nhật schema
    const userSchema = mongoose.model('User').schema;
    
    // Thêm trường fullname nếu chưa tồn tại
    if (!userSchema.path('fullname')) {
      userSchema.add({
        fullname: {
          type: String,
          required: [true, 'Họ và tên là bắt buộc'],
          trim: true,
          minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
        }
      });
    }

    // Cập nhật các tài liệu hiện có
    await User.updateMany({}, { $set: { fullname: '$name' } });
    
    console.log('Đã cập nhật schema và dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi cập nhật schema:', error);
    throw error;
  }
}

module.exports = updateFullnameField;
