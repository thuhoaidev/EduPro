# Luồng Nộp Hồ Sơ Giảng Viên (Từ Role Sinh Viên)

## Tổng quan

Luồng này cho phép sinh viên nộp hồ sơ để nâng cấp lên role giảng viên. Hồ sơ bao gồm thông tin chi tiết về kinh nghiệm, bằng cấp, file scan, video demo và các hồ sơ khác.

## Cấu trúc dữ liệu instructorInfo

```javascript
instructorInfo: {
  // Thông tin cơ bản
  is_approved: Boolean,
  experience_years: Number,
  specializations: [String],
  
  // Kinh nghiệm giảng dạy
  teaching_experience: {
    years: Number,
    description: String
  },
  
  // Bằng cấp & chứng chỉ
  certificates: [{
    name: String,
    major: String,
    issuer: String,
    year: Number,
    file: String // URL file scan
  }],
  
  // Video demo dạy thử
  demo_video: String, // URL video
  
  // CV và hồ sơ khác
  cv_file: String, // URL file CV
  other_documents: [{
    name: String,
    file: String, // URL file
    description: String
  }],
  
  // Trạng thái duyệt
  approval_status: 'pending' | 'approved' | 'rejected',
  approval_date: Date,
  approved_by: ObjectId,
  rejection_reason: String
}
```

## API Endpoints

### 1. Lấy hồ sơ giảng viên của user hiện tại

**GET** `/api/users/instructor-profile/my`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instructorInfo": {
      "is_approved": false,
      "experience_years": 5,
      "specializations": ["Web Development", "Mobile Development"],
      "teaching_experience": {
        "years": 3,
        "description": "Tôi đã có 3 năm kinh nghiệm giảng dạy..."
      },
      "certificates": [
        {
          "name": "Cử nhân Công nghệ thông tin",
          "major": "Công nghệ thông tin",
          "issuer": "Đại học Bách Khoa Hà Nội",
          "year": 2020,
          "file": "https://res.cloudinary.com/..."
        }
      ],
      "demo_video": "https://youtube.com/watch?v=example",
      "cv_file": "https://res.cloudinary.com/...",
      "other_documents": [
        {
          "name": "Chứng chỉ TOEIC",
          "file": "https://res.cloudinary.com/...",
          "description": "Chứng chỉ tiếng Anh quốc tế"
        }
      ],
      "approval_status": "pending",
      "approval_date": null,
      "approved_by": null,
      "rejection_reason": null
    },
    "approval_status": "pending",
    "role": "student"
  }
}
```

### 2. Nộp hồ sơ giảng viên

**POST** `/api/users/instructor-profile/submit`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `experience_years`: Số năm kinh nghiệm (Number, bắt buộc)
- `specializations`: Chuyên môn (JSON string array, bắt buộc)
- `teaching_experience`: Kinh nghiệm giảng dạy (JSON string, bắt buộc)
- `certificates`: Thông tin bằng cấp (JSON string array, bắt buộc)
- `demo_video`: Link video demo (String, tùy chọn)
- `certificate_files`: File scan bằng cấp (File array, bắt buộc)
- `cv_file`: File CV (File, tùy chọn)
- `other_documents`: Thông tin hồ sơ khác (JSON string array, tùy chọn)

**Example Request:**
```javascript
const formData = new FormData();
formData.append('experience_years', '5');
formData.append('specializations', JSON.stringify(['Web Development', 'Mobile Development']));
formData.append('teaching_experience', JSON.stringify({
  years: 3,
  description: 'Tôi đã có 3 năm kinh nghiệm giảng dạy tại các trung tâm đào tạo công nghệ thông tin.'
}));
formData.append('certificates', JSON.stringify([
  {
    name: 'Cử nhân Công nghệ thông tin',
    major: 'Công nghệ thông tin',
    issuer: 'Đại học Bách Khoa Hà Nội',
    year: 2020
  }
]));
formData.append('certificate_files', file1);
formData.append('certificate_files', file2);
formData.append('cv_file', cvFile);
formData.append('demo_video', 'https://youtube.com/watch?v=example');
formData.append('other_documents', JSON.stringify([
  {
    name: 'Chứng chỉ TOEIC',
    description: 'Chứng chỉ tiếng Anh quốc tế'
  }
]));
```

**Response:**
```json
{
  "success": true,
  "message": "Nộp hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt.",
  "data": {
    "instructorInfo": {
      "is_approved": false,
      "experience_years": 5,
      "specializations": ["Web Development", "Mobile Development"],
      "teaching_experience": {
        "years": 3,
        "description": "Tôi đã có 3 năm kinh nghiệm giảng dạy..."
      },
      "certificates": [
        {
          "name": "Cử nhân Công nghệ thông tin",
          "major": "Công nghệ thông tin",
          "issuer": "Đại học Bách Khoa Hà Nội",
          "year": 2020,
          "file": "https://res.cloudinary.com/..."
        }
      ],
      "demo_video": "https://youtube.com/watch?v=example",
      "cv_file": "https://res.cloudinary.com/...",
      "other_documents": [
        {
          "name": "Chứng chỉ TOEIC",
          "file": "https://res.cloudinary.com/...",
          "description": "Chứng chỉ tiếng Anh quốc tế"
        }
      ],
      "approval_status": "pending"
    },
    "approval_status": "pending"
  }
}
```

### 3. Cập nhật hồ sơ giảng viên

**PUT** `/api/users/instructor-profile/update`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

**Body:** Tương tự như submit, nhưng chỉ cập nhật các trường cần thiết.

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ giảng viên thành công. Hồ sơ đang chờ duyệt lại.",
  "data": {
    "instructorInfo": { ... },
    "approval_status": "pending"
  }
}
```

### 4. Admin duyệt hồ sơ giảng viên

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

Hoặc từ chối:
```json
{
  "status": "rejected",
  "rejection_reason": "Hồ sơ chưa đầy đủ thông tin kinh nghiệm giảng dạy. Vui lòng bổ sung thêm chi tiết về các khóa học đã giảng dạy."
}
```

**Response (Duyệt):**
```json
{
  "success": true,
  "message": "Duyệt hồ sơ giảng viên thành công",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullname": "Nguyễn Văn A",
    "approval_status": "approved",
    "role": "instructor",
    "instructorInfo": {
      "is_approved": true,
      "approval_status": "approved",
      "approval_date": "2024-01-01T00:00:00.000Z",
      "approved_by": "admin_id"
    }
  }
}
```

**Response (Từ chối):**
```json
{
  "success": true,
  "message": "Từ chối hồ sơ giảng viên thành công",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullname": "Nguyễn Văn A",
    "approval_status": "rejected",
    "role": "student",
    "instructorInfo": {
      "is_approved": false,
      "approval_status": "rejected",
      "approval_date": "2024-01-01T00:00:00.000Z",
      "approved_by": "admin_id",
      "rejection_reason": "Hồ sơ chưa đầy đủ thông tin..."
    }
  }
}
```

## Validation Rules

### Dữ liệu bắt buộc:
- `experience_years`: Số năm kinh nghiệm (0-50)
- `specializations`: Ít nhất 1 chuyên môn
- `teaching_experience.years`: Số năm giảng dạy (0-50)
- `teaching_experience.description`: Mô tả kinh nghiệm (tối đa 2000 ký tự)
- `certificates`: Ít nhất 1 bằng cấp với đầy đủ thông tin
- `certificate_files`: File scan cho mỗi bằng cấp

### Dữ liệu tùy chọn:
- `demo_video`: Link video demo
- `cv_file`: File CV
- `other_documents`: Các hồ sơ khác

### File upload:
- **Loại file cho phép:** PDF, JPG, PNG, MP4, MOV, AVI
- **Kích thước tối đa:** 10MB/file
- **Số lượng file:**
  - Bằng cấp: Tối đa 5 file
  - CV: 1 file
  - Video demo: 1 file
  - Hồ sơ khác: Tối đa 10 file

## Luồng xử lý

### 1. Sinh viên nộp hồ sơ:
1. Đăng nhập với role student
2. Gọi API `/instructor-profile/submit` với đầy đủ thông tin và file
3. Hệ thống upload file lên Cloudinary
4. Lưu thông tin vào `instructorInfo`
5. Set `approval_status = 'pending'`

### 2. Admin duyệt hồ sơ:
1. Xem danh sách hồ sơ chờ duyệt: `/instructors/pending`
2. Xem chi tiết hồ sơ: `/instructors/pending/:id`
3. Duyệt hoặc từ chối: `/instructors/:id/approval`

### 3. Kết quả duyệt:
- **Duyệt:** Cập nhật role thành instructor, set `is_approved = true`
- **Từ chối:** Giữ nguyên role student, lưu lý do từ chối

### 4. Cập nhật hồ sơ:
- Chỉ cho phép cập nhật khi hồ sơ bị từ chối
- Reset trạng thái về pending sau khi cập nhật

## Error Handling

### Validation Errors:
```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc: kinh nghiệm, chuyên môn, mô tả kinh nghiệm, bằng cấp"
}
```

```json
{
  "success": false,
  "message": "Phải có ít nhất 1 bằng cấp/chứng chỉ"
}
```

```json
{
  "success": false,
  "message": "Thiếu file scan cho bằng cấp: Cử nhân Công nghệ thông tin"
}
```

### Permission Errors:
```json
{
  "success": false,
  "message": "Chỉ sinh viên mới có thể nộp hồ sơ giảng viên"
}
```

```json
{
  "success": false,
  "message": "Bạn đã nộp hồ sơ giảng viên trước đó"
}
```

### File Upload Errors:
```json
{
  "success": false,
  "message": "File quá lớn. Kích thước tối đa là 10MB."
}
```

```json
{
  "success": false,
  "message": "Loại file không được hỗ trợ. Chỉ chấp nhận PDF, JPG, PNG, MP4, MOV, AVI."
}
```

## Test Cases

### 1. Test nộp hồ sơ thành công:
```bash
# Login sinh viên
POST /api/auth/login
{
  "identifier": "sinhvien@example.com",
  "password": "123456"
}

# Nộp hồ sơ
POST /api/users/instructor-profile/submit
Authorization: Bearer <student_token>
Content-Type: multipart/form-data

# Form data với đầy đủ thông tin và file
```

### 2. Test validation:
```bash
# Test thiếu thông tin bắt buộc
POST /api/users/instructor-profile/submit
# Chỉ gửi experience_years

# Test thiếu file scan
POST /api/users/instructor-profile/submit
# Gửi certificates nhưng không có file
```

### 3. Test admin duyệt:
```bash
# Login admin
POST /api/auth/login
{
  "identifier": "quantrivien@gmail.com",
  "password": "123456"
}

# Xem danh sách chờ duyệt
GET /api/users/instructors/pending
Authorization: Bearer <admin_token>

# Duyệt hồ sơ
PUT /api/users/instructors/INSTRUCTOR_ID/approval
Authorization: Bearer <admin_token>
{
  "status": "approved"
}

# Từ chối hồ sơ
PUT /api/users/instructors/INSTRUCTOR_ID/approval
Authorization: Bearer <admin_token>
{
  "status": "rejected",
  "rejection_reason": "Lý do từ chối"
}
```

## Security

- Chỉ sinh viên mới có thể nộp hồ sơ
- Chỉ admin mới có thể duyệt hồ sơ
- File upload được validate về loại và kích thước
- Token authentication bắt buộc cho tất cả API

## Performance

- File được upload lên Cloudinary để tối ưu hiệu suất
- Validation được thực hiện ở cả client và server
- Phân trang cho danh sách hồ sơ chờ duyệt

## Sử dụng Postman

Import file `postman_instructor_profile.json` để có sẵn tất cả các request mẫu.

### Cách test:
1. **Login sinh viên** để lấy token
2. **Nộp hồ sơ giảng viên** với đầy đủ thông tin và file
3. **Login admin** để duyệt hồ sơ
4. **Xem danh sách và duyệt hồ sơ**
5. **Test các trường hợp lỗi** 