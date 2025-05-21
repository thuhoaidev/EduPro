// Định nghĩa các role trong hệ thống
export const ROLES = {
  ADMIN: 1, // Quản trị viên
  MODERATOR: 2, // Người kiểm duyệt
  INSTRUCTOR: 3, // Giảng viên
  STUDENT: 4, // Học viên
  GUEST: 5, // Khách (chưa đăng ký)
};

// Tên hiển thị của các role
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.MODERATOR]: 'Điều hành viên',
  [ROLES.INSTRUCTOR]: 'Giảng viên',
  [ROLES.STUDENT]: 'Học viên',
  [ROLES.GUEST]: 'Khách',
};

// Mô tả quyền của từng role
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users', // Quản lý người dùng
    'manage_courses', // Quản lý khóa học
    'manage_categories', // Quản lý danh mục
    'manage_roles', // Quản lý vai trò
    'view_statistics', // Xem thống kê
    'manage_settings', // Quản lý cài đặt hệ thống
  ],
  [ROLES.MODERATOR]: [
    'review_courses', // Kiểm duyệt khóa học
    'review_content', // Kiểm duyệt nội dung
    'manage_comments', // Quản lý bình luận
    'view_statistics', // Xem thống kê
  ],
  [ROLES.INSTRUCTOR]: [
    'create_courses', // Tạo khóa học
    'edit_own_courses',
    'manage_own_courses', // Quản lý khóa học của mình
    'view_own_statistics',
  ],
  [ROLES.STUDENT]: [
    'enroll_courses', // Đăng ký khóa học
    'view_courses', // Xem khóa học
    'submit_assignments', // Nộp bài tập
    'view_own_progress',
  ],
  [ROLES.GUEST]: [
    'view_public_courses',
    'view_public_content',
  ],
};

// Kiểm tra xem role có quyền thực hiện một hành động không
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Kiểm tra xem role có bất kỳ quyền nào trong danh sách không
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Kiểm tra xem role có tất cả các quyền trong danh sách không
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

// Kiểm tra xem role có phải là một trong các role được chỉ định không
export const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Hàm kiểm tra một trong các role
export const hasAnyRole = (userRole, roles) => {
  return roles.includes(userRole);
}; 