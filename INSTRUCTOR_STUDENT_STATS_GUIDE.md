# Hướng dẫn sử dụng tính năng thống kê học viên cho Instructor

## Tổng quan

Tính năng thống kê học viên cho phép instructor theo dõi và quản lý học viên của mình một cách hiệu quả. Tính năng này cung cấp:

- Thống kê tổng quan về học viên
- Danh sách chi tiết học viên với thông tin tiến độ
- Tìm kiếm và lọc học viên
- Phân trang và sắp xếp

## API Endpoints

### 1. Lấy danh sách học viên
```
GET /api/instructor/students
```

**Query Parameters:**
- `page` (optional): Trang hiện tại (mặc định: 1)
- `limit` (optional): Số lượng item mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên, email hoặc tên khóa học
- `courseId` (optional): Lọc theo khóa học cụ thể

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "enrollment_id",
        "student": {
          "id": "user_id",
          "name": "Tên học viên",
          "email": "email@example.com",
          "avatar": "avatar_url",
          "phone": "phone_number"
        },
        "course": {
          "id": "course_id",
          "title": "Tên khóa học",
          "thumbnail": "thumbnail_url",
          "price": 100000
        },
        "progress": 75,
        "completed": false,
        "enrolledAt": "2024-01-01T00:00:00.000Z",
        "lastActivity": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "uniqueStudents": 85
    }
  }
}
```

### 2. Lấy danh sách khóa học của instructor
```
GET /api/instructor/courses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course_id",
      "title": "Tên khóa học",
      "thumbnail": "thumbnail_url",
      "price": 100000,
      "status": "approved"
    }
  ]
}
```

## Frontend Components

### MyStudentStats Component

Component chính để hiển thị thống kê học viên với các tính năng:

1. **Thống kê tổng quan:**
   - Tổng số đăng ký
   - Số học viên unique
   - Tỷ lệ hoàn thành
   - Số khóa học active

2. **Bảng danh sách học viên:**
   - Thông tin học viên (tên, email, avatar)
   - Thông tin khóa học (tên, giá)
   - Tiến độ học tập (phần trăm hoàn thành)
   - Trạng thái hoàn thành
   - Ngày đăng ký
   - Hoạt động cuối cùng

3. **Tính năng tìm kiếm và lọc:**
   - Tìm kiếm theo tên, email hoặc tên khóa học
   - Lọc theo khóa học cụ thể
   - Phân trang với nhiều tùy chọn

4. **Tính năng bổ sung:**
   - Loading states
   - Error handling
   - Empty states
   - Responsive design

## Cách sử dụng

### 1. Truy cập trang thống kê học viên
- Đăng nhập với tài khoản instructor
- Điều hướng đến `/instructor/students`

### 2. Xem thống kê tổng quan
- Các thống kê được hiển thị ở đầu trang
- Cập nhật real-time khi có dữ liệu mới

### 3. Tìm kiếm và lọc học viên
- Sử dụng ô tìm kiếm để tìm học viên theo tên, email hoặc khóa học
- Sử dụng dropdown để lọc theo khóa học cụ thể

### 4. Xem chi tiết học viên
- Click vào "Xem chi tiết" để xem thông tin chi tiết của học viên
- Điều hướng đến trang chi tiết học viên

## Tính năng nâng cao

### 1. Tính toán tiến độ
Tiến độ được tính dựa trên số bài học đã hoàn thành:
```javascript
const progress = Math.round((completedLessons / totalLessons) * 100);
```

### 2. Phân loại tiến độ
- Xanh: ≥ 80% (Tiến độ tốt)
- Cam: 50-79% (Tiến độ trung bình)
- Đỏ: < 50% (Tiến độ chậm)

### 3. Trạng thái hoàn thành
- Hiển thị tag "Hoàn thành" cho học viên đã hoàn thành khóa học
- Dựa trên trường `completed` trong enrollment

## Cấu trúc dữ liệu

### Enrollment Model
```javascript
{
  student: ObjectId, // Reference to User
  course: ObjectId,  // Reference to Course
  enrolledAt: Date,
  progress: Object,  // { lessonId: { watchedSeconds, completed, lastWatchedAt } }
  completed: Boolean
}
```

### Progress Object Structure
```javascript
{
  "lesson_id_1": {
    watchedSeconds: 300,
    videoDuration: 600,
    completed: true,
    lastWatchedAt: "2024-01-15T00:00:00.000Z",
    quizPassed: true
  }
}
```

## Bảo mật

- Chỉ instructor có thể xem học viên của mình
- Kiểm tra quyền truy cập thông qua middleware `instructorAuth`
- Validate courseId để đảm bảo khóa học thuộc về instructor

## Troubleshooting

### Lỗi thường gặp

1. **Không tìm thấy hồ sơ giảng viên**
   - Kiểm tra xem user có instructor profile chưa
   - Đảm bảo đã tạo instructor profile

2. **Không có dữ liệu học viên**
   - Kiểm tra xem có khóa học nào được publish chưa
   - Kiểm tra xem có enrollment nào không

3. **Lỗi tính toán tiến độ**
   - Kiểm tra cấu trúc dữ liệu progress
   - Đảm bảo lesson data được cập nhật đúng

### Debug

Sử dụng console.log để debug:
```javascript
console.log('Enrollment data:', enrollment);
console.log('Progress calculation:', progress);
```

## Tương lai

Các tính năng có thể phát triển thêm:

1. **Export dữ liệu:** Xuất danh sách học viên ra Excel/CSV
2. **Thống kê chi tiết:** Biểu đồ tiến độ theo thời gian
3. **Thông báo:** Gửi thông báo cho học viên có tiến độ chậm
4. **Báo cáo:** Tạo báo cáo định kỳ về tình hình học tập
5. **Gamification:** Hệ thống điểm thưởng cho học viên tích cực
