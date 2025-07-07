# Postman Test Guide - Instructor Registration API

## 🎯 API Endpoint
```
POST http://localhost:5000/api/users/instructor-register
Content-Type: multipart/form-data
```

## ✅ Correct Field Names & Values

### 📝 Text Fields (Key-Value):

| Key | Value | Required | Notes |
|-----|-------|----------|-------|
| `fullName` | `Nguyễn Văn Test` | ✅ | Không có khoảng trắng thừa |
| `email` | `test-instructor-123@example.com` | ✅ | Email hợp lệ |
| `phone` | `0123456789` | ✅ | Số điện thoại |
| `password` | `password123` | ✅ | Ít nhất 6 ký tự |
| `gender` | `Nam` | ✅ | Chỉ: `Nam`, `Nữ`, `Khác` |
| `dateOfBirth` | `1990-01-01` | ✅ | Format: YYYY-MM-DD |
| `address` | `123 Test Street, Test City` | ✅ | Địa chỉ đầy đủ |
| `degree` | `Cử nhân` | ✅ | Bằng cấp cao nhất |
| `institution` | `Đại học Test` | ✅ | Trường đại học |
| `graduationYear` | `2015` | ✅ | Năm tốt nghiệp |
| `major` | `Công nghệ thông tin` | ✅ | Chuyên ngành |
| `teachingExperience` | `5` | ✅ | Số năm kinh nghiệm |
| `experienceDescription` | `Có 5 năm kinh nghiệm giảng dạy lập trình web` | ✅ | Mô tả chi tiết |
| `bio` | `Giảng viên có kinh nghiệm trong lĩnh vực lập trình web` | ✅ | Giới thiệu bản thân |
| `linkedin` | `https://linkedin.com/in/test` | ❌ | Optional |
| `github` | `https://github.com/test` | ❌ | Optional |
| `website` | `https://test.com` | ❌ | Optional |

### 🏷️ Array Fields (Specializations):

| Key | Value | Required |
|-----|-------|----------|
| `specializations` | `JavaScript` | ✅ |
| `specializations` | `React` | ✅ |
| `specializations` | `Node.js` | ✅ |

### 📁 File Fields:

| Key | Type | Required | File Type | Max Size |
|-----|------|----------|-----------|----------|
| `avatar` | File | ✅ | JPG, PNG | 5MB |
| `cv` | File | ✅ | PDF | 10MB |
| `certificates` | File | ✅ | PDF, JPG | 10MB |
| `certificates` | File | ✅ | PDF, JPG | 10MB |
| `demoVideo` | File | ❌ | MP4 | 50MB |

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Field Names:
```
fullName : "Test"  // ❌ Có khoảng trắng
degree : "Test"    // ❌ Có khoảng trắng
bio : "Test"       // ❌ Có khoảng trắng
```

### ❌ Wrong Gender Values:
```
gender: "male"     // ❌ Phải là "Nam"
gender: "female"   // ❌ Phải là "Nữ"
gender: "other"    // ❌ Phải là "Khác"
gender: "nữ"       // ❌ Phải là "Nữ"
```

### ❌ Empty Required Fields:
```
email: ""          // ❌ Không được để trống
password: ""       // ❌ Không được để trống
phone: ""          // ❌ Không được để trống
```

### ❌ Wrong File Types:
```
avatar: .txt file  // ❌ Chỉ JPG, PNG
cv: .doc file      // ❌ Chỉ PDF
certificates: .exe // ❌ Chỉ PDF, JPG
```

## ✅ Correct Postman Setup

### 1. Request Configuration:
```
Method: POST
URL: http://localhost:5000/api/users/instructor-register
Body: form-data
```

### 2. Headers:
```
Content-Type: multipart/form-data (auto-set by Postman)
```

### 3. Body (form-data):

#### Text Fields:
```
fullName: Nguyễn Văn Test
email: test-instructor-123@example.com
phone: 0123456789
password: password123
gender: Nam
dateOfBirth: 1990-01-01
address: 123 Test Street, Test City
degree: Cử nhân
institution: Đại học Test
graduationYear: 2015
major: Công nghệ thông tin
teachingExperience: 5
experienceDescription: Có 5 năm kinh nghiệm giảng dạy lập trình web
bio: Giảng viên có kinh nghiệm trong lĩnh vực lập trình web
linkedin: https://linkedin.com/in/test
github: https://github.com/test
website: https://test.com
```

#### Array Fields:
```
specializations: JavaScript
specializations: React
specializations: Node.js
```

#### File Fields:
```
avatar: [Select JPG/PNG file]
cv: [Select PDF file]
certificates: [Select PDF/JPG file]
certificates: [Select PDF/JPG file]
demoVideo: [Select MP4 file] (optional)
```

## 📊 Expected Responses

### ✅ Success Response (201):
```json
{
  "success": true,
  "message": "Đăng ký giảng viên thành công! Hồ sơ đang chờ admin phê duyệt.",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullname": "Nguyễn Văn Test",
      "nickname": "vantest",
      "slug": "vantest",
      "email": "test-instructor-123@example.com",
      "approval_status": "pending"
    },
    "instructorInfo": {
      "is_approved": false,
      "experience_years": 5,
      "specializations": ["JavaScript", "React", "Node.js"],
      "teaching_experience": {
        "years": 5,
        "description": "Có 5 năm kinh nghiệm giảng dạy lập trình web"
      },
      "certificates": [...],
      "demo_video": "https://res.cloudinary.com/...",
      "cv_file": "https://res.cloudinary.com/...",
      "approval_status": "pending"
    }
  }
}
```

### ❌ Validation Error (400):
```json
{
  "success": false,
  "message": "Thiếu thông tin cá nhân bắt buộc",
  "missing": {
    "fullName": false,
    "email": true,
    "phone": true,
    "password": true,
    "gender": false,
    "dateOfBirth": false,
    "address": false
  },
  "received": {
    "fullName": "Nguyễn Văn Test",
    "email": "",
    "phone": "",
    "password": "***",
    "gender": "Nam",
    "dateOfBirth": "1990-01-01",
    "address": "123 Test Street"
  }
}
```

### ❌ Schema Validation Error (400):
```json
{
  "success": false,
  "message": "Lỗi đăng ký giảng viên",
  "error": "User validation failed: gender: `male` is not a valid enum value for path `gender`."
}
```

## 🧪 Test Cases

### Test Case 1: Happy Path
- ✅ Điền đầy đủ tất cả required fields
- ✅ Upload đúng file types
- ✅ Expected: 201 Created

### Test Case 2: Missing Required Fields
- ❌ Bỏ trống email, password, phone
- ✅ Expected: 400 Bad Request với missing fields

### Test Case 3: Invalid Gender
- ❌ gender: "male" thay vì "Nam"
- ✅ Expected: 400 Bad Request - Schema validation error

### Test Case 4: Duplicate Email
- ❌ Sử dụng email đã tồn tại
- ✅ Expected: 400 Bad Request - "Email đã được sử dụng"

### Test Case 5: Invalid File Type
- ❌ Upload .txt cho avatar
- ✅ Expected: 400 Bad Request - "Loại file không được hỗ trợ"

## 🔧 Troubleshooting

### Issue 1: "Không tìm thấy token xác thực"
**Solution:** Route đã được fix, không cần token cho `/instructor-register`

### Issue 2: "Thiếu thông tin bắt buộc"
**Solution:** Kiểm tra tất cả required fields đã điền đúng

### Issue 3: "User validation failed"
**Solution:** 
- Gender phải là: `Nam`, `Nữ`, `Khác`
- Không có khoảng trắng trong field names
- Files phải được upload

### Issue 4: "File quá lớn"
**Solution:** Giảm kích thước file theo limits

### Issue 5: "Loại file không được hỗ trợ"
**Solution:** Chỉ upload JPG, PNG, PDF, MP4

## 📞 Support

Nếu gặp lỗi, cung cấp:
1. Request body đầy đủ
2. Response body
3. Status code
4. Error message 