const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro';

async function deleteUserByEmail(email) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`Không tìm thấy user với email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  await User.deleteOne({ email });
  console.log(`Đã xóa user với email: ${email}`);
  await mongoose.disconnect();
}

// Nhận email từ dòng lệnh hoặc hardcode
const email = process.argv[2] || '';
if (!email) {
  console.log('Vui lòng truyền email cần xóa, ví dụ: node delete_user_by_email.js user@example.com');
  process.exit(1);
}
deleteUserByEmail(email); 