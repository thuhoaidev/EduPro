# Realtime Email Verification - EduPro Platform

## Tổng quan

Đã cải thiện hệ thống xác minh email với tính năng realtime notifications để cải thiện trải nghiệm người dùng. Người dùng không cần phải F5 lại trang để thấy thông báo xác minh thành công.

## Các cải tiến đã thực hiện

### 1. **Frontend Improvements**

#### Trang xác minh email chính (`verifyEmail.tsx`)
- ✅ Thêm realtime socket connection
- ✅ Hiển thị thông báo thành công ngay lập tức
- ✅ Đếm ngược tự động chuyển hướng
- ✅ Phân biệt xác minh email thường và giảng viên
- ✅ Hiển thị quy trình tiếp theo cho giảng viên
- ✅ Thêm hướng dẫn khắc phục khi lỗi

#### Trang xác minh email giảng viên (`verifyInstructorEmail.tsx`)
- ✅ Đồng bộ với trang xác minh chính
- ✅ Sử dụng service chính thay vì instructorService
- ✅ Thêm realtime notifications
- ✅ Cải thiện UX với countdown và hướng dẫn

#### Component RealtimeNotification
- ✅ Hiển thị realtime notifications toàn cục
- ✅ Listen các events: `email-verified`, `instructor-approved`
- ✅ Badge đếm số notifications
- ✅ Tự động kết nối socket

### 2. **Backend Improvements**

#### Controller xác minh email (`auth.controller.js`)
- ✅ Thêm emit realtime event `email-verified`
- ✅ Gửi thông tin user đầy đủ qua socket

#### Controller xác minh email giảng viên (`user.controller.js`)
- ✅ Thêm emit realtime event `email-verified`
- ✅ Thêm emit realtime event `instructor-approved`
- ✅ Gửi thông tin chi tiết qua socket

#### Server setup (`server.js`)
- ✅ Socket.io đã được setup sẵn
- ✅ CORS configuration cho frontend
- ✅ Event handlers cho auth events

### 3. **Realtime Events**

#### `email-verified`
```javascript
{
  token: "verification-token",
  userId: "user-id",
  email: "user@example.com",
  fullname: "User Name",
  isInstructor: true/false,
  timestamp: Date
}
```

#### `instructor-approved`
```javascript
{
  userId: "user-id",
  email: "instructor@example.com",
  fullname: "Instructor Name",
  status: "approved" | "rejected",
  rejection_reason: "reason if rejected",
  approvedBy: "admin-id",
  timestamp: Date
}
```

## Cách sử dụng

### 1. **Xác minh email thông thường**
1. User đăng ký tài khoản
2. Nhận email xác minh
3. Click vào link xác minh
4. Trang tự động hiển thị thông báo thành công
5. Tự động chuyển hướng sau 5 giây

### 2. **Xác minh email giảng viên**
1. User đăng ký làm giảng viên
2. Nhận email xác minh
3. Click vào link xác minh
4. Trang hiển thị thông báo thành công + quy trình tiếp theo
5. Tự động chuyển hướng sau 5 giây
6. Nhận realtime notification khi admin duyệt hồ sơ

### 3. **Admin duyệt giảng viên**
1. Admin duyệt hồ sơ giảng viên
2. Hệ thống emit realtime event
3. Giảng viên nhận notification ngay lập tức
4. Email thông báo cũng được gửi

## Testing

### Test realtime notifications
```bash
cd backend
node scripts/test-realtime.js
```

### Test email verification
1. Đăng ký tài khoản mới
2. Kiểm tra email
3. Click link xác minh
4. Quan sát realtime notification

## Cấu hình

### Environment Variables
```env
# Frontend URL cho email verification
FRONTEND_URL=http://localhost:5173

# Socket.io server
SOCKET_URL=http://localhost:5000
```

### Socket Connection
```javascript
// Frontend
import socket from '../services/socket';

// Kết nối
socket.connect();

// Listen events
socket.on('email-verified', (data) => {
  console.log('Email verified:', data);
});

socket.on('instructor-approved', (data) => {
  console.log('Instructor approved:', data);
});
```

## Troubleshooting

### Lỗi thường gặp

1. **Socket không kết nối**
   - Kiểm tra backend server đang chạy
   - Kiểm tra CORS configuration
   - Kiểm tra network connection

2. **Không nhận được realtime notifications**
   - Kiểm tra socket connection status
   - Kiểm tra event listeners
   - Kiểm tra console logs

3. **Email verification không hoạt động**
   - Kiểm tra token trong URL
   - Kiểm tra backend logs
   - Kiểm tra database connection

### Debug
```javascript
// Frontend debug
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);

// Backend debug
console.log('Realtime event emitted:', eventData);
```

## Performance

- ✅ Socket connection được quản lý hiệu quả
- ✅ Auto-reconnect khi mất kết nối
- ✅ Cleanup listeners khi component unmount
- ✅ Debounced notifications để tránh spam

## Security

- ✅ Token verification trên backend
- ✅ CORS protection
- ✅ Rate limiting cho email verification
- ✅ Secure socket connection

## Future Improvements

- [ ] Thêm push notifications
- [ ] Thêm email templates đẹp hơn
- [ ] Thêm SMS verification
- [ ] Thêm 2FA support
- [ ] Thêm audit logs cho verification events