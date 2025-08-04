# Hệ thống phân quyền EduPro

## Tổng quan

Hệ thống phân quyền EduPro được thiết kế để quản lý quyền truy cập một cách linh hoạt và bảo mật. Hệ thống này cho phép:

- Phân quyền chi tiết cho từng chức năng
- Kiểm soát truy cập menu và route
- Bảo vệ component theo quyền hạn
- Quản lý vai trò và quyền hạn dễ dàng

## Cấu trúc hệ thống

### 1. Permission Utils (`frontend/src/utils/permissionUtils.ts`)

File này chứa tất cả logic phân quyền cốt lõi:

#### Interfaces
```typescript
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
}
```

#### Permission Categories
```typescript
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
}
```

#### Permission Names
```typescript
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
  
  // ... và nhiều quyền khác
}
```

### 2. Menu Permission Mapping

```typescript
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
  
  // ... và nhiều route khác
}
```

## Cách sử dụng

### 1. Sử dụng Hook usePermissions

```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    hasPermission, 
    canManageUsers, 
    canManageContent,
    isAdmin,
    user 
  } = usePermissions();

  // Kiểm tra quyền cụ thể
  if (!hasPermission('quản lý người dùng')) {
    return <div>Không có quyền truy cập</div>;
  }

  // Kiểm tra nhóm quyền
  if (!canManageUsers()) {
    return <div>Không có quyền quản lý người dùng</div>;
  }

  // Kiểm tra vai trò
  if (isAdmin()) {
    return <div>Chỉ admin mới thấy</div>;
  }

  return <div>Nội dung được bảo vệ</div>;
};
```

### 2. Sử dụng PermissionGuard Component

```typescript
import PermissionGuard from '../components/common/PermissionGuard';

const MyComponent = () => {
  return (
    <PermissionGuard
      permission="quản lý người dùng"
      fallback={<div>Không có quyền truy cập</div>}
    >
      <div>Nội dung được bảo vệ</div>
    </PermissionGuard>
  );
};
```

### 3. Sử dụng Convenience Guards

```typescript
import { UserManagementGuard, ContentManagementGuard } from '../components/common/PermissionGuard';

const MyComponent = () => {
  return (
    <UserManagementGuard fallback={<div>Không có quyền quản lý người dùng</div>}>
      <div>Quản lý người dùng</div>
    </UserManagementGuard>
  );
};
```

### 4. Tích hợp với AdminLayout

AdminLayout đã được tích hợp sẵn hệ thống phân quyền:

- **Menu Filtering**: Menu items được lọc tự động dựa trên quyền của user
- **Route Protection**: Tự động chuyển hướng nếu user không có quyền truy cập route
- **Role Display**: Hiển thị tên vai trò đúng định dạng

```typescript
// Menu items được lọc tự động
const menuItems = useMemo(() => {
  const allMenuItems = [
    // ... menu items
  ];
  
  // Filter menu items based on user permissions
  return filterMenuItemsByPermissions(allMenuItems, user);
}, [collapsed, user]);
```

## Vai trò mặc định

### 1. Quản trị viên (Admin)
- **Quyền**: Tất cả quyền trong hệ thống
- **Mô tả**: Có toàn quyền quản lý hệ thống

### 2. Giảng viên (Instructor)
- **Quyền**: 
  - Tạo, sửa, xóa khóa học
  - Quản lý bài học và quiz
  - Xem học viên và tiến độ
  - Quản lý thu nhập
- **Mô tả**: Quản lý khóa học và học viên

### 3. Học viên (Student)
- **Quyền**:
  - Xem và đăng ký khóa học
  - Học bài và làm quiz
  - Bình luận và đánh giá
  - Xem chứng chỉ
- **Mô tả**: Sử dụng khóa học

### 4. Kiểm duyệt viên (Moderator)
- **Quyền**:
  - Duyệt bài viết và bình luận
  - Xử lý báo cáo
  - Cảnh cáo người dùng
- **Mô tả**: Kiểm duyệt nội dung

### 5. Khách (Guest)
- **Quyền**:
  - Xem khóa học công khai
  - Tìm kiếm khóa học
- **Mô tả**: Chưa đăng nhập

## Thêm quyền mới

### 1. Thêm permission vào PERMISSIONS
```typescript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_PERMISSION: 'tên quyền mới',
}
```

### 2. Thêm vào menu permissions nếu cần
```typescript
export const MENU_PERMISSIONS = {
  // ... existing routes
  '/admin/new-route': [PERMISSIONS.NEW_PERMISSION],
}
```

### 3. Thêm vào RolesPage permissions array
```typescript
const [permissions] = useState<Permission[]>([
  // ... existing permissions
  {
    id: '60',
    name: 'tên quyền mới',
    description: 'Mô tả quyền mới',
    category: 'Danh mục phù hợp',
    isActive: true,
  },
]);
```

## Best Practices

### 1. Luôn kiểm tra quyền ở nhiều lớp
- **Route level**: Trong AdminLayout
- **Component level**: Sử dụng PermissionGuard
- **Function level**: Kiểm tra trước khi thực hiện action

### 2. Sử dụng fallback content
```typescript
<PermissionGuard
  permission="quản lý người dùng"
  fallback={<div>Bạn không có quyền truy cập tính năng này</div>}
>
  <UserManagementComponent />
</PermissionGuard>
```

### 3. Kiểm tra quyền trước khi render
```typescript
const MyComponent = () => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('quản lý người dùng')) {
    return <AccessDenied />;
  }
  
  return <UserManagement />;
};
```

### 4. Sử dụng convenience functions
```typescript
const { canManageUsers, canManageContent, isAdmin } = usePermissions();

// Thay vì
if (hasPermission('quản lý người dùng') || hasPermission('phân quyền người dùng'))

// Sử dụng
if (canManageUsers())
```

## Troubleshooting

### 1. User không có quyền truy cập menu
- Kiểm tra user.role.permissions có chứa quyền cần thiết
- Kiểm tra MENU_PERMISSIONS mapping
- Đảm bảo user có role hợp lệ

### 2. PermissionGuard không hoạt động
- Kiểm tra user prop được truyền đúng
- Đảm bảo permission name khớp với PERMISSIONS
- Kiểm tra user.role structure

### 3. Route protection không hoạt động
- Kiểm tra canAccessRoute function
- Đảm bảo route được định nghĩa trong MENU_PERMISSIONS
- Kiểm tra user permissions

## Kết luận

Hệ thống phân quyền EduPro cung cấp một giải pháp toàn diện cho việc quản lý quyền truy cập. Với các utility functions, hooks, và components được thiết kế sẵn, việc triển khai phân quyền trở nên đơn giản và nhất quán trong toàn bộ ứng dụng. 