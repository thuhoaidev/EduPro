# Hệ thống Email Verification cho Instructor Registration

## Tổng quan
Hệ thống EduPro đã được tích hợp email verification hoàn chỉnh cho quá trình đăng ký giảng viên. Sau khi đăng ký, người dùng sẽ nhận email xác minh và phải xác minh email trước khi hồ sơ được gửi cho admin xét duyệt.

## Quy trình hoạt động

### 1. Đăng ký giảng viên
```
POST /api/users/instructor-register
```
- User điền form đăng ký với đầy đủ thông tin
- Backend tạo user với status 'inactive' và email_verified = false
- Tạo email verification token
- Gửi email xác minh với link verification

### 2. Xác minh email
```
GET /api/users/verify-instructor-email/:token
```
- User click link trong email
- Backend xác minh token và cập nhật trạng thái
- Cập nhật user status thành 'active' và email_verified = true
- Gửi email thông báo hồ sơ đã được gửi cho admin

### 3. Admin xét duyệt
- Admin nhận thông báo có hồ sơ mới
- Xem xét hồ sơ và phê duyệt/từ chối
- Gửi email thông báo kết quả cho user

## Cấu hình Email SMTP

### Bước 1: Tạo file .env
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Bước 2: Cấu hình Gmail (Khuyến nghị)
1. Bật 2-Step Verification trong Google Account
2. Tạo App Password cho "Mail"
3. Sử dụng App Password trong EMAIL_PASS

### Bước 3: Test cấu hình
```bash
cd backend
npm run test-email
```

## API Endpoints

### 1. Đăng ký giảng viên
```http
POST /api/users/instructor-register
Content-Type: multipart/form-data

Fields:
- fullName: string (required)
- email: string (required)
- phone: string (required)
- password: string (required)
- gender: "Nam" | "Nữ" | "Khác" (required)
- dateOfBirth: string (YYYY-MM-DD) (required)
- address: string (required)
- degree: string (required)
- institution: string (required)
- graduationYear: number (required)
- major: string (required)
- specializations: string[] (required)
- teachingExperience: number (required)
- experienceDescription: string (required)
- bio: string (required)
- linkedin?: string (optional)
- github?: string (optional)
- website?: string (optional)
- avatar: file (required)
- cv: file (required)
- certificates: file[] (required)
- demoVideo?: file (optional)

Response:
{
  "success": true,
  "message": "Đăng ký giảng viên thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
  "data": {
    "user": {
      "_id": "user_id",
      "fullname": "User Name",
      "email": "user@example.com",
      "status": "inactive",
      "email_verified": false,
      "approval_status": "pending"
    },
    "instructorInfo": {...}
  }
}
```

### 2. Xác minh email
```http
GET /api/users/verify-instructor-email/:token

Response:
{
  "success": true,
  "message": "Xác minh email thành công! Hồ sơ của bạn đã được gửi cho admin xét duyệt.",
  "data": {
    "user": {
      "_id": "user_id",
      "fullname": "User Name",
      "email": "user@example.com",
      "status": "active",
      "email_verified": true,
      "approval_status": "pending"
    },
    "instructorInfo": {...}
  }
}
```

## Database Schema Updates

### User Model
```javascript
{
  // Email verification fields
  email_verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Status fields
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'inactive',
  },
  approval_status: {
    type: String,
    enum: [null, 'pending', 'approved', ''],
    default: null,
  },
  
  // Education fields
  education: [{
    degree: String,
    institution: String,
    year: Number,
    major: String,
  }],
  
  // Instructor info
  instructorInfo: {
    is_approved: Boolean,
    experience_years: Number,
    specializations: [String],
    teaching_experience: {
      years: Number,
      description: String,
    },
    certificates: [{
      name: String,
      file: String,
      original_name: String,
      uploaded_at: Date,
    }],
    demo_video: String,
    cv_file: String,
    approval_status: String,
  }
}
```

## Email Templates

### 1. Verification Email
- **Subject**: "Xác minh email - Đăng ký giảng viên EduPro"
- **Content**: 
  - Chào mừng user
  - Link xác minh email
  - Hướng dẫn sử dụng
  - Thông tin về quy trình tiếp theo

### 2. Profile Submitted Email
- **Subject**: "Hồ sơ giảng viên đã được gửi - EduPro"
- **Content**:
  - Thông báo xác minh thành công
  - Quy trình admin xét duyệt
  - Thời gian xử lý dự kiến
  - Thông tin liên hệ hỗ trợ

## Frontend Integration

### 1. Instructor Registration Form
- Form đăng ký 3 bước với validation
- Upload files (avatar, CV, certificates, demo video)
- Hiển thị thông báo thành công với hướng dẫn kiểm tra email

### 2. Email Verification Page
- Route: `/verify-instructor-email/:token`
- Xử lý verification token
- Hiển thị kết quả thành công/thất bại
- Hướng dẫn bước tiếp theo

### 3. API Service
```typescript
// apiService.ts
export const registerInstructor = async (formData: FormData) => {
  const response = await axios.post('/api/users/instructor-register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
```

## Testing

### 1. Test Email Configuration
```bash
cd backend
npm run test-email
```

### 2. Test Registration Flow
1. Đăng ký giảng viên qua form
2. Kiểm tra email verification được gửi
3. Click link verification
4. Kiểm tra trạng thái user được cập nhật
5. Kiểm tra email thông báo hồ sơ đã được gửi

### 3. Test với Postman
```http
POST http://localhost:5000/api/users/instructor-register
Content-Type: multipart/form-data

# Fill all required fields and files
```

## Security Features

1. **Email Verification Token**: 
   - 32 bytes random token
   - SHA256 hash stored in database
   - 24 hours expiration

2. **Status Management**:
   - User inactive until email verified
   - Approval status separate from email verification
   - Clear status transitions

3. **File Upload Security**:
   - File type validation
   - Size limits
   - Cloudinary storage with secure URLs

4. **Input Validation**:
   - Server-side validation for all fields
   - Email format validation
   - Phone number validation
   - Date validation

## Error Handling

### Common Errors
1. **Invalid Token**: Token không hợp lệ hoặc đã hết hạn
2. **Email Already Verified**: Email đã được xác minh trước đó
3. **User Not Found**: Không tìm thấy user với token
4. **SMTP Errors**: Lỗi gửi email (connection, authentication, etc.)

### Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Monitoring & Logging

### Console Logs
```javascript
// Registration
console.log('Instructor registration successful:', {
  userId: newUser._id,
  email: newUser.email,
  status: newUser.status,
  emailVerified: newUser.email_verified
});

// Email sending
console.log('Verification email sent successfully to:', email);
console.log('Profile submitted email sent successfully to:', email);

// Verification
console.log('Email verification successful:', {
  userId: user._id,
  email: user.email,
  status: user.status,
  emailVerified: user.email_verified,
  approvalStatus: user.approval_status
});
```

## Deployment

### Environment Variables
```env
# Production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@edupro.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=noreply@edupro.com
EMAIL_PASS=your_production_app_password
FRONTEND_URL=https://edupro.com
```

### Health Checks
```javascript
// Check email service health
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service is ready');
  }
});
```

## Troubleshooting

### Email không được gửi
1. Kiểm tra SMTP configuration
2. Verify App Password (Gmail)
3. Check firewall/network
4. Test với script test-email

### Token không hợp lệ
1. Kiểm tra token format
2. Verify token expiration
3. Check database connection
4. Review token generation logic

### Frontend không nhận response
1. Check CORS configuration
2. Verify API endpoints
3. Review network requests
4. Check browser console errors

## Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Verify email configuration
3. Test với script test-email
4. Review API documentation
5. Liên hệ support: support@edupro.com 