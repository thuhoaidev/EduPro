const mongoose = require('mongoose');
const { Role } = require('../src/models/Role');
require('dotenv').config();

// Tất cả permissions từ frontend
const ALL_PERMISSIONS = [
  // User Management
  'quản lý người dùng',
  'phân quyền người dùng',
  'khóa mở người dùng',
  'duyệt giảng viên',
  
  // Content Management
  'quản lý khóa học',
  'quản lý bài viết',
  'quản lý bình luận',
  'quản lý danh mục',
  
  // System Management
  'quản lý vai trò',
  'quản lý voucher',
  'quản lý thanh toán',
  'quản lý báo cáo',
  
  // Statistics & Reports
  'xem thống kê tổng quan',
  'xem thống kê doanh thu',
  'xem thống kê người dùng',
  'xem thống kê khóa học',
  
  // Course Management (Instructor)
  'tạo khóa học',
  'chỉnh sửa khóa học',
  'xóa khóa học',
  'xuất bản khóa học',
  
  // Content Management (Instructor)
  'tạo bài học',
  'chỉnh sửa bài học',
  'xóa bài học',
  'upload video',
  'tạo quiz',
  'chỉnh sửa quiz',
  
  // Student Management
  'xem danh sách học viên',
  'xem tiến độ học viên',
  'gửi thông báo',
  
  // Income
  'xem thống kê thu nhập',
  'rút tiền',
  'xem lịch sử giao dịch',
  
  // Learning (Student)
  'xem khóa học',
  'đăng ký khóa học',
  'xem bài học',
  'làm quiz',
  'xem tiến độ',
  'tạo ghi chú',
  
  // Interaction
  'bình luận bài học',
  'đánh giá khóa học',
  'báo cáo vấn đề',
  
  // Community
  'xem bài viết',
  'bình luận bài viết',
  'thích lưu bài viết',
  
  // Certificate
  'xem chứng chỉ',
  'tải chứng chỉ',
  
  // Content Moderation
  'duyệt bài viết',
  'từ chối bài viết',
  'duyệt bình luận',
  'xóa bình luận',
  
  // Report Handling
  'xem báo cáo',
  'xử lý báo cáo',
  'cảnh cáo người dùng',
  
  // Community Management
  'quản lý từ khóa',
  'xem thống kê báo cáo',
  
  // Public View
  'xem khóa học công khai',
  'xem bài viết công khai',
  'tìm kiếm khóa học',
  'xem giảng viên',
];

async function setupAdminPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro');
    console.log('Connected to MongoDB');

    // Tìm hoặc tạo admin role
    let adminRole = await Role.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('Creating admin role...');
      adminRole = new Role({
        name: 'admin',
        description: 'Quản trị viên hệ thống',
        permissions: ALL_PERMISSIONS
      });
    } else {
      console.log('Updating admin role permissions...');
      adminRole.permissions = ALL_PERMISSIONS;
    }

    await adminRole.save();
    console.log('✅ Admin role updated with all permissions');
    console.log('Total permissions:', adminRole.permissions.length);

    // Tạo các role khác nếu chưa có
    const roles = [
      {
        name: 'instructor',
        description: 'Giảng viên',
        permissions: [
          'tạo khóa học', 'chỉnh sửa khóa học', 'xóa khóa học', 'xuất bản khóa học',
          'tạo bài học', 'chỉnh sửa bài học', 'xóa bài học', 'upload video',
          'tạo quiz', 'chỉnh sửa quiz', 'xem danh sách học viên', 'xem tiến độ học viên',
          'gửi thông báo', 'xem thống kê thu nhập', 'rút tiền', 'xem lịch sử giao dịch'
        ]
      },
      {
        name: 'student',
        description: 'Học viên',
        permissions: [
          'xem khóa học', 'đăng ký khóa học', 'xem bài học', 'làm quiz',
          'xem tiến độ', 'tạo ghi chú', 'bình luận bài học', 'đánh giá khóa học',
          'báo cáo vấn đề', 'xem bài viết', 'bình luận bài viết', 'thích lưu bài viết',
          'xem chứng chỉ', 'tải chứng chỉ', 'xem khóa học công khai', 'xem bài viết công khai',
          'tìm kiếm khóa học', 'xem giảng viên'
        ]
      },
      {
        name: 'moderator',
        description: 'Kiểm duyệt viên',
        permissions: [
          'duyệt bài viết', 'từ chối bài viết', 'duyệt bình luận', 'xóa bình luận',
          'xem báo cáo', 'xử lý báo cáo', 'cảnh cáo người dùng', 'quản lý từ khóa',
          'xem thống kê báo cáo'
        ]
      }
    ];

    for (const roleData of roles) {
      let role = await Role.findOne({ name: roleData.name });
      if (!role) {
        console.log(`Creating ${roleData.name} role...`);
        role = new Role(roleData);
        await role.save();
        console.log(`✅ Created ${roleData.name} role`);
      } else {
        console.log(`Updating ${roleData.name} role...`);
        role.permissions = roleData.permissions;
        await role.save();
        console.log(`✅ Updated ${roleData.name} role`);
      }
    }

    console.log('🎉 All roles and permissions setup completed!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupAdminPermissions(); 