# Tóm tắt thay đổi Backend

## 1. Bỏ yêu cầu quyền admin cho các chức năng instructor

### Thay đổi trong `backend/src/routes/user.routes.js`:
- Di chuyển các route sau ra khỏi middleware `checkRole(['admin'])`:
  - `GET /instructors/pending` - Lấy danh sách hồ sơ giảng viên chờ duyệt
  - `GET /instructors/pending/:id` - Lấy chi tiết hồ sơ giảng viên chờ duyệt  
  - `PUT /instructors/:id/approval` - Cập nhật trạng thái hồ sơ giảng viên

### Kết quả:
- Các chức năng trên giờ chỉ cần đăng nhập (có token), không cần quyền admin
- Admin vẫn có thể sử dụng các chức năng này

## 2. Thêm luồng đăng ký hồ sơ giảng viên cho student

### Thêm function mới trong `backend/src/controllers/user.controller.js`:
- `registerInstructorProfile()` - Đăng ký hồ sơ giảng viên cơ bản (không cần upload file)

### Thêm route mới trong `backend/src/routes/user.routes.js`:
- `POST /instructor-profile/register` - Đăng ký hồ sơ giảng viên

### Tính năng của luồng mới:
- Student có thể đăng ký hồ sơ giảng viên với thông tin cơ bản
- Không yêu cầu upload file (certificates, CV, demo video)
- Tự động set `approval_status: 'pending'`
- Có thể bổ sung file sau bằng route `submitInstructorProfile` cũ

## 3. Cập nhật logic tìm kiếm hồ sơ chờ duyệt

### Thay đổi trong `getPendingInstructors()` và `getPendingInstructorDetail()`:
- Trước: Chỉ tìm user có `role_id: instructor` và `approval_status: 'pending'`
- Sau: Tìm cả user có `role_id: student` và `approval_status: 'pending'`

### Kết quả:
- Danh sách hồ sơ chờ duyệt sẽ bao gồm cả student đã đăng ký hồ sơ giảng viên
- Admin có thể duyệt hồ sơ của cả student và instructor

## 4. Đảm bảo tương thích ngược

### Các chức năng cũ vẫn hoạt động bình thường:
- `submitInstructorProfile()` - Nộp hồ sơ giảng viên đầy đủ (có upload file)
- `updateInstructorApproval()` - Duyệt/từ chối hồ sơ
- `getMyInstructorProfile()` - Xem hồ sơ của mình
- `updateInstructorProfile()` - Cập nhật hồ sơ

### Logic duyệt hồ sơ:
- Khi duyệt: Student sẽ được chuyển thành role instructor
- Khi từ chối: Giữ nguyên role student
- Cả hai trường hợp đều cập nhật `approval_status` và `instructorInfo`

## 5. API Endpoints mới

### Student đăng ký hồ sơ giảng viên:
```
POST /api/users/instructor-profile/register
Body: {
  experience_years: number,
  specializations: string[],
  teaching_experience: {
    years: number,
    description: string
  },
  bio?: string,
  phone?: string,
  address?: string,
  gender?: string,
  dob?: string
}
```

### Response:
```json
{
  "success": true,
  "message": "Đăng ký hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt.",
  "data": {
    "instructorInfo": {...},
    "approval_status": "pending",
    "user": {...}
  }
}
```

## 6. Lưu ý

- Tất cả các thay đổi đều đảm bảo tương thích ngược
- Không ảnh hưởng đến chức năng cũ
- Student có thể sử dụng cả 2 luồng: đăng ký cơ bản hoặc nộp hồ sơ đầy đủ
- Admin có thể duyệt hồ sơ của cả student và instructor 