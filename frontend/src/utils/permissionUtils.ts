// Permission utility functions for role-based access control

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role_id?: {
    name: string;
    description: string;
    permissions: string[];
  };
}

// Permission categories mapping
export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: 'Quản lý người dùng',
  CONTENT_MANAGEMENT: 'Quản lý nội dung',
  SYSTEM_MANAGEMENT: 'Quản lý hệ thống',
  STATISTICS_REPORTS: 'Thống kê và báo cáo',
  COURSE_MANAGEMENT: 'Quản lý khóa học',
  STUDENT_MANAGEMENT: 'Quản lý học viên',
  INCOME: 'Thu nhập',
  LEARNING: 'Học tập',
  INTERACTION: 'Tương tác',
  COMMUNITY: 'Cộng đồng',
  CERTIFICATE: 'Chứng chỉ',
  CONTENT_MODERATION: 'Duyệt nội dung',
  REPORT_HANDLING: 'Xử lý báo cáo',
  COMMUNITY_MANAGEMENT: 'Quản lý cộng đồng',
  PUBLIC_VIEW: 'Xem công khai',
} as const;

// Permission names mapping
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'quản lý người dùng',
  ASSIGN_ROLES: 'phân quyền người dùng',
  LOCK_UNLOCK_USERS: 'khóa mở người dùng',
  APPROVE_INSTRUCTORS: 'duyệt giảng viên',
  
  // Content Management
  MANAGE_COURSES: 'quản lý khóa học',
  MANAGE_BLOGS: 'quản lý bài viết',
  MANAGE_COMMENTS: 'quản lý bình luận',
  MANAGE_CATEGORIES: 'quản lý danh mục',
  
  // System Management
  MANAGE_ROLES: 'quản lý vai trò',
  MANAGE_VOUCHERS: 'quản lý voucher',
  MANAGE_PAYMENTS: 'quản lý thanh toán',
  MANAGE_REPORTS: 'quản lý báo cáo',
  
  // Statistics & Reports
  VIEW_OVERVIEW_STATS: 'xem thống kê tổng quan',
  VIEW_REVENUE_STATS: 'xem thống kê doanh thu',
  VIEW_USER_STATS: 'xem thống kê người dùng',
  VIEW_COURSE_STATS: 'xem thống kê khóa học',
  
  // Course Management (Instructor)
  CREATE_COURSE: 'tạo khóa học',
  EDIT_COURSE: 'chỉnh sửa khóa học',
  DELETE_COURSE: 'xóa khóa học',
  PUBLISH_COURSE: 'xuất bản khóa học',
  
  // Content Management (Instructor)
  CREATE_LESSON: 'tạo bài học',
  EDIT_LESSON: 'chỉnh sửa bài học',
  DELETE_LESSON: 'xóa bài học',
  UPLOAD_VIDEO: 'upload video',
  CREATE_QUIZ: 'tạo quiz',
  EDIT_QUIZ: 'chỉnh sửa quiz',
  
  // Student Management
  VIEW_STUDENTS: 'xem danh sách học viên',
  VIEW_STUDENT_PROGRESS: 'xem tiến độ học viên',
  SEND_NOTIFICATIONS: 'gửi thông báo',
  
  // Income
  VIEW_INCOME_STATS: 'xem thống kê thu nhập',
  WITHDRAW_MONEY: 'rút tiền',
  VIEW_TRANSACTION_HISTORY: 'xem lịch sử giao dịch',
  
  // Learning (Student)
  VIEW_COURSES: 'xem khóa học',
  ENROLL_COURSE: 'đăng ký khóa học',
  VIEW_LESSONS: 'xem bài học',
  TAKE_QUIZ: 'làm quiz',
  VIEW_PROGRESS: 'xem tiến độ',
  CREATE_NOTES: 'tạo ghi chú',
  
  // Interaction
  COMMENT_LESSONS: 'bình luận bài học',
  RATE_COURSE: 'đánh giá khóa học',
  REPORT_ISSUES: 'báo cáo vấn đề',
  
  // Community
  VIEW_BLOGS: 'xem bài viết',
  COMMENT_BLOGS: 'bình luận bài viết',
  LIKE_SAVE_BLOGS: 'thích lưu bài viết',
  
  // Certificate
  VIEW_CERTIFICATES: 'xem chứng chỉ',
  DOWNLOAD_CERTIFICATES: 'tải chứng chỉ',
  
  // Content Moderation
  APPROVE_BLOGS: 'duyệt bài viết',
  REJECT_BLOGS: 'từ chối bài viết',
  APPROVE_COMMENTS: 'duyệt bình luận',
  DELETE_COMMENTS: 'xóa bình luận',
  
  // Report Handling
  VIEW_REPORTS: 'xem báo cáo',
  HANDLE_REPORTS: 'xử lý báo cáo',
  WARN_USERS: 'cảnh cáo người dùng',
  
  // Community Management
  MANAGE_KEYWORDS: 'quản lý từ khóa',
  VIEW_REPORT_STATS: 'xem thống kê báo cáo',
  
  // Public View
  VIEW_PUBLIC_COURSES: 'xem khóa học công khai',
  VIEW_PUBLIC_BLOGS: 'xem bài viết công khai',
  SEARCH_COURSES: 'tìm kiếm khóa học',
  VIEW_INSTRUCTORS: 'xem giảng viên',
} as const;

// Menu permission mapping
export const MENU_PERMISSIONS = {
  // Dashboard
  '/admin': [PERMISSIONS.VIEW_OVERVIEW_STATS],
  
  // Content Management
  '/admin/categories': [PERMISSIONS.MANAGE_CATEGORIES],
  '/admin/courses': [PERMISSIONS.MANAGE_COURSES],
  '/admin/content-approval': [PERMISSIONS.APPROVE_BLOGS, PERMISSIONS.APPROVE_COMMENTS],
  
  // User Management
  '/admin/users': [PERMISSIONS.MANAGE_USERS],
  '/admin/instructors': [PERMISSIONS.APPROVE_INSTRUCTORS],
  '/admin/roles': [PERMISSIONS.MANAGE_ROLES],
  
  // Business & Finance
  '/admin/transactions': [PERMISSIONS.MANAGE_PAYMENTS],
  '/admin/vouchers': [PERMISSIONS.MANAGE_VOUCHERS],
  '/admin/earnings': [PERMISSIONS.VIEW_INCOME_STATS],
  '/admin/user-withdraw-requests': [PERMISSIONS.MANAGE_PAYMENTS],
  
  // Reports & Statistics
  '/admin/statistics': [PERMISSIONS.VIEW_OVERVIEW_STATS, PERMISSIONS.VIEW_REVENUE_STATS, PERMISSIONS.VIEW_USER_STATS, PERMISSIONS.VIEW_COURSE_STATS],
  '/admin/reports': [PERMISSIONS.MANAGE_REPORTS, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.HANDLE_REPORTS],
} as const;

// Permission checking functions
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.role_id || !user.role_id.permissions) {
    return false;
  }
  
  // Admin has all permissions
  if (user.role_id.name === 'admin' || user.role_id.name === 'quản trị viên') {
    return true;
  }
  
  return user.role_id.permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

export const canAccessRoute = (user: User | null, route: string): boolean => {
  const requiredPermissions = MENU_PERMISSIONS[route as keyof typeof MENU_PERMISSIONS];
  
  if (!requiredPermissions) {
    return true; // No permission required for this route
  }
  
  return hasAnyPermission(user, requiredPermissions);
};

export const canAccessMenu = (user: User | null, menuKey: string): boolean => {
  return canAccessRoute(user, menuKey);
};

// Role checking functions
export const hasRole = (user: User | null, roleName: string): boolean => {
  return user?.role_id?.name === roleName;
};

export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
  return !!user && roleNames.includes(user.role_id?.name || '');
};

// Get user's permissions
export const getUserPermissions = (user: User | null): string[] => {
  if (!user || !user.role_id || !user.role_id.permissions) {
    return [];
  }
  
  return user.role_id.permissions;
};

// Get user's role name
export const getUserRoleName = (user: User | null): string => {
  return user?.role_id?.name || '';
};

// Get user's role display name
export const getUserRoleDisplayName = (user: User | null): string => {
  const roleName = getUserRoleName(user);
  
  const roleDisplayNames: { [key: string]: string } = {
    'admin': 'Quản trị viên',
    'quản trị viên': 'Quản trị viên',
    'instructor': 'Giảng viên',
    'giảng viên': 'Giảng viên',
    'student': 'Học viên',
    'học viên': 'Học viên',
    'moderator': 'Kiểm duyệt viên',
    'kiểm duyệt viên': 'Kiểm duyệt viên',
    'guest': 'Khách',
    'khách': 'Khách',
  };
  
  return roleDisplayNames[roleName] || roleName;
};

// Check if user can perform specific actions
export const canManageUsers = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.MANAGE_USERS);
};

export const canManageContent = (user: User | null): boolean => {
  return hasAnyPermission(user, [
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_BLOGS,
    PERMISSIONS.MANAGE_COMMENTS,
    PERMISSIONS.MANAGE_CATEGORIES,
  ]);
};

export const canManageSystem = (user: User | null): boolean => {
  return hasAnyPermission(user, [
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_VOUCHERS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_REPORTS,
  ]);
};

export const canViewStatistics = (user: User | null): boolean => {
  return hasAnyPermission(user, [
    PERMISSIONS.VIEW_OVERVIEW_STATS,
    PERMISSIONS.VIEW_REVENUE_STATS,
    PERMISSIONS.VIEW_USER_STATS,
    PERMISSIONS.VIEW_COURSE_STATS,
  ]);
};

export const canModerateContent = (user: User | null): boolean => {
  return hasAnyPermission(user, [
    PERMISSIONS.APPROVE_BLOGS,
    PERMISSIONS.REJECT_BLOGS,
    PERMISSIONS.APPROVE_COMMENTS,
    PERMISSIONS.DELETE_COMMENTS,
  ]);
};

export const canHandleReports = (user: User | null): boolean => {
  return hasAnyPermission(user, [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.HANDLE_REPORTS,
    PERMISSIONS.WARN_USERS,
  ]);
};

// Filter menu items based on permissions
export const filterMenuItemsByPermissions = (menuItems: any[], user: User | null): any[] => {
  console.log('=== FILTER MENU ITEMS ===');
  console.log('User:', user);
  console.log('User role_id:', user?.role_id);
  console.log('User role name:', user?.role_id?.name);
  console.log('User role permissions:', user?.role_id?.permissions);
  
  const filteredItems = menuItems.filter(item => {
    // Check if item has children
    if (item.children) {
      const filteredChildren = filterMenuItemsByPermissions(item.children, user);
      if (filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return false;
    }
    
    // Check if item has a key (route)
    if (item.key) {
      const canAccess = canAccessMenu(user, item.key);
      console.log(`Route ${item.key}: ${canAccess}`);
      return canAccess;
    }
    
    // If no key, allow the item (group headers, etc.)
    return true;
  }).filter(Boolean);
  
  console.log('Filtered items:', filteredItems);
  console.log('=== END FILTER ===');
  return filteredItems;
}; 