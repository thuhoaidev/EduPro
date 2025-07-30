// Debug script để kiểm tra user data
export const debugUserData = (user: any) => {
  console.log('=== DEBUG USER DATA ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('User role type:', typeof user?.role);
  console.log('User role name:', user?.role?.name);
  console.log('User role permissions:', user?.role?.permissions);
  console.log('User role permissions length:', user?.role?.permissions?.length);
  console.log('=== END DEBUG ===');
};

export const debugPermissionCheck = (user: any, permission: string) => {
  console.log('=== DEBUG PERMISSION CHECK ===');
  console.log('Checking permission:', permission);
  console.log('User role name:', user?.role?.name);
  console.log('User role permissions:', user?.role?.permissions);
  console.log('Has permission:', user?.role?.permissions?.includes(permission));
  console.log('=== END DEBUG ===');
}; 