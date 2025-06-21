const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateSchema() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect('mongodb://localhost:27017/edu_pro', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    console.log('Kết nối đến MongoDB thành công!');

    // Lấy schema hiện tại
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
      console.log('Đã thêm trường fullname vào schema');
    }

    // Xóa trường name nếu tồn tại
    if (userSchema.path('name')) {
      userSchema.remove('name');
      console.log('Đã xóa trường name khỏi schema');
    }

    // Cập nhật các tài liệu hiện có
    await User.updateMany({}, { $set: { fullname: '$name' } });
    console.log('Đã cập nhật dữ liệu cho các tài liệu hiện có');

    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('Hoàn thành cập nhật schema!');
  } catch (error) {
    console.error('Lỗi khi cập nhật schema:', error);
    process.exit(1);
  }
}

updateSchema();
