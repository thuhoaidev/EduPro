const mongoose = require('mongoose');
const User = require('../models/User');
const testUserSchema = require('../models/testUserSchema');

async function updateSchema() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect('mongodb://localhost:27017/edu_pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Kết nối đến MongoDB thành công!');

    // Lấy schema hiện tại
    const currentSchema = mongoose.model('User').schema;
    
    // Thêm trường fullname nếu chưa tồn tại
    if (!currentSchema.path('fullname')) {
      currentSchema.add(testUserSchema.obj);
      
      // Cập nhật pre-save hook
      currentSchema.pre('save', testUserSchema.preSave);
      
      console.log('Đã cập nhật schema thành công!');
    }

    // Cập nhật các tài liệu hiện có
    await User.updateMany({}, { $set: { fullname: '$name' } });
    
    console.log('Đã cập nhật dữ liệu thành công!');
    
    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('Hoàn thành cập nhật!');
  } catch (error) {
    console.error('Lỗi khi cập nhật schema:', error);
    process.exit(1);
  }
}

updateSchema();
