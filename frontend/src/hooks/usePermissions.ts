import { useAuth } from '../contexts/AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getUserRoleName,
  getUserRoleDisplayName,
  canManageUsers,
  canManageContent,
  canManageSystem,
  canViewStatistics,
  canModerateContent,
  canHandleReports,
  PERMISSIONS,
  MENU_PERMISSIONS,
} from '../utils/permissionUtils';

export const usePermissions = () => {
  const { user } = useAuth();

  // Create a simplified permission checking function that works with the actual user structure
  const hasPermissionSimple = (user: any, permission: string): boolean => {
    if (!user || !user.role_id) {
      return false;
    }
    
    // Get role name - handle both string and object formats
    const roleName = typeof user.role_id === 'string' ? user.role_id : user.role_id.name;
    
    // Admin has all permissions
    if (roleName === 'admin' || roleName === 'quản trị viên') {
      return true;
    }
    
    // Check if user has specific permission in role.permissions array
    if (user.role_id.permissions && Array.isArray(user.role_id.permissions)) {
      return user.role_id.permissions.includes(permission);
    }
    
    // No explicit permissions available; default deny
    return false;
  };

  const hasAnyPermissionSimple = (user: any, permissions: string[]): boolean => {
    return permissions.some(permission => hasPermissionSimple(user, permission));
  };

  const hasAllPermissionsSimple = (user: any, permissions: string[]): boolean => {
    return permissions.every(permission => hasPermissionSimple(user, permission));
  };

  const getUserRoleNameSimple = (user: any): string => {
    if (!user || !user.role) {
      return '';
    }
    return typeof user.role_id === 'string' ? user.role_id : user.role_id.name || '';
  };

  const getUserRoleDisplayNameSimple = (user: any): string => {
    const roleName = getUserRoleNameSimple(user);
    
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

  return {
    // Basic permission checks
    hasPermission: (permission: string) => hasPermissionSimple(user, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermissionSimple(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissionsSimple(user, permissions),
    
    // Route access - using MENU_PERMISSIONS
    canAccessRoute: (route: string) => {
      // Admin can access all routes
      const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      
      // Check specific permissions for the route
      const requiredPermissions = MENU_PERMISSIONS[route as keyof typeof MENU_PERMISSIONS];
      if (!requiredPermissions) {
        return true; // No permission required for this route
      }
      
      return hasAnyPermission(user, requiredPermissions);
    },
    
    // User info
    getUserPermissions: () => {
      // Return empty array for now since we don't have permission arrays
      return [];
    },
    getUserRoleName: () => getUserRoleNameSimple(user),
    getUserRoleDisplayName: () => getUserRoleDisplayNameSimple(user),
    
    // Specific permission checks - simplified
    canManageUsers: () => {
      // Admin luôn có quyền quản lý users
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_USERS);
    },
    canManageContent: () => {
      // Admin luôn có quyền quản lý content
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasAnyPermissionSimple(user, [
      PERMISSIONS.MANAGE_COURSES,
      PERMISSIONS.MANAGE_BLOGS,
      PERMISSIONS.MANAGE_COMMENTS,
      PERMISSIONS.MANAGE_CATEGORIES,
      ]);
    },
    canManageSystem: () => {
      // Admin luôn có quyền quản lý system
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasAnyPermissionSimple(user, [
      PERMISSIONS.MANAGE_ROLES,
      PERMISSIONS.MANAGE_VOUCHERS,
      PERMISSIONS.MANAGE_PAYMENTS,
      PERMISSIONS.MANAGE_REPORTS,
      ]);
    },
    canViewStatistics: () => {
      // Admin luôn có quyền xem statistics
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasAnyPermissionSimple(user, [
      PERMISSIONS.VIEW_OVERVIEW_STATS,
      PERMISSIONS.VIEW_REVENUE_STATS,
      PERMISSIONS.VIEW_USER_STATS,
      PERMISSIONS.VIEW_COURSE_STATS,
      ]);
    },
    canModerateContent: () => {
      // Admin và Moderator có quyền moderate content
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasAnyPermissionSimple(user, [
      PERMISSIONS.APPROVE_BLOGS,
      PERMISSIONS.REJECT_BLOGS,
      PERMISSIONS.APPROVE_COMMENTS,
      PERMISSIONS.DELETE_COMMENTS,
      ]);
    },
    canHandleReports: () => {
      // Admin và Moderator có quyền handle reports
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasAnyPermissionSimple(user, [
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.HANDLE_REPORTS,
      PERMISSIONS.WARN_USERS,
      ]);
    },
    
    // Common permission checks
    canManageCategories: () => {
      // Admin có quyền quản lý categories
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_CATEGORIES);
    },
    canManageCourses: () => {
      // Admin và Instructor có quyền quản lý courses
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'instructor' || roleName === 'giảng viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_COURSES);
    },
    canManageBlogs: () => {
      // Admin có quyền quản lý blogs
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_BLOGS);
    },
    canManageComments: () => {
      // Admin và Moderator có quyền quản lý comments
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_COMMENTS);
    },
    canManageRoles: () => {
      // Admin luôn có quyền quản lý roles
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      
      // Kiểm tra permission cụ thể cho các role khác
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_ROLES);
    },
    canManageVouchers: () => {
      // Admin có quyền quản lý vouchers
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_VOUCHERS);
    },
    canManagePayments: () => {
      // Admin có quyền quản lý payments
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_PAYMENTS);
    },
    canManageReports: () => {
      // Admin và Moderator có quyền quản lý reports
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_REPORTS);
    },
    canViewOwnOrders: () => {
      // Bất kỳ user đã đăng nhập nào cũng có quyền xem đơn hàng của chính mình
      return !!user;
    },
    canCancelOwnOrders: () => {
      // Bất kỳ user đã đăng nhập nào cũng có quyền hủy đơn hàng của chính mình
      return !!user;
    },
    canManageOrders: () => {
      // Admin có quyền quản lý tất cả đơn hàng
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.MANAGE_ORDERS);
    },
    canApproveInstructors: () => {
      // Admin có quyền approve instructors
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.APPROVE_INSTRUCTORS);
    },
    canViewOverviewStats: () => {
      // Admin có quyền xem overview stats
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.VIEW_OVERVIEW_STATS);
    },
    canViewRevenueStats: () => {
      // Admin có quyền xem revenue stats
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.VIEW_REVENUE_STATS);
    },
    canViewUserStats: () => {
      // Admin có quyền xem user stats
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.VIEW_USER_STATS);
    },
    canViewCourseStats: () => {
      // Admin và Instructor có quyền xem course stats
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'instructor' || roleName === 'giảng viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.VIEW_COURSE_STATS);
    },
    canApproveBlogs: () => {
      // Admin và Moderator có quyền approve blogs
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.APPROVE_BLOGS);
    },
    canRejectBlogs: () => {
      // Admin và Moderator có quyền reject blogs
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.REJECT_BLOGS);
    },
    canApproveComments: () => {
      // Admin và Moderator có quyền approve comments
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.APPROVE_COMMENTS);
    },
    canDeleteComments: () => {
      // Admin và Moderator có quyền delete comments
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.DELETE_COMMENTS);
    },
    canApproveCourses: () => {
      // Admin và Moderator có quyền approve courses
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.APPROVE_COURSES);
    },
    canViewReports: () => {
      // Admin và Moderator có quyền view reports
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.VIEW_REPORTS);
    },
    canWarnUsers: () => {
      // Admin và Moderator có quyền warn users
      const roleName = typeof user?.role_id === 'string' ? user.role_id : user?.role_id?.name;
      if (roleName === 'admin' || roleName === 'quản trị viên' || roleName === 'moderator' || roleName === 'kiểm duyệt viên') {
        return true;
      }
      return hasPermissionSimple(user, PERMISSIONS.WARN_USERS);
    },
    
    // Role checks
    isAdmin: () => getUserRoleNameSimple(user) === 'admin' || getUserRoleNameSimple(user) === 'quản trị viên',
    isInstructor: () => getUserRoleNameSimple(user) === 'instructor' || getUserRoleNameSimple(user) === 'giảng viên',
    isStudent: () => getUserRoleNameSimple(user) === 'student' || getUserRoleNameSimple(user) === 'học viên',
    isModerator: () => getUserRoleNameSimple(user) === 'moderator' || getUserRoleNameSimple(user) === 'kiểm duyệt viên',
    isGuest: () => getUserRoleNameSimple(user) === 'guest' || getUserRoleNameSimple(user) === 'khách',
    
    // User object
    user,
  };
}; 