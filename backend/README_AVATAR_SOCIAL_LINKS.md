# Hướng dẫn sử dụng Avatar và Social Links

## Tổng quan

Tính năng này cho phép người dùng:
- Upload avatar lên Cloudinary
- Cập nhật thông tin social links (Facebook, Twitter, LinkedIn, YouTube, GitHub, Website)
- Tự động xóa avatar cũ khi upload avatar mới
- **Tạo user mới với avatar và social_links (Admin only)**

## Cấu hình

### 1. Biến môi trường

Đảm bảo các biến môi trường Cloudinary đã được cấu hình trong file `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Database Migration

Chạy script migration để cập nhật schema:

```bash
node src/migrations/add_avatar_social_links.js
```

### 3. Lấy Role IDs

Chạy script để lấy danh sách role IDs:

```bash
node src/scripts/get_roles.js
```

**Role IDs hiện tại:**
- **STUDENT**: `68510d89f2ab81d9256b4d5e`
- **ADMIN**: `685133db03ed5406c9761e57`
- **INSTRUCTOR**: `68515bd8e39706d32b125f89`
- **MODERATOR**: `68515c70e39706d32b125f8b`

## API Endpoints

### 1. Cập nhật thông tin người dùng (với avatar)

**PUT** `/api/users/me`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
fullname: "Nguyễn Văn A"
nickname: "nguyenvana"
phone: "0123456789"
dob: "1990-01-01"
address: "Hà Nội, Việt Nam"
gender: "male"
bio: "Mô tả về bản thân"
social_links: "{\"facebook\":\"https://facebook.com/nguyenvana\",\"twitter\":\"https://twitter.com/nguyenvana\"}"
avatar: [file]
```

### 2. Tạo người dùng mới (Admin only)

**POST** `/api/users`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
email: "newuser@example.com"
password: "123456"
fullname: "Nguyễn Thị B"
nickname: "nguyenthib"
phone: "0123456789"
dob: "1995-05-15"
address: "Đà Nẵng, Việt Nam"
gender: "female"
role_id: "68510d89f2ab81d9256b4d5e"
status: "active"
approval_status: "approved"
bio: "Mô tả về người dùng mới"
social_links: "{\"facebook\":\"https://facebook.com/nguyenthib\",\"twitter\":null,\"linkedin\":\"https://linkedin.com/in/nguyenthib\"}"
avatar: [file]
```

### 3. Tạo người dùng mới (không có avatar)

**POST** `/api/users`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "123456",
  "fullname": "Nguyễn Thị B",
  "nickname": "nguyenthib",
  "phone": "0123456789",
  "dob": "1995-05-15",
  "address": "Đà Nẵng, Việt Nam",
  "gender": "female",
  "role_id": "68510d89f2ab81d9256b4d5e",
  "status": "active",
  "approval_status": "approved",
  "bio": "Mô tả về người dùng mới",
  "social_links": {
    "facebook": "https://facebook.com/nguyenthib",
    "twitter": null,
    "linkedin": "https://linkedin.com/in/nguyenthib",
    "youtube": null,
    "github": "https://github.com/nguyenthib",
    "website": null
  }
}
```

## Response mẫu

### Response thành công (tạo user):
```json
{
  "success": true,
  "message": "Tạo người dùng thành công",
  "data": {
    "_id": "user_id",
    "email": "newuser@example.com",
    "fullname": "Nguyễn Thị B",
    "nickname": "nguyenthib",
    "phone": "0123456789",
    "dob": "1995-05-15T00:00:00.000Z",
    "address": "Đà Nẵng, Việt Nam",
    "gender": "female",
    "avatar": "https://res.cloudinary.com/...",
    "social_links": {
      "facebook": "https://facebook.com/nguyenthib",
      "twitter": null,
      "linkedin": "https://linkedin.com/in/nguyenthib",
      "youtube": null,
      "github": "https://github.com/nguyenthib",
      "website": null
    },
    "bio": "Mô tả về người dùng mới",
    "status": "active",
    "approval_status": "approved",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "avatarInfo": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "edupor/avatars/...",
    "size": 123456
  }
}
```

## Dữ liệu mẫu để test

### 1. Tài khoản test:
```json
{
  "admin": {
    "email": "quantrivien@gmail.com",
    "password": "123456"
  },
  "instructor": {
    "email": "giangvien@gmail.com",
    "password": "123456"
  },
  "student": {
    "email": "sinhvien@gmail.com",
    "password": "123456"
  }
}
```

### 2. Dữ liệu tạo user mẫu:

**Mẫu 1 - Student với đầy đủ thông tin:**
```json
{
  "email": "student1@example.com",
  "password": "123456",
  "fullname": "Nguyễn Văn Student",
  "nickname": "nguyenvstudent",
  "phone": "0123456789",
  "dob": "2000-01-01",
  "address": "Hà Nội, Việt Nam",
  "gender": "male",
  "role_id": "68510d89f2ab81d9256b4d5e",
  "bio": "Sinh viên năm 3 ngành Công nghệ thông tin",
  "social_links": {
    "facebook": "https://facebook.com/nguyenvstudent",
    "twitter": null,
    "linkedin": "https://linkedin.com/in/nguyenvstudent",
    "youtube": null,
    "github": "https://github.com/nguyenvstudent",
    "website": null
  }
}
```

**Mẫu 2 - Instructor với social links:**
```json
{
  "email": "instructor1@example.com",
  "password": "123456",
  "fullname": "Trần Thị Instructor",
  "nickname": "tranthinstructor",
  "phone": "0987654321",
  "dob": "1985-05-15",
  "address": "TP.HCM, Việt Nam",
  "gender": "female",
  "role_id": "68515bd8e39706d32b125f89",
  "bio": "Giảng viên có 10 năm kinh nghiệm giảng dạy lập trình web",
  "social_links": {
    "facebook": "https://facebook.com/tranthinstructor",
    "twitter": "https://twitter.com/tranthinstructor",
    "linkedin": "https://linkedin.com/in/tranthinstructor",
    "youtube": "https://youtube.com/@tranthinstructor",
    "github": "https://github.com/tranthinstructor",
    "website": "https://tranthinstructor.dev"
  }
}
```

## Test Cases

### 1. Test tạo user thành công:
```bash
# Login admin
POST /api/auth/login
{
  "email": "quantrivien@gmail.com",
  "password": "123456"
}

# Tạo user mới
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

# Form Data:
email: "newuser@example.com"
password: "123456"
fullname: "Test User"
role_id: "68510d89f2ab81d9256b4d5e"
avatar: [file upload]
```

### 2. Test validation:
```bash
# Test email trùng lặp
POST /api/users
{
  "email": "giangvien@gmail.com", // Email đã tồn tại
  "password": "123456",
  "fullname": "Test User",
  "role_id": "68510d89f2ab81d9256b4d5e"
}

# Test role_id không hợp lệ
POST /api/users
{
  "email": "test@example.com",
  "password": "123456",
  "fullname": "Test User",
  "role_id": "invalid_role_id"
}

# Test social_links JSON không hợp lệ
POST /api/users
{
  "email": "test@example.com",
  "password": "123456",
  "fullname": "Test User",
  "role_id": "68510d89f2ab81d9256b4d5e",
  "social_links": "invalid json string"
}
```

## Sử dụng Postman

1. **Import collection:** `postman_user_avatar_social_links.json`
2. **Set variables:**
   - `base_url`: `http://localhost:5000/api`
   - `auth_token`: (sẽ tự động set sau khi login)
3. **Thay thế ROLE_ID_HERE** bằng role ID thực tế
4. **Chạy theo thứ tự:**
   - Login Admin → Get All Users → Create New User → Test Cases

## Tính năng mới

### Tạo User với Avatar:
- Hỗ trợ upload avatar khi tạo user mới
- Tự động lưu vào Cloudinary
- Trả về thông tin avatar đã upload

### Tạo User với Social Links:
- Hỗ trợ JSON object hoặc JSON string
- Validation định dạng JSON
- Lưu trữ đầy đủ thông tin social links

### Admin Only:
- Chỉ admin mới có quyền tạo user
- Tự động verify email cho user được tạo
- Có thể set status và approval_status

## Security

- Chỉ admin mới có quyền tạo user
- Validate email trùng lặp
- Validate role_id hợp lệ
- Validate social_links JSON format
- Token authentication bắt buộc

## Performance

- Sử dụng Cloudinary CDN cho avatar
- Tự động tối ưu ảnh
- Validation hiệu quả
- Error handling chi tiết 