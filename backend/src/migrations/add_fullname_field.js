const mongoose = require('mongoose');
const User = require('../models/User');

async function addFullnameField() {
  try {
    // Kiểm tra xem trường fullname đã tồn tại chưa
    const userSchema = mongoose.model('User').schema;
    if (!userSchema.path('fullname')) {
      // Thêm trường fullname vào schema
      userSchema.add({
        fullname: {
          type: String,
          required: [true, 'Họ và tên là bắt buộc'],
          trim: true,
          minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
        }
      });

      // Cập nhật các tài liệu hiện có
      await User.updateMany({}, { $set: { fullname: '$name' } });
      
      console.log('Đã thêm trường fullname vào schema và cập nhật dữ liệu thành công!');
    } else {
      console.log('Trường fullname đã tồn tại trong schema.');
    }
  } catch (error) {
    console.error('Lỗi khi thêm trường fullname:', error);
    throw error;
  }
}

module.exports = addFullnameField;
