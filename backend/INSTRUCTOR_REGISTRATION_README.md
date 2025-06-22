# Hệ thống Đăng ký Giảng viên

## Tổng quan

Hệ thống đăng ký giảng viên mới được thiết kế với form 3 bước, hỗ trợ upload file lên Cloudinary và tích hợp đầy đủ với backend.

## Các tính năng chính

### 1. Form đăng ký 3 bước
- **Bước 1:** Thông tin cá nhân (họ tên, email, phone, gender, ngày sinh, địa chỉ, mật khẩu)
- **Bước 2:** Thông tin học vấn & chuyên môn (bằng cấp, trường, chuyên ngành, kinh nghiệm)
- **Bước 3:** Hồ sơ & tài liệu (avatar, CV, chứng chỉ, video demo, bio, social links)

### 2. Upload file lên Cloudinary
- **Ảnh đại diện:** JPG, PNG, GIF, WebP (tối đa 5MB)
- **CV:** PDF, DOC, DOCX (tối đa 10MB)
- **Chứng chỉ:** PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
- **Video demo:** MP4, AVI, MOV, WMV, WebM (tối đa 50MB)

### 3. Validation đầy đủ
- Validation từng bước
- Kiểm tra email trùng lặp
- Validation file size và type
- Required fields validation

## API Endpoints

### Đăng ký giảng viên mới
```
POST /api/users/instructor-register
Content-Type: multipart/form-data
```

**Request Body:**
```javascript
{
  // Personal info
  fullName: string (required),
  email: string (required, unique),
  phone: string (required),
  password: string (required, min 6 chars),
  gender: 'male' | 'female' | 'other' (required),
  dateOfBirth: string (YYYY-MM-DD, required),
  address: string (required),
  
  // Education
  degree: string (required),
  institution: string (required),
  graduationYear: number (required),
  major: string (required),
  
  // Professional
  specializations: string[] (required),
  teachingExperience: number (required),
  experienceDescription: string (required),
  
  // Additional
  bio: string (required),
  linkedin?: string,
  github?: string,
  website?: string,
  
  // Files
  avatar?: File,
  cv?: File,
  certificates?: File[],
  demoVideo?: File
}
```

**Response:**
```javascript
{
  success: true,
  message: "Đăng ký giảng viên thành công! Hồ sơ đang chờ admin phê duyệt.",
  data: {
    user: {
      _id: string,
      fullname: string,
      email: string,
      approval_status: 'pending'
    },
    instructorInfo: {
      // Thông tin giảng viên
    }
  }
}
```

## Cấu trúc Database

### User Schema Updates
```javascript
{
  // Thông tin học vấn mới
  education: [{
    degree: String,
    institution: String,
    year: Number,
    major: String
  }],
  
  // Thông tin giảng viên
  instructorInfo: {
    is_approved: Boolean,
    experience_years: Number,
    specializations: [String],
    teaching_experience: {
      years: Number,
      description: String
    },
    certificates: [{
      name: String,
      file: String, // Cloudinary URL
      original_name: String,
      uploaded_at: Date
    }],
    demo_video: String, // Cloudinary URL
    cv_file: String, // Cloudinary URL
    approval_status: 'pending' | 'approved' | 'rejected'
  }
}
```

## Middleware Upload

### Cấu hình Multer
- **Storage:** Memory storage (buffer)
- **File size limits:** 
  - Avatar: 5MB
  - Documents: 10MB
  - Video: 50MB
- **File types:** PDF, DOC, DOCX, Images, Videos

### Cloudinary Upload
- **Folders:**
  - `instructor-avatars/`
  - `instructor-cv/`
  - `instructor-certificates/`
  - `instructor-demo-videos/`

## Frontend Integration

### Form Structure
```typescript
interface InstructorRegistrationForm {
  // Personal info
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: dayjs.Dayjs;
  address: string;
  
  // Education
  degree: string;
  institution: string;
  graduationYear: number;
  major: string;
  
  // Professional
  specializations: string[];
  teachingExperience: number;
  experienceDescription: string;
  
  // Documents
  avatar: any[];
  cv: any[];
  certificates: any[];
  demoVideo: any[];
  
  // Additional
  bio: string;
  linkedin?: string;
  github?: string;
  website?: string;
}
```

### API Service
```typescript
export const registerInstructor = async (formData: FormData) => {
  const response = await fetch('/api/users/instructor-register', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Đã xảy ra lỗi khi đăng ký');
  }
  
  return result;
};
```

## Quy trình hoạt động

1. **User điền form 3 bước**
2. **Frontend validate từng bước**
3. **Submit form với FormData**
4. **Backend validate và upload files lên Cloudinary**
5. **Tạo user mới với role 'student'**
6. **Lưu thông tin instructor với status 'pending'**
7. **Admin review và approve/reject**

## Testing

### Test API
```bash
cd backend
node test-instructor-registration.js
```

### Test Frontend
1. Truy cập `/instructor-registration`
2. Điền form 3 bước
3. Upload files
4. Submit và kiểm tra response

## Lưu ý quan trọng

1. **Email unique:** Mỗi email chỉ được đăng ký một lần
2. **File validation:** Kiểm tra size và type trước khi upload
3. **Cloudinary cleanup:** Tự động xóa file cũ khi update
4. **Role management:** User mới có role 'student', chỉ được upgrade sau khi approved
5. **Security:** Password được hash với bcrypt

## Troubleshooting

### Lỗi thường gặp
1. **File too large:** Kiểm tra file size limits
2. **Invalid file type:** Kiểm tra allowed MIME types
3. **Email already exists:** Kiểm tra email uniqueness
4. **Cloudinary upload failed:** Kiểm tra Cloudinary config

### Debug
- Check server logs cho backend errors
- Check browser console cho frontend errors
- Verify Cloudinary credentials
- Test API với Postman/curl 