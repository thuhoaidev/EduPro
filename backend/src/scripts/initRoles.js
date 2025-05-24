require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

// Định nghĩa các roles mặc định
const defaultRoles = [
  {
    name: 'student',
    description: 'Học viên',
    permissions: {
      view_courses: true,
      enroll_courses: true,
      take_quizzes: true,
      view_own_progress: true,
      view_own_certificates: true,
      create_discussions: true,
      comment_on_discussions: true,
    },
  },
  {
    name: 'instructor',
    description: 'Giảng viên',
    permissions: {
      create_courses: true,
      edit_own_courses: true,
      delete_own_courses: true,
      create_quizzes: true,
      edit_own_quizzes: true,
      delete_own_quizzes: true,
      create_questions: true,
      edit_own_questions: true,
      delete_own_questions: true,
      view_own_statistics: true,
      manage_own_announcements: true,
    },
  },
  {
    name: 'moderator',
    description: 'Người kiểm duyệt nội dung',
    permissions: {
      manage_courses: true,
      manage_categories: true,
      manage_quizzes: true,
      manage_questions: true,
      manage_announcements: true,
      manage_reports: true,
      approve_courses: true,
      approve_instructors: true,
      view_statistics: true,
    },
  },
  {
    name: 'admin',
    description: 'Quản trị viên hệ thống',
    permissions: {
      manage_users: true,
      manage_roles: true,
      manage_courses: true,
      manage_categories: true,
      manage_quizzes: true,
      manage_questions: true,
      manage_announcements: true,
      manage_reports: true,
      manage_settings: true,
      approve_courses: true,
      approve_instructors: true,
      view_statistics: true,
      manage_moderators: true,
    },
  },
  {
    name: 'guest',
    description: 'Khách',
    permissions: {
      view_courses: true,
      view_categories: true,
      search_courses: true,
      view_announcements: true,
    },
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

// Chạy hàm khởi tạo
initRoles(); 