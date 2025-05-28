require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

// Role admin với ID cụ thể
const ADMIN_ROLE_ID = '6835811657b08ab76bfef9d7';
const adminRole = {
  _id: new mongoose.Types.ObjectId(ADMIN_ROLE_ID),
  name: 'admin',
  description: 'Quản trị viên hệ thống',
  permissions: [
    // Quản lý người dùng
    'manage_users',
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'ban_users',
    'unban_users',
    // Quản lý vai trò
    'manage_roles',
    'view_roles',
    'assign_roles',
    // Quản lý khóa học
    'manage_courses',
    'view_courses',
    'create_courses',
    'edit_courses',
    'delete_courses',
    'approve_courses',
    // Quản lý danh mục
    'manage_categories',
    'view_categories',
    'create_categories',
    'edit_categories',
    'delete_categories',
    // Quản lý bài kiểm tra
    'manage_quizzes',
    'view_quizzes',
    'create_quizzes',
    'edit_quizzes',
    'delete_quizzes',
    // Quản lý câu hỏi
    'manage_questions',
    'view_questions',
    'create_questions',
    'edit_questions',
    'delete_questions',
    // Quản lý thông báo
    'manage_announcements',
    'view_announcements',
    'create_announcements',
    'edit_announcements',
    'delete_announcements',
    // Quản lý báo cáo
    'manage_reports',
    'view_reports',
    'handle_reports',
    // Quản lý cài đặt
    'manage_settings',
    'view_settings',
    'edit_settings',
    // Quản lý giảng viên
    'manage_instructors',
    'view_instructors',
    'approve_instructors',
    'reject_instructors',
    // Quản lý người kiểm duyệt
    'manage_moderators',
    'view_moderators',
    'assign_moderators',
    // Xem thống kê
    'view_statistics',
    'view_user_statistics',
    'view_course_statistics',
    'view_revenue_statistics',
  ],
};

async function addAdminRole() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối đến MongoDB');

    // Kiểm tra role admin đã tồn tại chưa
    let role = await Role.findById(ADMIN_ROLE_ID);
    if (role) {
      // Nếu đã tồn tại, cập nhật quyền
      role.permissions = adminRole.permissions;
      role.description = adminRole.description;
      await role.save();
      console.log(`Đã cập nhật role "${adminRole.name}" với ${adminRole.permissions.length} quyền`);
    } else {
      // Nếu chưa tồn tại, tạo mới với ID cụ thể
      role = await Role.create(adminRole);
      console.log(`Đã tạo role "${role.name}" với ID ${role._id} và ${role.permissions.length} quyền`);
    }

    // Cập nhật role cho user admin
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@edupro.com' },
      { 
        $set: { 
          role_id: role._id,
          status: 'active',
          email_verified: true,
          approval_status: 'approved',
        },
      },
      { new: true },
    );

    if (!adminUser) {
      console.log('Không tìm thấy user admin');
    } else {
      console.log('Đã cập nhật role cho user admin:', adminUser.email);
    }

    // In thông tin role admin và users
    const populatedRole = await Role.findById(role._id).populate('users');
    console.log('\nThông tin role admin:');
    console.log('ID:', populatedRole._id);
    console.log('Name:', populatedRole.name);
    console.log('Description:', populatedRole.description);
    console.log('Created at:', populatedRole.created_at);
    console.log('\nDanh sách quyền:');
    populatedRole.permissions.forEach((permission, index) => {
      console.log(`${index + 1}. ${permission}`);
    });
    console.log('\nDanh sách users có role này:');
    if (populatedRole.users && populatedRole.users.length > 0) {
      populatedRole.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.name})`);
      });
    } else {
      console.log('Chưa có user nào được gán role này');
    }

  } catch (error) {
    console.error('Lỗi khi thêm/cập nhật role admin:', error);
  } finally {
    // Đóng kết nối MongoDB
    await mongoose.connection.close();
    console.log('\nĐã đóng kết nối MongoDB');
  }
}

// Chạy hàm thêm role admin
addAdminRole(); 