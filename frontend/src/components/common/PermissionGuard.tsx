import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, PERMISSIONS } from '../../utils/permissionUtils';
import type { User as PermissionUser } from '../../utils/permissionUtils';

interface PermissionGuardProps {
  user: PermissionUser | null;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  user,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  // Check if user has the required permission(s)
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(user, permissions);
    } else {
      hasAccess = hasAnyPermission(user, permissions);
    }
  } else {
    // If no permission specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;

// Convenience components for common permission checks
export const UserManagementGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard user={user} permission={PERMISSIONS.MANAGE_USERS} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ContentManagementGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard 
    user={user} 
    permissions={[PERMISSIONS.MANAGE_COURSES, PERMISSIONS.MANAGE_BLOGS, PERMISSIONS.MANAGE_COMMENTS, PERMISSIONS.MANAGE_CATEGORIES]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const SystemManagementGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard 
    user={user} 
    permissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_VOUCHERS, PERMISSIONS.MANAGE_PAYMENTS, PERMISSIONS.MANAGE_REPORTS]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const StatisticsGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard 
    user={user} 
    permissions={[PERMISSIONS.VIEW_OVERVIEW_STATS, PERMISSIONS.VIEW_REVENUE_STATS, PERMISSIONS.VIEW_USER_STATS, PERMISSIONS.VIEW_COURSE_STATS]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContentModerationGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard 
    user={user} 
    permissions={[PERMISSIONS.APPROVE_BLOGS, PERMISSIONS.REJECT_BLOGS, PERMISSIONS.APPROVE_COMMENTS, PERMISSIONS.DELETE_COMMENTS]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ReportHandlingGuard: React.FC<{ user: PermissionUser | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <PermissionGuard 
    user={user} 
    permissions={[PERMISSIONS.VIEW_REPORTS, PERMISSIONS.HANDLE_REPORTS, PERMISSIONS.WARN_USERS]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
); 