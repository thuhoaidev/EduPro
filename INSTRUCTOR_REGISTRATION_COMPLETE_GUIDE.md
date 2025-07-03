# 🎓 Hướng dẫn hoàn chỉnh: Instructor Registration System

## 📋 Tổng quan hệ thống

Hệ thống đăng ký giảng viên đã được cập nhật hoàn chỉnh với luồng từ frontend đến backend, bao gồm:
- ✅ Đăng ký instructor với form đa bước
- ✅ Upload file (avatar, CV, certificates, demo video)
- ✅ Xác minh email
- ✅ Admin approval process
- ✅ Email notifications

## 🚀 Cách chạy hệ thống

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Tạo file test (nếu cần)
```bash
cd backend
node create-test-files.js
```

## 📁 Cấu trúc file đã cập nhật

### Backend
```
backend/
├── src/
│   ├── controllers/
│   │   └── user.controller.js          # registerInstructor, verifyInstructorEmail
│   ├── middlewares/
│   │   └── upload.js                   # uploadInstructorFiles, processInstructorFilesUpload
│   ├── routes/
│   │   └── auth.routes.js              # /auth/instructor-register, /auth/verify-instructor-email/:token
│   └── utils/
│       ├── cloudinary.js               # uploadBufferToCloudinary
│       └── sendEmail.js                # sendInstructorVerificationEmail
├── test-files/                         # File test cho upload
├── create-test-files.js                # Script tạo file test
└── test-complete-instructor-flow.js    # Test toàn bộ luồng
```

### Frontend
```
frontend/
├── src/
│   ├── pages/client/auth/
│   │   ├── instructorRegistrationPage.tsx  # Form đăng ký instructor
│   │   └── verifyInstructorEmail.tsx       # Trang xác minh email
│   ├── services/
│   │   └── apiService.ts                   # instructorService
│   ├── components/common/
│   │   └── InstructorRegistrationInfo.tsx  # Component thông tin quy trình
│   └── App.tsx                             # Routing
```

## 🔄 Luồng hoạt động

### 1. Đăng ký Instructor
```
User → Frontend Form → Backend API → Database + Email
```

**Chi tiết:**
1. User điền form đăng ký (3 bước)
2. Frontend tạo FormData với file và text data
3. Gọi API `POST /auth/instructor-register`
4. Backend xử lý file upload lên Cloudinary
5. Tạo user với role instructor
6. Gửi email xác minh
7. Trả về response thành công

### 2. Xác minh Email
```
Email Link → Frontend → Backend API → Update User Status
```

**Chi tiết:**
1. User nhận email với link xác minh
2. Click link → Frontend `/verify-instructor-email/:token`
3. Frontend gọi API `GET /auth/verify-instructor-email/:token`
4. Backend xác minh token và cập nhật user status
5. Gửi email thông báo hồ sơ đã được gửi cho admin

### 3. Admin Approval
```
Admin Panel → Review Profile → Approve/Reject → Email Notification
```

**Chi tiết:**
1. Admin xem danh sách instructor pending
2. Xem chi tiết hồ sơ (thông tin + file đã upload)
3. Duyệt hoặc từ chối hồ sơ
4. Gửi email thông báo kết quả cho instructor

## 🧪 Testing

### Test Backend
```bash
cd backend
node test-complete-instructor-flow.js
```

### Test Frontend
1. Mở `http://localhost:3000/register/instructor`
2. Điền form đăng ký
3. Upload file test từ thư mục `backend/test-files/`
4. Submit và kiểm tra response

### Test Postman
1. Import collection hoặc tạo request mới
2. Method: POST
3. URL: `http://localhost:5000/api/auth/instructor-register`
4. Body: form-data
5. Thêm các field theo cấu trúc backend

## 📧 Email Configuration

### Backend Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Email Templates
- **Verification Email**: Gửi sau khi đăng ký thành công
- **Profile Submitted Email**: Gửi sau khi xác minh email
- **Approval Result Email**: Gửi sau khi admin duyệt/từ chối

## 🔧 Troubleshooting

### Lỗi file upload
1. Kiểm tra quyền truy cập file trong Postman
2. Đảm bảo tên field đúng: `avatar`, `cv`, `certificates`, `demoVideo`
3. Kiểm tra kích thước file (avatar: 5MB, CV/cert: 10MB, video: 50MB)

### Lỗi email
1. Kiểm tra cấu hình SMTP trong backend
2. Đảm bảo email credentials đúng
3. Kiểm tra spam folder

### Lỗi Cloudinary
1. Kiểm tra Cloudinary credentials
2. Đảm bảo internet connection
3. Kiểm tra folder permissions

## 📊 Database Schema

### User Model (Sau khi đăng ký instructor)
```javascript
{
  _id: ObjectId,
  fullname: String,
  email: String,
  password: String,
  role_id: ObjectId (instructor),
  status: 'inactive' → 'active',
  email_verified: false → true,
  approval_status: 'pending' → 'approved',
  instructor_approval_status: 'pending',
  instructorInfo: {
    is_approved: false,
    experience_years: Number,
    specializations: [String],
    certificates: [{
      name: String,
      file: String (Cloudinary URL),
      original_name: String,
      uploaded_at: Date
    }],
    demo_video: String (Cloudinary URL),
    cv_file: String (Cloudinary URL)
  }
}
```

## 🎯 Next Steps

1. **Admin Panel**: Hoàn thiện giao diện admin để xét duyệt instructor
2. **Email Templates**: Tùy chỉnh template email đẹp hơn
3. **File Validation**: Thêm validation chi tiết hơn cho file upload
4. **Progress Tracking**: Thêm tracking trạng thái đăng ký
5. **Analytics**: Thống kê số lượng instructor đăng ký

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs của backend và frontend
2. Network tab trong browser dev tools
3. Database để xem dữ liệu được lưu đúng không
4. Cloudinary dashboard để xem file upload thành công không

---

**🎉 Chúc mừng! Hệ thống instructor registration đã hoàn thiện và sẵn sàng sử dụng!** 