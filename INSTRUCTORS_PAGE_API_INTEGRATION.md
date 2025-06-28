# Instructors Page API Integration

## Tổng quan
Đã tích hợp API để hiển thị danh sách giảng viên đã được duyệt trên trang InstructorsPage thay vì sử dụng dữ liệu mock.

## Thay đổi Backend

### 1. Controller mới: `getApprovedInstructors`
- **File**: `backend/src/controllers/user.controller.js`
- **Chức năng**: Lấy danh sách giảng viên đã được duyệt với thống kê khóa học
- **Endpoint**: `GET /api/users/approved-instructors`

### 2. Route mới
- **File**: `backend/src/routes/user.routes.js`
- **Route**: `router.get('/approved-instructors', getApprovedInstructors)`
- **Quyền truy cập**: Không cần đăng nhập (public)

### 3. Tính năng API
- **Phân trang**: `page`, `limit`
- **Tìm kiếm**: `search` (tìm theo tên, email, bio, expertise)
- **Lọc**: Chỉ lấy giảng viên đã được duyệt (`approval_status: 'approved'`)
- **Thống kê**: Tự động tính số khóa học và học viên cho mỗi giảng viên

## Thay đổi Frontend

### 1. Interface cập nhật
- **File**: `frontend/src/pages/client/InstructorsPage.tsx`
- **Interface mới**: `ApiInstructor` cho mapping dữ liệu API
- **Loại bỏ**: Dữ liệu mock `mockInstructors`

### 2. API Integration
- **Endpoint**: `/users/approved-instructors`
- **Loading state**: Hiển thị spinner khi đang tải
- **Error handling**: Xử lý lỗi API gracefully
- **Pagination**: Tích hợp phân trang từ API

### 3. UI Improvements
- **Empty states**: Hiển thị thông báo khi không có dữ liệu
- **Expertise display**: Xử lý trường hợp expertise rỗng
- **Responsive design**: Tương thích mobile

## Cách sử dụng

### 1. Khởi động Backend
```bash
cd backend
npm start
```

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```

### 3. Truy cập trang
- URL: `http://localhost:5173/instructors` (hoặc route tương ứng)
- API: `http://localhost:5000/api/users/approved-instructors`

## API Response Format

```json
{
  "success": true,
  "data": {
    "instructors": [
      {
        "id": "instructor_id",
        "fullname": "Tên giảng viên",
        "avatar": "url_avatar",
        "bio": "Giới thiệu",
        "rating": 4.5,
        "totalStudents": 100,
        "totalCourses": 5,
        "totalReviews": 50,
        "experienceYears": 3,
        "expertise": ["React", "Node.js"],
        "isVerified": true,
        "location": "Hà Nội",
        "education": "Đại học Bách Khoa",
        "approvalStatus": "approved"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 6,
      "totalPages": 2
    }
  }
}
```

## Tính năng bổ sung

### 1. Tìm kiếm
- Tìm theo tên giảng viên
- Tìm theo chuyên môn
- Tìm theo bio

### 2. Lọc
- Lọc theo chuyên môn
- Lọc theo đánh giá
- Lọc theo kinh nghiệm

### 3. Phân trang
- Hiển thị 6 giảng viên/trang
- Navigation giữa các trang
- Hiển thị tổng số giảng viên

## Lưu ý

1. **Dữ liệu thống kê**: Số khóa học và học viên được tính từ bảng Course
2. **Avatar fallback**: Sử dụng DiceBear API khi không có avatar
3. **Expertise**: Hiển thị tối đa 3 chuyên môn, còn lại hiển thị "+N"
4. **Loading state**: Hiển thị spinner khi đang tải dữ liệu
5. **Error handling**: Hiển thị thông báo lỗi khi API fail

## Troubleshooting

### 1. API không trả về dữ liệu
- Kiểm tra backend có chạy không
- Kiểm tra có giảng viên nào được duyệt không
- Kiểm tra console log lỗi

### 2. Thống kê khóa học = 0
- Kiểm tra có khóa học nào được tạo không
- Kiểm tra mối quan hệ User -> InstructorProfile -> Course

### 3. Avatar không hiển thị
- Kiểm tra URL avatar có hợp lệ không
- Fallback về DiceBear API sẽ tự động hoạt động 