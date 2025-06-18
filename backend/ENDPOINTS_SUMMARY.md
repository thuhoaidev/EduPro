# Tóm tắt Endpoints để Test Avatar và Social Links

## 🔐 Authentication

### Login Admin
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "quantrivien@gmail.com",
  "password": "123456"
}
```

### Login Instructor
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "giangvien@gmail.com",
  "password": "123456"
}
```

## 👤 User Profile (Cần đăng nhập)

### 1. Lấy thông tin user hiện tại
```bash
GET http://localhost:5000/api/users/me
Authorization: Bearer <token>
```

### 2. Cập nhật thông tin (không có avatar)
```bash
PUT http://localhost:5000/api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "Nguyễn Văn A",
  "nickname": "nguyenvana",
  "phone": "0123456789",
  "dob": "1990-01-01",
  "address": "Hà Nội, Việt Nam",
  "gender": "male",
  "bio": "Tôi là một giảng viên có kinh nghiệm trong lĩnh vực công nghệ thông tin.",
  "social_links": {
    "facebook": "https://facebook.com/nguyenvana",
    "twitter": "https://twitter.com/nguyenvana",
    "linkedin": "https://linkedin.com/in/nguyenvana",
    "youtube": "https://youtube.com/@nguyenvana",
    "github": "https://github.com/nguyenvana",
    "website": "https://nguyenvana.com"
  }
}
```

### 3. Cập nhật thông tin (với avatar)
```bash
PUT http://localhost:5000/api/users/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form Data:
fullname: "Nguyễn Văn A (Updated)"
nickname: "nguyenvana_updated"
phone: "0987654321"
dob: "1990-01-01"
address: "TP.HCM, Việt Nam"
gender: "male"
bio: "Tôi là một giảng viên có kinh nghiệm trong lĩnh vực công nghệ thông tin. Đã có 5 năm kinh nghiệm giảng dạy."
social_links: "{\"facebook\":\"https://facebook.com/nguyenvana\",\"twitter\":\"https://twitter.com/nguyenvana\",\"linkedin\":\"https://linkedin.com/in/nguyenvana\",\"youtube\":\"https://youtube.com/@nguyenvana\",\"github\":\"https://github.com/nguyenvana\",\"website\":\"https://nguyenvana.com\"}"
avatar: [file upload]
```

### 4. Chỉ cập nhật social links
```bash
PUT http://localhost:5000/api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "social_links": {
    "facebook": "https://facebook.com/newprofile",
    "twitter": null,
    "linkedin": "https://linkedin.com/in/newprofile",
    "youtube": "https://youtube.com/@newprofile",
    "github": "https://github.com/newprofile",
    "website": "https://newprofile.dev"
  }
}
```

## 👨‍💼 Admin User Management (Cần quyền admin)

### 1. Lấy danh sách tất cả users
```bash
GET http://localhost:5000/api/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

### 2. Lấy thông tin user theo ID
```bash
GET http://localhost:5000/api/users/USER_ID_HERE
Authorization: Bearer <admin_token>
```

### 3. Tạo user mới (không có avatar)
```bash
POST http://localhost:5000/api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

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
  "bio": "Tôi là một người dùng mới được tạo bởi admin.",
  "social_links": {
    "facebook": "https://facebook.com/nguyenthib",
    "twitter": "https://twitter.com/nguyenthib",
    "linkedin": "https://linkedin.com/in/nguyenthib",
    "youtube": null,
    "github": "https://github.com/nguyenthib",
    "website": null
  }
}
```

### 4. Tạo user mới (với avatar)
```bash
POST http://localhost:5000/api/users
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

# Form Data:
email: "newuser2@example.com"
password: "123456"
fullname: "Trần Văn C"
nickname: "tranvanc"
phone: "0987654321"
dob: "1992-08-20"
address: "Cần Thơ, Việt Nam"
gender: "male"
role_id: "68510d89f2ab81d9256b4d5e"
status: "active"
approval_status: "approved"
bio: "Tôi là một người dùng mới được tạo với avatar."
social_links: "{\"facebook\":\"https://facebook.com/tranvanc\",\"twitter\":null,\"linkedin\":\"https://linkedin.com/in/tranvanc\",\"youtube\":\"https://youtube.com/@tranvanc\",\"github\":\"https://github.com/tranvanc\",\"website\":\"https://tranvanc.dev\"}"
avatar: [file upload]
```

### 5. Cập nhật user
```bash
PUT http://localhost:5000/api/users/USER_ID_HERE
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "fullname": "Nguyễn Thị B (Updated)",
  "phone": "0987654321",
  "address": "Hà Nội, Việt Nam",
  "status": "active",
  "bio": "Thông tin đã được cập nhật bởi admin.",
  "social_links": {
    "facebook": "https://facebook.com/nguyenthib_updated",
    "twitter": "https://twitter.com/nguyenthib_updated",
    "linkedin": null,
    "youtube": "https://youtube.com/@nguyenthib_updated",
    "github": "https://github.com/nguyenthib_updated",
    "website": "https://nguyenthib.dev"
  }
}
```

### 6. Xóa user
```bash
DELETE http://localhost:5000/api/users/USER_ID_HERE
Authorization: Bearer <admin_token>
```

## 🧪 Test Cases

### 1. Test upload avatar không hợp lệ
```bash
PUT http://localhost:5000/api/users/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form Data:
fullname: "Test User"
avatar: [upload file PDF/DOC]
```

### 2. Test social links JSON không hợp lệ
```bash
PUT http://localhost:5000/api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "social_links": "invalid json string"
}
```

### 3. Test tạo user với email trùng lặp
```bash
POST http://localhost:5000/api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "giangvien@gmail.com",
  "password": "123456",
  "fullname": "Test User",
  "role_id": "68510d89f2ab81d9256b4d5e"
}
```

## 📊 Role IDs

- **STUDENT**: `68510d89f2ab81d9256b4d5e`
- **ADMIN**: `685133db03ed5406c9761e57`
- **INSTRUCTOR**: `68515bd8e39706d32b125f89`
- **MODERATOR**: `68515c70e39706d32b125f8b`

## 📝 Dữ liệu mẫu

### Tài khoản test:
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

### Social links mẫu:
```json
{
  "social_links": {
    "facebook": "https://facebook.com/username",
    "twitter": "https://twitter.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "youtube": "https://youtube.com/@username",
    "github": "https://github.com/username",
    "website": "https://username.dev"
  }
}
```

## 🚀 Cách test nhanh

1. **Login admin** để lấy token
2. **Tạo user mới** với avatar và social_links
3. **Cập nhật thông tin** user hiện tại
4. **Test các trường hợp lỗi**

## 📱 Postman Collection

Import file `postman_user_avatar_social_links.json` để có sẵn tất cả các request mẫu. 