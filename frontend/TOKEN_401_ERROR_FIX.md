# Hướng dẫn khắc phục lỗi 401 (Unauthorized)

## Mô tả lỗi
Lỗi 401 (Unauthorized) xảy ra khi:
- Token JWT đã hết hạn
- Token không hợp lệ hoặc bị hỏng
- Refresh token không hoạt động
- Token không được gửi đúng cách trong header

## Các API bị ảnh hưởng
- `/api/carts` - Lấy giỏ hàng
- `/api/users/me/enrollments` - Lấy danh sách khóa học đã đăng ký
- `/api/carts` (POST) - Thêm vào giỏ hàng

## Giải pháp đã triển khai

### 1. Cải thiện Axios Interceptor
- Thêm queue để xử lý multiple requests khi refresh token
- Xử lý tốt hơn các trường hợp lỗi
- Tự động redirect khi token không thể refresh

### 2. Utility Functions
- `tokenUtils.ts`: Các hàm tiện ích để xử lý token
- `debugToken.ts`: Các hàm debug token
- Kiểm tra tính hợp lệ của token trước khi sử dụng

### 3. Cải thiện Error Handling
- CartContext: Kiểm tra token trước khi gọi API
- CartPage: Xử lý lỗi 401 một cách graceful
- Thông báo rõ ràng cho người dùng

### 4. AuthNotification Component
- Cảnh báo khi token sắp hết hạn (10 phút trước)
- Tự động kiểm tra token mỗi phút

### 5. Debug Panel (Development)
- Hiển thị thông tin token real-time
- Các nút để debug và test token
- Chỉ hiển thị trong development mode

## Cách sử dụng

### 1. Kiểm tra token hiện tại
```javascript
// Trong console browser
import { debugToken } from './utils/debugToken';
debugToken();
```

### 2. Test token validity
```javascript
// Trong console browser
import { testTokenValidity } from './utils/debugToken';
testTokenValidity();
```

### 3. Clear all tokens
```javascript
// Trong console browser
import { clearAllTokens } from './utils/debugToken';
clearAllTokens();
```

### 4. Sử dụng utility functions
```javascript
import { isTokenValid, getToken, checkAuthAndRedirect } from './utils/tokenUtils';

// Kiểm tra token có hợp lệ không
if (isTokenValid()) {
  // Token hợp lệ
}

// Lấy token nếu hợp lệ
const token = getToken();

// Kiểm tra và redirect nếu cần
checkAuthAndRedirect();
```

## Cách khắc phục nhanh

### 1. Nếu đang gặp lỗi 401:
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Chạy lệnh: `localStorage.clear()`
4. Refresh trang
5. Đăng nhập lại

### 2. Nếu token sắp hết hạn:
- Hệ thống sẽ tự động hiển thị cảnh báo
- Lưu công việc hiện tại
- Đăng nhập lại khi cần

### 3. Nếu refresh token không hoạt động:
- Xóa tất cả token: `localStorage.clear()`
- Đăng nhập lại để lấy token mới

## Monitoring và Debug

### 1. Debug Panel
- Hiển thị ở góc phải trên cùng (chỉ trong development)
- Hiển thị trạng thái token real-time
- Các nút để debug và test

### 2. Console Logs
- Token được log trước mỗi request
- Thông báo khi refresh token
- Thông báo khi token hết hạn

### 3. Network Tab
- Kiểm tra request headers có Authorization không
- Kiểm tra response status codes
- Theo dõi refresh token requests

## Best Practices

### 1. Luôn kiểm tra token trước khi gọi API
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Xử lý khi không có token
  return;
}
```

### 2. Xử lý lỗi 401 gracefully
```javascript
try {
  const response = await api.get('/endpoint');
} catch (error) {
  if (error.response?.status === 401) {
    // Token không hợp lệ, axios interceptor sẽ xử lý
    console.log('Token không hợp lệ');
  }
}
```

### 3. Sử dụng utility functions
```javascript
import { isTokenValid } from './utils/tokenUtils';

if (!isTokenValid()) {
  // Redirect to login
  window.location.href = '/login';
}
```

## Troubleshooting

### 1. Token không được gửi
- Kiểm tra localStorage có token không
- Kiểm tra axios interceptor có hoạt động không
- Kiểm tra network tab để xem headers

### 2. Refresh token không hoạt động
- Kiểm tra localStorage có refresh_token không
- Kiểm tra API endpoint `/auth/refresh-token`
- Kiểm tra console logs

### 3. Multiple 401 errors
- Có thể do race condition khi refresh token
- Đã implement queue để xử lý
- Kiểm tra console logs để debug

## Notes
- Token JWT có thời hạn 24 giờ
- Refresh token có thời hạn 7 ngày
- Hệ thống sẽ tự động refresh token khi cần
- Nếu refresh thất bại, user sẽ được redirect đến trang login 