# Sửa lỗi thanh toán bằng Momo khi mua hàng

## Vấn đề
- ✅ Nạp tiền vào ví bằng Momo đã hoạt động tốt
- ❌ Thanh toán khóa học bằng Momo đang bị lỗi

## Nguyên nhân
1. Thiếu xử lý callback cho thanh toán đơn hàng bằng Momo
2. Không tạo đơn hàng trước khi chuyển hướng thanh toán
3. Không xử lý kết quả thanh toán để cập nhật trạng thái đơn hàng

## Giải pháp đã thực hiện

### 1. Backend - Tạo callback handler cho đơn hàng Momo

**File: `backend/src/controllers/order.controller.js`**
- Thêm method `handleMomoOrderCallback()` để xử lý callback từ Momo
- Cập nhật trạng thái đơn hàng khi thanh toán thành công
- Tạo enrollment cho khóa học
- Cộng tiền vào ví giáo viên
- Gửi notification cho user

**File: `backend/src/routes/order.routes.js`**
- Thêm route `/momo-callback` cho callback thanh toán đơn hàng
- Route này không cần auth vì Momo gọi từ bên ngoài

**File: `backend/src/routes/paymentMomoRouter.js`**
- Sửa lại để tạo đơn hàng trước khi tạo payment Momo
- Cập nhật IPN URL để trỏ đến callback đơn hàng
- Trả về orderId cùng với payUrl

### 2. Frontend - Cập nhật xử lý thanh toán

**File: `frontend/src/pages/client/CheckoutPage.tsx`**
- Gửi orderData khi tạo payment Momo
- Lưu pendingOrder vào localStorage

**File: `frontend/src/pages/client/PaymentResultPage.tsx`**
- Xử lý callback cho cả nạp tiền và thanh toán đơn hàng
- Xác định endpoint dựa trên loại giao dịch
- Xóa pendingOrder khi thanh toán thành công

### 3. Logic xử lý thanh toán

**Thanh toán bằng ví hoặc bank_transfer:**
- Tạo đơn hàng với trạng thái 'paid' ngay lập tức
- Tạo enrollment, cộng tiền giáo viên, xóa giỏ hàng

**Thanh toán bằng Momo/VNPAY/ZaloPay:**
- Tạo đơn hàng với trạng thái 'pending'
- Chờ callback từ cổng thanh toán
- Cập nhật trạng thái khi có kết quả thanh toán

## Cách test

### 1. Test nạp tiền Momo
```bash
# Chạy test script
node backend/test-momo-payment.js
```

### 2. Test thanh toán đơn hàng Momo
1. Thêm khóa học vào giỏ hàng
2. Chọn thanh toán bằng Momo
3. Hoàn thành thanh toán trên Momo
4. Kiểm tra callback và cập nhật trạng thái

### 3. Kiểm tra logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend console
# Mở Developer Tools để xem logs
```

## Cấu hình Momo

**Sandbox config:**
```javascript
const config = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85", 
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "http://localhost:5173/payment-result?paymentMethod=momo",
  ipnUrl: "http://localhost:5000/api/orders/momo-callback"
};
```

## Endpoints

### Nạp tiền
- `POST /api/wallet/deposit` - Tạo yêu cầu nạp tiền
- `POST /api/wallet/momo-callback` - Callback nạp tiền

### Thanh toán đơn hàng  
- `POST /payment-momo/create_momo_payment` - Tạo payment Momo
- `POST /api/orders/momo-callback` - Callback thanh toán đơn hàng

## Troubleshooting

### Lỗi thường gặp

1. **Callback không được gọi**
   - Kiểm tra IPN URL có đúng không
   - Kiểm tra server có accessible từ internet không
   - Sử dụng ngrok để test local

2. **Đơn hàng không được cập nhật**
   - Kiểm tra orderId có đúng không
   - Kiểm tra logs backend
   - Kiểm tra database connection

3. **Enrollment không được tạo**
   - Kiểm tra user có tồn tại không
   - Kiểm tra course có tồn tại không
   - Kiểm tra logic tạo enrollment

### Debug

```javascript
// Thêm logs để debug
console.log('Momo callback received:', {
  resultCode, 
  message, 
  orderId, 
  amount, 
  transId 
});
```

## Kết quả mong đợi

✅ Thanh toán khóa học bằng Momo hoạt động bình thường
✅ Đơn hàng được cập nhật trạng thái khi thanh toán thành công  
✅ User được enrollment vào khóa học
✅ Giáo viên nhận được tiền
✅ Notification được gửi cho user
✅ Giỏ hàng được xóa sau khi thanh toán thành công 