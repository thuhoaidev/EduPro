# Statistics API Documentation

## Tổng quan
API thống kê cung cấp các endpoint để lấy dữ liệu thống kê cho trang admin dashboard.

## Authentication
Tất cả các API đều yêu cầu:
- JWT token trong header: `Authorization: Bearer <token>`
- Quyền admin

## Endpoints

### 1. Lấy thống kê tổng quan
**GET** `/api/statistics/overview`

Lấy các chỉ số tổng quan của hệ thống.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15420,
    "totalCourses": 342,
    "totalRevenue": 1250000000,
    "totalOrders": 8920,
    "newUsersToday": 156,
    "newCoursesToday": 8,
    "revenueToday": 45000000,
    "ordersToday": 234,
    "userGrowth": 12.5,
    "courseGrowth": 8.3,
    "revenueGrowth": 23.7,
    "orderGrowth": 15.2
  }
}
```

### 2. Lấy dữ liệu doanh thu theo thời gian
**GET** `/api/statistics/revenue?days=30`

Lấy dữ liệu doanh thu trong khoảng thời gian nhất định.

**Parameters:**
- `days` (optional): Số ngày (1-365), mặc định: 30

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 1500000,
      "orders": 25
    },
    {
      "date": "2024-01-02",
      "revenue": 2000000,
      "orders": 30
    }
  ]
}
```

### 3. Lấy top khóa học bán chạy
**GET** `/api/statistics/top-courses?limit=5`

Lấy danh sách khóa học bán chạy nhất.

**Parameters:**
- `limit` (optional): Số lượng khóa học (1-50), mặc định: 5

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "title": "React từ cơ bản đến nâng cao",
      "instructor": "Nguyễn Văn A",
      "sales": 1250,
      "revenue": 125000000,
      "rating": 4.8,
      "thumbnail": "https://example.com/thumbnail.jpg"
    }
  ]
}
```

### 4. Lấy thống kê theo danh mục
**GET** `/api/statistics/categories`

Lấy thống kê theo từng danh mục khóa học.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "categoryName": "Frontend Development",
      "courseCount": 45,
      "totalEnrollments": 1250,
      "totalRevenue": 125000000
    }
  ]
}
```

### 5. Lấy thống kê theo tháng
**GET** `/api/statistics/monthly?year=2024`

Lấy thống kê doanh thu và đơn hàng theo từng tháng trong năm.

**Parameters:**
- `year` (optional): Năm (2020-2030), mặc định: năm hiện tại

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": 1,
      "revenue": 15000000,
      "orders": 250
    },
    {
      "month": 2,
      "revenue": 18000000,
      "orders": 300
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Không có quyền truy cập"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền admin"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Tham số không hợp lệ",
  "error": {
    "details": [
      {
        "message": "days must be a number",
        "path": ["days"]
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server"
}
```

## Sử dụng với Frontend

### Ví dụ sử dụng với Axios:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Lấy thống kê tổng quan
const getOverviewStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    throw error;
  }
};

// Lấy dữ liệu doanh thu
const getRevenueData = async (days = 30) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/revenue?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};
```

## Lưu ý

1. **Performance**: Các API thống kê sử dụng MongoDB aggregation để tối ưu hiệu suất
2. **Caching**: Nên implement caching cho các API này để giảm tải database
3. **Rate Limiting**: API có thể bị rate limit trong môi trường production
4. **Data Accuracy**: Dữ liệu được tính toán real-time từ database, đảm bảo tính chính xác

## Cập nhật và Bảo trì

- Kiểm tra định kỳ hiệu suất của các aggregation queries
- Monitor memory usage khi xử lý dữ liệu lớn
- Backup dữ liệu thống kê quan trọng
- Cập nhật validation rules khi cần thiết 