require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

// Định nghĩa các roles mặc định
const defaultRoles = [
  {
    name: 'admin',
    description: 'Quản trị viên hệ thống',
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_courses',
      'manage_categories',
      'manage_quizzes',
      'manage_questions',
      'manage_announcements',
      'manage_reports',
      'manage_settings',
      'approve_courses',
      'approve_instructors',
      'view_statistics',
      'manage_moderators'
    ],
  },
  {
    name: 'moderator',
    description: 'Người kiểm duyệt nội dung',
    permissions: [
      'manage_courses',
      'manage_categories',
      'manage_quizzes',
      'manage_questions',
      'manage_announcements',
      'manage_reports',
      'approve_courses',
      'approve_instructors',
      'view_statistics'
    ],
  },
  {
    name: 'instructor',
    description: 'Giảng viên',
    permissions: [
      'create_courses',
      'edit_own_courses',
      'delete_own_courses',
      'create_quizzes',
      'edit_own_quizzes',
      'delete_own_quizzes',
      'create_questions',
      'edit_own_questions',
      'delete_own_questions',
      'view_own_statistics',
      'manage_own_announcements'
    ],
  },
  {
    name: 'student',
    description: 'Sinh viên',
    permissions: [
      'view_courses',
      'enroll_courses',
      'take_quizzes',
      'view_own_progress',
      'view_own_certificates',
      'create_discussions',
      'comment_on_discussions'
    ],
  },
  {
    name: 'guest',
    description: 'Khách',
    permissions: [
      'view_courses',
      'view_categories',
      'search_courses',
      'view_announcements'
    ],
  },
];

async function initRoles() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối đến MongoDB');

    // Tạo hoặc cập nhật roles
    for (const roleData of defaultRoles) {
      const role = await Role.findOneAndUpdate(
        { name: roleData.name },
        roleData,
        { upsert: true, new: true },
      );
      console.log(`Đã tạo/cập nhật role: ${role.name}`);
    }

    console.log('Khởi tạo roles thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo roles:', error);
  } finally {
    // Đóng kết nối MongoDB
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy hàm khởi tạo roles
initRoles(); 