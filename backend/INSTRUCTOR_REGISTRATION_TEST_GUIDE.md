# Instructor Registration Test Guide

## 🎯 Tổng quan

Hướng dẫn test toàn bộ tính năng đăng ký giảng viên từ frontend đến backend.

## 🚀 Cách test

### Bước 1: Test Frontend

#### 1.1 Mở trang đăng ký
```bash
cd frontend
npm run dev
```
Truy cập: `http://localhost:5173/instructor-registration`

#### 1.2 Test form validation
- Điền form từng bước
- Kiểm tra validation cho từng trường
- Kiểm tra console logs cho DatePicker

#### 1.3 Test form submission
- Điền đầy đủ form
- Upload files (avatar, CV, certificates)
- Submit form
- Kiểm tra response

### Bước 2: Test Backend API

#### 2.1 Chạy backend
```bash
cd backend
npm start
```

#### 2.2 Test API với Postman
```
POST http://localhost:5000/api/users/instructor-register
Content-Type: multipart/form-data

Fields:
- fullName: "Nguyễn Văn Test"
- email: "test@example.com"
- phone: "0123456789"
- password: "password123"
- gender: "male"
- dateOfBirth: "1990-01-01"
- address: "123 Test Street"
- degree: "Cử nhân"
- institution: "Đại học Test"
- graduationYear: "2015"
- major: "Công nghệ thông tin"
- specializations: ["JavaScript", "React"]
- teachingExperience: "5"
- experienceDescription: "Có 5 năm kinh nghiệm"
- bio: "Giảng viên có kinh nghiệm"
- linkedin: "https://linkedin.com/in/test"
- github: "https://github.com/test"
- website: "https://test.com"
- avatar: [file]
- cv: [file]
- certificates: [files]
- demoVideo: [file] (optional)
```

#### 2.3 Test với script
```bash
cd backend
node test-instructor-registration.js
```

### Bước 3: Test Database

#### 3.1 Kiểm tra user được tạo
```javascript
// Trong MongoDB
db.users.findOne({email: "test@example.com"})
```

#### 3.2 Kiểm tra instructorInfo
```javascript
db.users.findOne(
  {email: "test@example.com"}, 
  {instructorInfo: 1, education: 1}
)
```

## 🔍 Debug Checklist

### Frontend Issues
- [ ] DatePicker trả về dayjs object
- [ ] Form validation hoạt động
- [ ] File upload thành công
- [ ] API call thành công

### Backend Issues
- [ ] Middleware upload hoạt động
- [ ] Validation dữ liệu
- [ ] File upload lên Cloudinary
- [ ] Tạo user trong database
- [ ] Response format đúng

### Database Issues
- [ ] User được tạo với đúng role
- [ ] instructorInfo được lưu đúng
- [ ] education array được lưu
- [ ] Files được lưu đúng URL

## 🐛 Common Issues & Solutions

### Issue 1: DatePicker undefined
**Symptom:** `dateOfBirth value: undefined`
**Solution:** Sử dụng `form.getFieldValue('dateOfBirth')` thay vì `values.dateOfBirth`

### Issue 2: toString() error
**Symptom:** `Cannot read properties of undefined (reading 'toString')`
**Solution:** Thêm null check: `values.field?.toString() || ''`

### Issue 3: File upload failed
**Symptom:** `File quá lớn` hoặc `Loại file không được hỗ trợ`
**Solution:** Kiểm tra file size và type trong middleware

### Issue 4: Validation failed
**Symptom:** `Thiếu thông tin bắt buộc`
**Solution:** Kiểm tra tất cả required fields được gửi

## 📊 Expected Results

### Frontend Success
```javascript
// Console logs
DatePicker onChange - date: Dayjs {_d: Date, _isValid: true, ...}
DatePicker onChange - isDayjs: true
Formatted date: 1990-01-01

// Response
{
  success: true,
  message: "Đăng ký giảng viên thành công! Hồ sơ đang chờ admin phê duyệt.",
  data: {
    user: {
      _id: "...",
      fullname: "Nguyễn Văn Test",
      email: "test@example.com",
      approval_status: "pending"
    },
    instructorInfo: {...}
  }
}
```

### Backend Success
```javascript
// Console logs
Received instructor registration data: {
  fullName: "Nguyễn Văn Test",
  email: "test@example.com",
  // ... other fields
}
Instructor registration successful: {
  userId: "...",
  email: "test@example.com",
  approvalStatus: "pending"
}
```

### Database Success
```javascript
// User document
{
  _id: ObjectId("..."),
  fullname: "Nguyễn Văn Test",
  email: "test@example.com",
  role_id: ObjectId("..."), // student role
  approval_status: "pending",
  instructorInfo: {
    is_approved: false,
    experience_years: 5,
    specializations: ["JavaScript", "React", "Node.js"],
    // ... other fields
  },
  education: [{
    degree: "Cử nhân",
    institution: "Đại học Test",
    year: 2015,
    major: "Công nghệ thông tin"
  }]
}
```

## 🧪 Test Cases

### Test Case 1: Happy Path
- Điền đầy đủ form
- Upload tất cả files
- Submit thành công

### Test Case 2: Validation Errors
- Thiếu required fields
- Email không hợp lệ
- Password quá ngắn
- File quá lớn

### Test Case 3: Edge Cases
- Email đã tồn tại
- DateOfBirth trong tương lai
- Specializations rỗng
- Files không đúng format

### Test Case 4: File Upload
- Avatar (JPG/PNG)
- CV (PDF)
- Certificates (PDF/JPG)
- Demo video (MP4)

## 📞 Reporting Issues

Khi báo cáo lỗi, cung cấp:

1. **Environment:**
   - Frontend version
   - Backend version
   - Database version
   - Browser version

2. **Steps to reproduce:**
   - Chi tiết các bước thực hiện
   - Dữ liệu input

3. **Expected vs Actual:**
   - Kết quả mong đợi
   - Kết quả thực tế

4. **Logs:**
   - Frontend console logs
   - Backend console logs
   - Network requests

5. **Screenshots/Videos:**
   - UI errors
   - Console errors
   - Network tab

## 🎉 Success Criteria

Tính năng được coi là hoạt động tốt khi:

- [ ] Form validation hoạt động chính xác
- [ ] File upload thành công
- [ ] API trả về response đúng format
- [ ] User được tạo trong database
- [ ] instructorInfo được lưu đầy đủ
- [ ] education array được lưu đúng
- [ ] Files được upload lên Cloudinary
- [ ] Không có lỗi trong console
- [ ] UI hiển thị thông báo thành công 