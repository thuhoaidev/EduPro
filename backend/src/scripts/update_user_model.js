const mongoose = require('mongoose');
const UserSchema = require('../models/UserSchema');

async function updateUserModel() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect('mongodb://localhost:27017/edu_pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Kết nối đến MongoDB thành công!');

    // Kiểm tra và cập nhật model User
    const User = mongoose.model('User', UserSchema);
    
    // Cập nhật các tài liệu hiện có
    await User.updateMany({}, { $set: { fullname: '$name' } });
    
    console.log('Đã cập nhật dữ liệu thành công!');
    
    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('Hoàn thành cập nhật!');
  } catch (error) {
    console.error('Lỗi khi cập nhật model:', error);
    process.exit(1);
  }
}

updateUserModel();
