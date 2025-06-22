# Hướng dẫn cấu hình Email SMTP cho EduPro

## Tổng quan
Hệ thống EduPro sử dụng SMTP để gửi email xác minh cho quá trình đăng ký giảng viên. Email được gửi qua NodeMailer với các template HTML đẹp mắt.

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (để tạo link xác minh)
FRONTEND_URL=http://localhost:5173
```

## Cấu hình cho Gmail (Khuyến nghị)

### Bước 1: Bật 2-Step Verification
1. Vào Google Account settings
2. Security > 2-Step Verification > Turn on

### Bước 2: Tạo App Password
1. Vào Google Account settings
2. Security > 2-Step Verification > App passwords
3. Select app: Mail
4. Select device: Other (Custom name)
5. Nhập tên: "EduPro Platform"
6. Click Generate
7. Copy password được tạo (16 ký tự)

### Bước 3: Cấu hình .env
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

## Cấu hình cho các SMTP khác

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_email@outlook.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_email@yahoo.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

### Custom SMTP Server
```env
EMAIL_HOST=your_smtp_server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
```

## Test Email Configuration

### Bước 1: Khởi động server
```bash
cd backend
npm start
```

### Bước 2: Test đăng ký giảng viên
1. Mở Postman
2. Tạo request POST: `http://localhost:5000/api/users/instructor-register`
3. Sử dụng form-data với các field cần thiết
4. Gửi request
5. Kiểm tra console log để xem email có được gửi không

### Bước 3: Kiểm tra email
1. Kiểm tra inbox của email đã cấu hình
2. Kiểm tra thư mục spam nếu không thấy
3. Email sẽ có subject: "Xác minh email - Đăng ký giảng viên EduPro"

## Troubleshooting

### Lỗi thường gặp

#### 1. "Invalid login" hoặc "Authentication failed"
- **Nguyên nhân**: Sai password hoặc chưa dùng App Password
- **Giải pháp**: 
  - Đảm bảo đã bật 2-Step Verification
  - Tạo App Password mới
  - Sử dụng App Password thay vì password thường

#### 2. "Connection timeout"
- **Nguyên nhân**: Firewall hoặc network issue
- **Giải pháp**:
  - Kiểm tra firewall
  - Thử port 465 với EMAIL_SECURE=true
  - Kiểm tra kết nối internet

#### 3. "Message size exceeds fixed maximum message size"
- **Nguyên nhân**: File đính kèm quá lớn
- **Giải pháp**: Giảm kích thước file hoặc nén file

#### 4. "Rate limit exceeded"
- **Nguyên nhân**: Gửi quá nhiều email trong thời gian ngắn
- **Giải pháp**: Đợi một lúc rồi thử lại

### Debug Email

Thêm log để debug:

```javascript
// Trong sendEmail.js
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});
```

## Security Best Practices

1. **Không commit .env file**: Đảm bảo .env không được commit lên git
2. **Sử dụng App Password**: Luôn dùng App Password thay vì password thường
3. **Environment-specific configs**: Sử dụng config khác nhau cho dev/prod
4. **Rate limiting**: Implement rate limiting cho email sending
5. **Email validation**: Validate email format trước khi gửi

## Production Deployment

### Vercel/Netlify
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=your_production_email@gmail.com
EMAIL_FROM_NAME=EduPro Platform
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_production_app_password
FRONTEND_URL=https://your-domain.com
```

### Heroku
```bash
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_SECURE=false
heroku config:set EMAIL_FROM=your_email@gmail.com
heroku config:set EMAIL_FROM_NAME="EduPro Platform"
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASS=your_app_password
heroku config:set FRONTEND_URL=https://your-domain.com
```

## Email Templates

Hệ thống sử dụng 2 loại email:

1. **Verification Email**: Gửi khi đăng ký giảng viên
   - Subject: "Xác minh email - Đăng ký giảng viên EduPro"
   - Content: Link xác minh + hướng dẫn

2. **Profile Submitted Email**: Gửi sau khi xác minh email
   - Subject: "Hồ sơ giảng viên đã được gửi - EduPro"
   - Content: Thông báo hồ sơ đã được gửi cho admin

## API Endpoints

### 1. Đăng ký giảng viên
```
POST /api/users/instructor-register
```
- Gửi email verification
- Tạo user với status 'inactive'

### 2. Xác minh email
```
GET /api/users/verify-instructor-email/:token
```
- Xác minh email
- Cập nhật status thành 'active'
- Gửi email thông báo hồ sơ đã được gửi

## Monitoring

### Log Email Sending
```javascript
// Trong user.controller.js
console.log('Verification email sent successfully to:', email);
console.log('Profile submitted email sent successfully to:', email);
```

### Check Email Status
```javascript
// Kiểm tra trạng thái email
const user = await User.findById(userId);
console.log('User email status:', {
  email: user.email,
  email_verified: user.email_verified,
  status: user.status,
  approval_status: user.approval_status
});
```

## Support

Nếu gặp vấn đề với cấu hình email:
1. Kiểm tra log trong console
2. Verify SMTP settings
3. Test với email client khác
4. Liên hệ support: support@edupro.com 