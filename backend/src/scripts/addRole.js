require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

// Role mới cần thêm
const newRole = {
  name: 'instructor', // Thay đổi tên role ở đây
  description: 'Giảng viên',
  permissions: {
    // Thêm các quyền cho role mới
    view_courses: true,
    create_courses: true,
    edit_courses: true,
    delete_courses: true,
    // Thêm các quyền khác tùy theo nhu cầu
  },
};

async function addRole() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối đến MongoDB');

    // Kiểm tra role đã tồn tại chưa
    const existingRole = await Role.findOne({ name: newRole.name });
    if (existingRole) {
      console.log(`Role "${newRole.name}" đã tồn tại`);
      return;
    }

    // Tạo role mới
    const role = await Role.create(newRole);
    console.log(`Đã thêm role mới: ${role.name}`);
    console.log('Thông tin role:', role);

  } catch (error) {
    console.error('Lỗi khi thêm role:', error);
  } finally {
    // Đóng kết nối MongoDB
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy hàm thêm role
addRole(); 