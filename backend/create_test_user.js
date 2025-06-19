const mongoose = require('mongoose');
const User = require('./src/models/UserSchema');
const { Role } = require('./src/models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro');
    console.log('Connected to MongoDB');

    // Tìm role student
    const studentRole = await Role.findOne({ name: 'student' });
    
    if (!studentRole) {
      console.error('Không tìm thấy role student');
      return;
    }

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ email: 'student@example.com' });
    if (existingUser) {
      console.log('User đã tồn tại:', existingUser.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Tạo user mới
    const newUser = new User({
      email: 'student@example.com',
      password: hashedPassword,
      fullname: 'Student Test',
      nickname: 'student_test',
      role_id: studentRole._id,
      roles: ['student'],
      phone: '0123456789',
      dateOfBirth: '1995-01-01',
      address: 'Hà Nội, Việt Nam',
      avatar: null,
      social_links: {
        facebook: null,
        twitter: null,
        linkedin: null,
        github: null
      },
      instructorInfo: null,
      approval_status: null
    });

    await newUser.save();
    console.log('Đã tạo user test thành công:', newUser.email);

  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser(); 