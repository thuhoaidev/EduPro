# Quản lý Hồ sơ Giảng viên Chờ Duyệt

## Tổng quan

Tính năng này cho phép admin quản lý các hồ sơ giảng viên đang chờ duyệt. Hiển thị những hồ sơ có `approval_status = 'pending'` hoặc `approval_status = null` (mặc định khi tạo tài khoản).

## API Endpoints

### 1. Lấy danh sách hồ sơ giảng viên chờ duyệt

**GET** `/api/users/instructors/pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Trang hiện tại (mặc định: 1)
- `limit` (optional): Số lượng item mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên, email, nickname, phone

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách hồ sơ giảng viên chờ duyệt thành công",
  "data": {
    "pendingInstructors": [
      {
        "_id": "instructor_id",
        "email": "instructor@example.com",
        "fullname": "Nguyễn Văn Giảng Viên",
        "nickname": "nguyengiangvien",
        "phone": "0123456789",
        "dob": "1990-01-01T00:00:00.000Z",
        "address": "Hà Nội, Việt Nam",
        "gender": "male",
        "bio": "Tôi là một giảng viên có kinh nghiệm...",
        "avatar": "https://res.cloudinary.com/...",
        "social_links": {
          "facebook": "https://facebook.com/nguyengiangvien",
          "twitter": null,
          "linkedin": "https://linkedin.com/in/nguyengiangvien",
          "youtube": null,
          "github": "https://github.com/nguyengiangvien",
          "website": null
        },
        "role_id": {
          "_id": "role_id",
          "name": "instructor",
          "description": "giảng viên"
        },
        "approval_status": "pending",
        "status": "active",
        "email_verified": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "instructorProfile": {
          "bio": "Tôi là một giảng viên có kinh nghiệm...",
          "social_links": {
            "facebook": "https://facebook.com/nguyengiangvien",
            "twitter": null,
            "linkedin": "https://linkedin.com/in/nguyengiangvien",
            "youtube": null,
            "github": "https://github.com/nguyengiangvien",
            "website": null
          },
          "avatar": "https://res.cloudinary.com/...",
          "phone": "0123456789",
          "address": "Hà Nội, Việt Nam",
          "dob": "1990-01-01T00:00:00.000Z",
          "gender": "male",
          "instructorInfo": {}
        },
        "registrationInfo": {
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z",
          "email_verified": true,
          "status": "active"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    },
    "summary": {
      "totalPending": 5,
      "totalApproved": 10,
      "totalRejected": 2
    }
  }
}
```

### 2. Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt

**GET** `/api/users/instructors/pending/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết hồ sơ giảng viên thành công",
  "data": {
    "_id": "instructor_id",
    "email": "instructor@example.com",
    "fullname": "Nguyễn Văn Giảng Viên",
    "nickname": "nguyengiangvien",
    "phone": "0123456789",
    "dob": "1990-01-01T00:00:00.000Z",
    "address": "Hà Nội, Việt Nam",
    "gender": "male",
    "bio": "Tôi là một giảng viên có kinh nghiệm...",
    "avatar": "https://res.cloudinary.com/...",
    "social_links": {
      "facebook": "https://facebook.com/nguyengiangvien",
      "twitter": null,
      "linkedin": "https://linkedin.com/in/nguyengiangvien",
      "youtube": null,
      "github": "https://github.com/nguyengiangvien",
      "website": null
    },
    "role_id": {
      "_id": "role_id",
      "name": "instructor",
      "description": "giảng viên"
    },
    "approval_status": "pending",
    "status": "active",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "instructorProfile": {
      "bio": "Tôi là một giảng viên có kinh nghiệm...",
      "social_links": {
        "facebook": "https://facebook.com/nguyengiangvien",
        "twitter": null,
        "linkedin": "https://linkedin.com/in/nguyengiangvien",
        "youtube": null,
        "github": "https://github.com/nguyengiangvien",
        "website": null
      },
      "avatar": "https://res.cloudinary.com/...",
      "phone": "0123456789",
      "address": "Hà Nội, Việt Nam",
      "dob": "1990-01-01T00:00:00.000Z",
      "gender": "male",
      "instructorInfo": {}
    },
    "registrationInfo": {
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "email_verified": true,
      "status": "active"
    },
    "approvalInfo": {
      "approval_status": "pending",
      "isInstructor": false,
      "has_registered_instructor": false
    }
  }
}
```

### 3. Duyệt hồ sơ giảng viên

**PUT** `/api/users/instructors/:id/approval`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Duyệt hồ sơ giảng viên thành công",
  "data": {
    "_id": "instructor_id",
    "email": "instructor@example.com",
    "fullname": "Nguyễn Văn Giảng Viên",
    "approval_status": "approved",
    "isInstructor": true,
    "has_registered_instructor": true,
    "instructorInfo": {
      "is_approved": true
    }
  }
}
```

### 4. Từ chối hồ sơ giảng viên

**PUT** `/api/users/instructors/:id/approval`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "rejected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loại bỏ hồ sơ giảng viên thành công",
  "data": {
    "_id": "instructor_id",
    "email": "instructor@example.com",
    "fullname": "Nguyễn Văn Giảng Viên",
    "approval_status": "rejected",
    "isInstructor": false,
    "has_registered_instructor": false,
    "instructorInfo": {
      "is_approved": false
    }
  }
}
```

## Dữ liệu mẫu

### Tài khoản admin để test:
```json
{
  "email": "quantrivien@gmail.com",
  "password": "123456"
}
```

### Hồ sơ giảng viên mẫu:
```json
{
  "email": "instructor@example.com",
  "password": "123456",
  "fullname": "Nguyễn Văn Giảng Viên",
  "nickname": "nguyengiangvien",
  "phone": "0123456789",
  "dob": "1990-01-01",
  "address": "Hà Nội, Việt Nam",
  "gender": "male",
  "role_id": "68515bd8e39706d32b125f89",
  "bio": "Tôi là một giảng viên có kinh nghiệm trong lĩnh vực công nghệ thông tin.",
  "social_links": {
    "facebook": "https://facebook.com/nguyengiangvien",
    "twitter": null,
    "linkedin": "https://linkedin.com/in/nguyengiangvien",
    "youtube": null,
    "github": "https://github.com/nguyengiangvien",
    "website": null
  }
}
```

## Test Cases

### 1. Test lấy danh sách hồ sơ chờ duyệt:
```bash
# Login admin
POST /api/auth/login
{
  "identifier": "quantrivien@gmail.com",
  "password": "123456"
}

# Lấy danh sách hồ sơ chờ duyệt
GET /api/users/instructors/pending?page=1&limit=10
Authorization: Bearer <admin_token>
```

### 2. Test tìm kiếm hồ sơ:
```bash
GET /api/users/instructors/pending?page=1&limit=10&search=giangvien
Authorization: Bearer <admin_token>
```

### 3. Test lấy chi tiết hồ sơ:
```bash
GET /api/users/instructors/pending/INSTRUCTOR_ID_HERE
Authorization: Bearer <admin_token>
```

### 4. Test duyệt hồ sơ:
```bash
PUT /api/users/instructors/INSTRUCTOR_ID_HERE/approval
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved"
}
```

### 5. Test từ chối hồ sơ:
```bash
PUT /api/users/instructors/INSTRUCTOR_ID_HERE/approval
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "rejected"
}
```

## Validation

### Status values:
- `approved`: Duyệt hồ sơ
- `rejected`: Từ chối hồ sơ

### Error responses:
```json
{
  "success": false,
  "message": "Trạng thái không hợp lệ. Phải là \"approved\" hoặc \"rejected\""
}
```

```json
{
  "success": false,
  "message": "Không tìm thấy hồ sơ giảng viên chờ duyệt"
}
```

```json
{
  "success": false,
  "message": "Người dùng không phải là giảng viên"
}
```

## Tính năng

### 1. Phân trang:
- Hỗ trợ phân trang với `page` và `limit`
- Trả về thông tin pagination đầy đủ

### 2. Tìm kiếm:
- Tìm kiếm theo tên, email, nickname, phone
- Hỗ trợ tìm kiếm không phân biệt hoa thường

### 3. Thống kê:
- Tổng số hồ sơ chờ duyệt
- Tổng số hồ sơ đã duyệt
- Tổng số hồ sơ bị từ chối

### 4. Chi tiết hồ sơ:
- Thông tin cá nhân đầy đủ
- Thông tin social links
- Thông tin đăng ký
- Thông tin phê duyệt

## Security

- Chỉ admin mới có quyền truy cập
- Token authentication bắt buộc
- Validation dữ liệu đầu vào
- Kiểm tra role instructor

## Performance

- Phân trang để tối ưu hiệu suất
- Index database cho các trường tìm kiếm
- Populate role_id để giảm số lượng query

## Sử dụng Postman

Import file `postman_pending_instructors.json` để có sẵn tất cả các request mẫu.

### Cách test:
1. **Login admin** để lấy token
2. **Lấy danh sách hồ sơ chờ duyệt**
3. **Xem chi tiết hồ sơ**
4. **Duyệt hoặc từ chối hồ sơ**
5. **Test các trường hợp lỗi** 