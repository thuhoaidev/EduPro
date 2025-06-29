# Voucher API Guide

## 📋 Tổng quan

Hệ thống voucher đã được cập nhật với các tính năng mới:
- ✅ Chỉ hiển thị voucher còn hạn cho client
- ✅ Mỗi tài khoản chỉ được dùng 1 voucher 1 lần trong 1 đơn hàng
- ✅ Hiển thị trạng thái "hết voucher" khi hết lượt sử dụng

## 🗄️ Database Models

### Voucher Model
```javascript
{
  code: String,           // Mã voucher (unique)
  title: String,          // Tiêu đề
  description: String,    // Mô tả
  discountType: String,   // 'percentage' | 'fixed'
  discountValue: Number,  // Giá trị giảm
  maxDiscount: Number,    // Giảm tối đa
  minOrderValue: Number,  // Điều kiện đơn hàng tối thiểu
  usageLimit: Number,     // Số lượt sử dụng tối đa
  usedCount: Number,      // Số lượt đã sử dụng
  startDate: Date,        // Ngày bắt đầu
  endDate: Date,          // Ngày kết thúc
  // ... các field khác
}
```

### VoucherUsage Model (Mới)
```javascript
{
  userId: ObjectId,       // ID user sử dụng
  voucherId: ObjectId,    // ID voucher
  orderId: ObjectId,      // ID đơn hàng
  usedAt: Date           // Thời gian sử dụng
}
```

### Order Model (Mới)
```javascript
{
  userId: ObjectId,       // ID user
  items: Array,          // Danh sách khóa học
  totalAmount: Number,    // Tổng tiền
  discountAmount: Number, // Số tiền giảm
  finalAmount: Number,    // Số tiền cuối
  voucherId: ObjectId,    // ID voucher (nếu có)
  status: String,         // Trạng thái đơn hàng
  // ... các field khác
}
```

## 🔌 API Endpoints

### 1. GET /api/vouchers
**Mô tả:** Lấy danh sách tất cả voucher (cho admin)
**Auth:** Không cần
**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": [
    {
      "id": "...",
      "code": "WELCOME50",
      "title": "Giảm 50% cho người mới",
      "discountType": "percentage",
      "discountValue": 50,
      "usedCount": 234,
      "usageLimit": 1000,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      // ... các field khác
    }
  ]
}
```

### 2. GET /api/vouchers/available
**Mô tả:** Lấy danh sách voucher khả dụng (cho client)
**Auth:** Không cần
**Filter:** Chỉ trả về voucher còn hạn và còn lượt sử dụng
**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá khả dụng thành công",
  "data": [
    {
      "id": "...",
      "code": "WELCOME50",
      "title": "Giảm 50% cho người mới",
      "isValid": true,
      "status": "available",
      "statusMessage": "Có thể sử dụng",
      // ... các field khác
    }
  ]
}
```

### 3. POST /api/vouchers/validate
**Mô tả:** Kiểm tra voucher có thể sử dụng cho user không
**Auth:** Cần (Bearer token)
**Body:**
```json
{
  "code": "WELCOME50",
  "orderAmount": 200000
}
```
**Response:**
```json
{
  "success": true,
  "message": "Voucher hợp lệ",
  "data": {
    "voucher": {
      "id": "...",
      "code": "WELCOME50",
      "title": "Giảm 50% cho người mới",
      "discountType": "percentage",
      "discountValue": 50,
      "maxDiscount": 500000,
      "minOrderValue": 100000
    },
    "discountAmount": 100000,
    "finalAmount": 100000
  }
}
```

### 4. POST /api/vouchers/apply
**Mô tả:** Áp dụng voucher vào đơn hàng
**Auth:** Cần (Bearer token)
**Body:**
```json
{
  "voucherId": "...",
  "orderId": "...",
  "orderAmount": 200000
}
```
**Response:**
```json
{
  "success": true,
  "message": "Áp dụng voucher thành công"
}
```

## 🧪 Test Scripts

### Tạo voucher mẫu
```bash
cd backend
node scripts/create_sample_vouchers.js
```

### Test API
```bash
cd backend
node test-voucher-api.js
```

## 🔍 Validation Logic

### Kiểm tra voucher hợp lệ
1. **Ngày bắt đầu:** `startDate <= now`
2. **Ngày kết thúc:** `endDate > now` hoặc `endDate` không tồn tại
3. **Số lượt sử dụng:** `usedCount < usageLimit`
4. **Điều kiện đơn hàng:** `orderAmount >= minOrderValue`
5. **User chưa dùng:** Không có record trong `VoucherUsage`

### Tính toán discount
- **Percentage:** `discountAmount = (orderAmount * discountValue) / 100`
- **Fixed:** `discountAmount = discountValue`
- **Max discount:** `discountAmount = Math.min(discountAmount, maxDiscount)`

## 🚨 Error Messages

| Lỗi | Message |
|-----|---------|
| Voucher không tồn tại | "Mã giảm giá không tồn tại" |
| Voucher chưa có hiệu lực | "Voucher chưa có hiệu lực" |
| Voucher đã hết hạn | "Voucher đã hết hạn" |
| Voucher đã hết lượt | "Voucher đã hết lượt sử dụng" |
| Order amount thấp | "Đơn hàng tối thiểu Xđ để sử dụng voucher này" |
| User đã dùng voucher | "Bạn đã sử dụng voucher này rồi" |
| Thiếu auth | "Access denied" |

## 📊 Status Codes

| Code | Mô tả |
|------|-------|
| 200 | Thành công |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (thiếu auth) |
| 404 | Voucher không tồn tại |
| 500 | Server error |

## 🔄 Workflow

### Client sử dụng voucher
1. Gọi `GET /api/vouchers/available` để lấy danh sách voucher khả dụng
2. User nhập mã voucher trong cart
3. Gọi `POST /api/vouchers/validate` để kiểm tra voucher
4. Nếu hợp lệ, hiển thị discount amount
5. Khi checkout, gọi `POST /api/vouchers/apply` để áp dụng voucher
6. Tạo order với voucherId và discountAmount

### Admin quản lý voucher
1. Gọi `GET /api/vouchers` để xem tất cả voucher
2. Sử dụng các API CRUD để quản lý voucher
3. Theo dõi `usedCount` để biết voucher đã được sử dụng bao nhiêu lần 