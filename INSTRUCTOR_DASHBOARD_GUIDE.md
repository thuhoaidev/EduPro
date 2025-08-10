# Instructor Dashboard Guide

## Tổng quan

Instructor Dashboard là trang tổng quan dành cho giảng viên, cung cấp các thống kê và phân tích chi tiết về hoạt động giảng dạy, thu nhập và hiệu suất khóa học.

## Tính năng chính

### 1. Thống kê tổng quan
- **Tổng khóa học**: Hiển thị số lượng khóa học đã tạo, đã duyệt, chờ duyệt
- **Tổng học viên**: Số lượng học viên đăng ký và tổng số đăng ký
- **Tổng thu nhập**: Tổng thu nhập từ tất cả khóa học
- **Số dư hiện tại**: Số dư trong ví giảng viên

### 2. Top khóa học bán chạy
- Hiển thị 5 khóa học có nhiều học viên đăng ký nhất
- Thông tin: tên khóa học, số học viên, đánh giá, giá
- Xếp hạng với badge màu sắc

### 3. Thu nhập theo tháng
- Biểu đồ thu nhập 6 tháng gần nhất
- Hiển thị dưới dạng progress bar
- Có thể xem chi tiết bằng cách click "Xem chi tiết"

### 4. Học viên mới
- Thống kê học viên đăng ký mới trong 30 ngày qua
- Hiển thị theo từng ngày

### 5. Thao tác nhanh
- Tạo khóa học mới
- Quản lý khóa học
- Xem thu nhập
- Quản lý học viên

## API Endpoints

### Backend

#### 1. Lấy thống kê tổng quan
```
GET /api/instructor/dashboard/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 10,
      "publishedCourses": 8,
      "pendingCourses": 1,
      "draftCourses": 1,
      "totalStudents": 150,
      "totalEnrollments": 200,
      "totalEarnings": 15000000,
      "currentBalance": 5000000,
      "totalTransactions": 50
    },
    "monthlyEarnings": [
      {
        "month": "2024-01",
        "earnings": 2500000
      }
    ],
    "topCourses": [
      {
        "_id": "course_id",
        "title": "React từ cơ bản",
        "thumbnail": "url",
        "price": 500000,
        "enrollmentCount": 25,
        "rating": 4.8,
        "totalReviews": 12
      }
    ],
    "recentEnrollments": [
      {
        "date": "2024-01-15",
        "count": 3
      }
    ]
  }
}
```

#### 2. Lấy thống kê chi tiết khóa học
```
GET /api/instructor/dashboard/course/:courseId/analytics
```
**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "course_id",
      "title": "React từ cơ bản",
      "thumbnail": "url",
      "price": 500000,
      "status": "approved",
      "rating": 4.8,
      "totalReviews": 12,
      "enrolledStudents": 25
    },
    "analytics": {
      "totalEnrollments": 30,
      "completedEnrollments": 18,
      "completionRate": 60.0,
      "enrollmentTrend": [
        {
          "_id": "2024-01-15",
          "count": 3
        }
      ],
      "completionTrend": [
        {
          "_id": "2024-01-15",
          "completedCount": 2
        }
      ]
    }
  }
}
```

#### 3. Lấy thống kê thu nhập chi tiết
```
GET /api/instructor/dashboard/earnings?period=30
```
**Response:**
```json
{
  "success": true,
  "data": {
    "period": 30,
    "totalEarnings": 15000000,
    "totalTransactions": 50,
    "averageEarnings": 300000,
    "dailyEarnings": [
      {
        "date": "2024-01-15",
        "earnings": 500000,
        "transactions": 2
      }
    ],
    "topCourses": [
      {
        "_id": "course_id",
        "courseTitle": "React từ cơ bản",
        "courseThumbnail": "url",
        "totalEarnings": 5000000,
        "salesCount": 10
      }
    ]
  }
}
```

### Frontend

#### Components

1. **InstructorDashboard.tsx**
   - Component chính hiển thị dashboard
   - Tích hợp tất cả thống kê và biểu đồ

2. **EarningsChart.tsx**
   - Component hiển thị biểu đồ thu nhập chi tiết
   - Có thể chọn khoảng thời gian (7, 30, 90 ngày)

3. **CourseAnalytics.tsx**
   - Component hiển thị thống kê chi tiết cho từng khóa học
   - Tỷ lệ hoàn thành, xu hướng đăng ký

#### Services

**instructorService.ts**
```typescript
// Lấy thống kê tổng quan
getDashboardStats(): Promise<InstructorDashboardStats>

// Lấy thống kê chi tiết khóa học
getCourseAnalytics(courseId: string): Promise<CourseAnalytics>

// Lấy thống kê thu nhập chi tiết
getEarningsAnalytics(period: number): Promise<EarningsAnalytics>
```

## Cách sử dụng

### 1. Truy cập Dashboard
- Đăng nhập với tài khoản instructor
- Truy cập `/instructor/dashboard`

### 2. Xem thống kê tổng quan
- Dashboard sẽ tự động load dữ liệu khi vào trang
- Các thống kê được hiển thị trong các card

### 3. Xem chi tiết thu nhập
- Click "Xem chi tiết" trong phần thu nhập
- Chọn khoảng thời gian muốn xem
- Xem top khóa học bán chạy

### 4. Xem thống kê khóa học
- Click vào khóa học trong danh sách top khóa học
- Xem tỷ lệ hoàn thành và xu hướng đăng ký

## Tính năng nâng cao

### 1. Responsive Design
- Dashboard hoạt động tốt trên mobile, tablet, desktop
- Layout tự động điều chỉnh theo kích thước màn hình

### 2. Real-time Updates
- Có thể refresh dữ liệu bằng nút "Làm mới"
- Loading states và error handling

### 3. Navigation
- Quick actions để điều hướng nhanh
- Links đến các trang quản lý khác

## Troubleshooting

### Lỗi thường gặp

1. **Không thể tải dữ liệu**
   - Kiểm tra kết nối internet
   - Kiểm tra token authentication
   - Thử refresh trang

2. **Dữ liệu không chính xác**
   - Kiểm tra quyền instructor
   - Đảm bảo có instructor profile
   - Liên hệ admin nếu cần

3. **Performance issues**
   - Dashboard load chậm với nhiều dữ liệu
   - Có thể implement pagination cho danh sách dài

## Future Enhancements

1. **Biểu đồ tương tác**
   - Sử dụng Chart.js hoặc Recharts
   - Biểu đồ đường, cột, tròn

2. **Export dữ liệu**
   - Export thống kê ra PDF/Excel
   - Báo cáo định kỳ

3. **Notifications**
   - Thông báo khi có học viên mới
   - Alert khi khóa học được duyệt

4. **Advanced Analytics**
   - Phân tích xu hướng
   - Dự đoán thu nhập
   - So sánh với các giảng viên khác
