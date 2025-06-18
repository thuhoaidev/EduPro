# Instructor Profile Registration Endpoints

## 1. Đăng ký hồ sơ giảng viên (Student)

**Endpoint:** `POST /api/users/instructor-profile/register`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**Body (Form Data):**
```
// Thông tin chuyên môn (bắt buộc)
experience_years: 3
experience_details: "Tôi có 3 năm kinh nghiệm giảng dạy lập trình web, đã từng làm việc tại các công ty công nghệ lớn và có kinh nghiệm mentoring cho sinh viên."
major_field: "Lập trình Web"

// File upload (bắt buộc)
cv_file: [file] // File CV (PDF, DOC, DOCX, ảnh) - tối đa 10MB
degrees: [file1, file2, ...] // File bằng cấp (PDF, DOC, DOCX, ảnh) - tối đa 5 file, mỗi file 10MB

// File upload (tùy chọn)
demo_video: [file] // Video demo giảng dạy (MP4, AVI, MOV, WMV) - tối đa 10MB
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng ký hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt.",
  "data": {
    "instructorInfo": {
      "is_approved": false,
      "experience_years": 3,
      "specializations": ["Lập trình Web"],
      "teaching_experience": {
        "years": 3,
        "description": "Tôi có 3 năm kinh nghiệm giảng dạy lập trình web..."
      },
      "certificates": [
        {
          "name": "Bằng cấp 1",
          "file": "https://res.cloudinary.com/.../instructor-degrees/...",
          "original_name": "bachelor_degree.pdf",
          "uploaded_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "demo_video": "https://res.cloudinary.com/.../instructor-demo-videos/...",
      "cv_file": "https://res.cloudinary.com/.../instructor-cv/...",
      "other_documents": [],
      "approval_status": "pending"
    },
    "instructor_approval_status": "pending",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "fullname": "Nguyễn Văn A",
      "role": "student",
      "phone": "0123456789",
      "dob": "1995-01-01",
      "avatar": "https://res.cloudinary.com/.../avatars/..."
    },
    "uploadedFiles": {
      "degrees": 2,
      "cv": {
        "url": "https://res.cloudinary.com/.../instructor-cv/...",
        "original_name": "my_cv.pdf",
        "size": 2048576
      },
      "demo_video": {
        "url": "https://res.cloudinary.com/.../instructor-demo-videos/...",
        "original_name": "demo_teaching.mp4",
        "size": 5242880
      }
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Thiếu thông tin chuyên môn bắt buộc: kinh nghiệm, mô tả kinh nghiệm, lĩnh vực chuyên môn"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Phải upload file CV"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Phải upload ít nhất 1 file bằng cấp"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "File CV quá lớn. Kích thước tối đa là 10MB"
}
```

## 2. Lấy danh sách hồ sơ giảng viên chờ duyệt

**Endpoint:** `GET /api/users/instructors/pending`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách hồ sơ giảng viên chờ duyệt thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "fullname": "Nguyễn Văn A",
      "phone": "0123456789",
      "dob": "1995-01-01",
      "avatar": "https://res.cloudinary.com/.../avatars/...",
      "instructorInfo": {
        "experience_years": 3,
        "specializations": ["Lập trình Web"],
        "teaching_experience": {
          "years": 3,
          "description": "Tôi có 3 năm kinh nghiệm..."
        },
        "certificates": [
          {
            "name": "Bằng cấp 1",
            "file": "https://res.cloudinary.com/.../instructor-degrees/...",
            "original_name": "bachelor_degree.pdf",
            "uploaded_at": "2024-01-15T10:30:00.000Z"
          }
        ],
        "cv_file": "https://res.cloudinary.com/.../instructor-cv/...",
        "demo_video": "https://res.cloudinary.com/.../instructor-demo-videos/...",
        "approval_status": "pending"
      },
      "instructor_approval_status": "pending"
    }
  ]
}
```

## 3. Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt

**Endpoint:** `GET /api/users/instructors/pending/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin hồ sơ giảng viên thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "student@example.com",
    "fullname": "Nguyễn Văn A",
    "phone": "0123456789",
    "dob": "1995-01-01",
    "avatar": "https://res.cloudinary.com/.../avatars/...",
    "instructorInfo": {
      "experience_years": 3,
      "specializations": ["Lập trình Web"],
      "teaching_experience": {
        "years": 3,
        "description": "Tôi có 3 năm kinh nghiệm..."
      },
      "certificates": [
        {
          "name": "Bằng cấp 1",
          "file": "https://res.cloudinary.com/.../instructor-degrees/...",
          "original_name": "bachelor_degree.pdf",
          "uploaded_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "cv_file": "https://res.cloudinary.com/.../instructor-cv/...",
      "demo_video": "https://res.cloudinary.com/.../instructor-demo-videos/...",
      "approval_status": "pending"
    },
    "instructor_approval_status": "pending"
  }
}
```

## 4. Duyệt hồ sơ giảng viên

**Endpoint:** `PUT /api/users/instructors/:id/approval`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "approval_status": "approved",
  "admin_notes": "Hồ sơ đạt yêu cầu, chấp nhận làm giảng viên"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái hồ sơ giảng viên thành công",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "fullname": "Nguyễn Văn A",
      "role": "instructor",
      "instructor_approval_status": "approved"
    },
    "instructorInfo": {
      "approval_status": "approved",
      "admin_notes": "Hồ sơ đạt yêu cầu, chấp nhận làm giảng viên"
    }
  }
}
```

## 5. Lấy hồ sơ giảng viên của tôi

**Endpoint:** `GET /api/users/instructor-profile/my`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy hồ sơ giảng viên thành công",
  "data": {
    "instructorInfo": {
      "experience_years": 3,
      "specializations": ["Lập trình Web"],
      "teaching_experience": {
        "years": 3,
        "description": "Tôi có 3 năm kinh nghiệm..."
      },
      "certificates": [
        {
          "name": "Bằng cấp 1",
          "file": "https://res.cloudinary.com/.../instructor-degrees/...",
          "original_name": "bachelor_degree.pdf",
          "uploaded_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "cv_file": "https://res.cloudinary.com/.../instructor-cv/...",
      "demo_video": "https://res.cloudinary.com/.../instructor-demo-videos/...",
      "approval_status": "pending"
    },
    "instructor_approval_status": "pending"
  }
}
```

## Lưu ý về Upload File

### Các loại file được hỗ trợ:
- **CV file**: PDF, DOC, DOCX, ảnh (JPEG, PNG, GIF)
- **Degrees files**: PDF, DOC, DOCX, ảnh (JPEG, PNG, GIF)
- **Demo video**: MP4, AVI, MOV, WMV

### Giới hạn kích thước:
- **Tất cả file**: Tối đa 10MB mỗi file
- **Degrees**: Tối đa 5 file

### Cấu trúc thư mục Cloudinary:
- **CV**: `edupor/instructor-cv/`
- **Degrees**: `edupor/instructor-degrees/`
- **Demo videos**: `edupor/instructor-demo-videos/`

### Xử lý file:
- File được upload trực tiếp lên Cloudinary thông qua middleware
- Không lưu file tạm trên server
- Tự động tối ưu hóa chất lượng và kích thước
- Trả về URL an toàn (HTTPS) từ Cloudinary 