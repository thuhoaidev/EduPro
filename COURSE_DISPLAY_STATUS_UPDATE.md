# Cập nhật hiển thị khóa học theo trạng thái Published

## Tổng quan
Đã cập nhật hệ thống để chỉ hiển thị các khóa học có trạng thái `displayStatus: 'published'` từ tất cả giảng viên trên trang CoursesPage.

## Các thay đổi đã thực hiện

### Backend (Node.js/Express)

#### 1. Cập nhật Course Controller (`backend/src/controllers/course.controller.js`)

**Method `getCourses`:**
- Thêm filter `displayStatus: 'published'` cho trường hợp mặc định
- Cập nhật logic để sử dụng `displayStatus` thay vì `status` cho việc hiển thị công khai

**Method `getAllCourses`:**
- Thêm filter `displayStatus: 'published'` để chỉ lấy khóa học đã được xuất bản

**Method `getCoursesByCategory`:**
- Thêm filter `displayStatus: 'published'` cho tìm kiếm theo danh mục

**Method `searchCourses`:**
- Thêm filter `displayStatus: 'published'` cho tìm kiếm

**Method `getCourseById`:**
- Thêm filter `displayStatus: 'published'` cho lấy chi tiết khóa học

**Method `getCourseBySlug`:**
- Thêm filter `displayStatus: 'published'` cho lấy khóa học theo slug

#### 2. Model Course (`backend/src/models/Course.js`)
- Đã có sẵn trường `displayStatus` với enum `['hidden', 'published']`
- Mặc định là `'hidden'`

#### 3. Script cập nhật dữ liệu (`backend/scripts/update_course_display_status.js`)
- Tạo script để cập nhật trạng thái `displayStatus` cho các khóa học hiện có
- Khóa học có `status: 'approved'` → `displayStatus: 'published'`
- Khóa học có `status` khác → `displayStatus: 'hidden'`

### Frontend (React/TypeScript)

#### 1. CoursesPage (`frontend/src/pages/client/CoursesPage.tsx`)
- Thêm comment mô tả chức năng hiển thị khóa học có trạng thái published
- Không cần thay đổi logic vì đã sử dụng đúng API endpoints

#### 2. API Service (`frontend/src/services/apiService.ts`)
- Thêm comments để làm rõ các method chỉ lấy khóa học có trạng thái published
- `getAllCourses`: Lấy tất cả khóa học có trạng thái published
- `searchCourses`: Tìm kiếm khóa học có trạng thái published
- `getCoursesByCategory`: Lấy khóa học theo danh mục có trạng thái published

## Kết quả

### Trước khi cập nhật:
- Hiển thị tất cả khóa học bất kể trạng thái
- Có thể hiển thị khóa học chưa được duyệt hoặc bị từ chối

### Sau khi cập nhật:
- Chỉ hiển thị khóa học có `displayStatus: 'published'`
- Đảm bảo chất lượng nội dung hiển thị cho người dùng
- Tất cả API endpoints đều được bảo vệ với filter trạng thái

## Cách hoạt động

1. **Khóa học mới tạo**: Mặc định có `displayStatus: 'hidden'`
2. **Khi admin duyệt khóa học**: `status` chuyển thành `'approved'` và `displayStatus` tự động thành `'published'`
3. **Khi admin từ chối khóa học**: `status` chuyển thành `'rejected'` và `displayStatus` thành `'hidden'`
4. **Trang CoursesPage**: Chỉ hiển thị khóa học có `displayStatus: 'published'`

## Lưu ý

- Các khóa học hiện có đã được cập nhật tự động thông qua script
- Không ảnh hưởng đến chức năng quản lý khóa học của giảng viên và admin
- Đảm bảo tính bảo mật và chất lượng nội dung hiển thị 