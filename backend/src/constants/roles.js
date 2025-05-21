// Định nghĩa các role trong hệ thống
const ROLES = {
  ADMIN: 1, // Quản trị viên
  MODERATOR: 2, // Người kiểm duyệt
  INSTRUCTOR: 3, // Giảng viên
  STUDENT: 4, // Học viên
  GUEST: 5, // Khách (chưa đăng ký)
};

// Tên hiển thị của các role
const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.MODERATOR]: 'Người kiểm duyệt',
  [ROLES.INSTRUCTOR]: 'Giảng viên',
  [ROLES.STUDENT]: 'Học viên',
  [ROLES.GUEST]: 'Khách',
};

// Mô tả quyền của từng role
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users', // Quản lý người dùng
    'manage_courses', // Quản lý khóa học
    'manage_categories', // Quản lý danh mục
    'manage_roles', // Quản lý vai trò
    'manage_settings', // Quản lý cài đặt hệ thống
    'view_statistics', // Xem thống kê
  ],
  [ROLES.MODERATOR]: [
    'review_courses', // Kiểm duyệt khóa học
    'review_content', // Kiểm duyệt nội dung
    'manage_comments', // Quản lý bình luận
    'view_statistics', // Xem thống kê
  ],
  [ROLES.INSTRUCTOR]: [
    'create_courses', // Tạo khóa học
    'manage_own_courses', // Quản lý khóa học của mình
    'manage_students', // Quản lý học viên trong khóa học
    'create_content', // Tạo nội dung
  ],
  [ROLES.STUDENT]: [
    'enroll_courses', // Đăng ký khóa học
    'view_courses', // Xem khóa học
    'take_quizzes', // Làm bài kiểm tra
    'submit_assignments', // Nộp bài tập
    'participate_discussions', // Tham gia thảo luận
  ],
  [ROLES.GUEST]: [
    'view_courses', // Xem khóa học
    'view_categories', // Xem danh mục
    'search_courses', // Tìm kiếm khóa học
  ],
};

module.exports = {
  ROLES,
  ROLE_NAMES,
  ROLE_PERMISSIONS,
}; 