# Voucher Frontend Guide

## 📋 Tổng quan

Frontend đã được cập nhật để đồng bộ với luồng voucher mới từ backend:
- ✅ Sử dụng API `/vouchers/available` để lấy voucher khả dụng
- ✅ Validate voucher trong CartPage với API `/vouchers/validate`
- ✅ Hiển thị trạng thái "Hết voucher" khi voucher không khả dụng
- ✅ UI/UX cải thiện với loading states và error handling

## 🔄 Các thay đổi chính

### 1. **VoucherService** (`src/services/voucher.service.ts`)
- Thêm method `getAvailable()` để lấy voucher khả dụng
- Thêm method `validate()` để kiểm tra voucher
- Thêm method `apply()` để áp dụng voucher
- Thêm interfaces cho validation và apply

### 2. **VouchersPage** (`src/pages/client/VouchersPage.tsx`)
- Sử dụng API `/vouchers/available` thay vì `/vouchers`
- Hiển thị trạng thái voucher (available/unavailable)
- Hiển thị status message khi voucher không khả dụng
- Disable copy button cho voucher không khả dụng

### 3. **CartPage** (`src/pages/client/CartPage.tsx`)
- Thêm validation voucher với API `/vouchers/validate`
- Hiển thị discount amount và final amount
- Error handling cho voucher không hợp lệ
- UI cải thiện với success/error states

### 4. **Homepage** (`src/pages/Homepage.tsx`)
- Sử dụng API voucher thay vì mock data
- Fallback to mock data nếu API fails
- Hiển thị trạng thái voucher trong hero section

## 🧪 Test Cases

### Test 1: VouchersPage
1. Truy cập `/vouchers`
2. Kiểm tra chỉ hiển thị voucher còn hạn và còn lượt
3. Kiểm tra voucher "Hết voucher" có opacity thấp
4. Test copy button chỉ hoạt động với voucher khả dụng

### Test 2: CartPage
1. Thêm khóa học vào cart
2. Nhập mã voucher hợp lệ (WELCOME50)
3. Kiểm tra hiển thị discount amount
4. Test voucher không hợp lệ
5. Test voucher đã hết lượt

### Test 3: Homepage
1. Kiểm tra voucher section hiển thị đúng
2. Test fallback khi API fails
3. Kiểm tra trạng thái voucher

## 🔧 Setup để test

### 1. Khởi động Backend
```bash
cd backend
npm start
```

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```

### 3. Tạo voucher mẫu
```bash
cd backend
node scripts/create_sample_vouchers.js
```

## 📊 Voucher Test Data

| Code | Type | Value | Status | Description |
|------|------|-------|--------|-------------|
| WELCOME50 | Percentage | 50% | Available | Giảm 50% cho người mới |
| FLASH200K | Fixed | 200K | Available | Giảm 200K cho khóa học IT |
| SUMMER30 | Percentage | 30% | Available | Giảm 30% mùa hè |
| VIP100K | Fixed | 100K | Available | Giảm 100K cho VIP |
| EXPIRED50 | Percentage | 50% | Unavailable | Voucher đã hết hạn |
| FULLUSED | Percentage | 20% | Unavailable | Voucher đã hết lượt |

## 🚨 Error Handling

### Frontend Errors
- **API Error**: Hiển thị message từ backend
- **Network Error**: Fallback to mock data
- **Validation Error**: Hiển thị lý do voucher không hợp lệ

### Common Error Messages
- "Vui lòng đăng nhập để sử dụng voucher!"
- "Mã giảm giá không tồn tại"
- "Voucher đã hết lượt sử dụng"
- "Đơn hàng tối thiểu Xđ để sử dụng voucher này"

## 🎨 UI/UX Improvements

### Loading States
- Spinner khi đang validate voucher
- Skeleton loading cho voucher list
- Disabled buttons khi đang xử lý

### Visual Feedback
- Green border cho voucher hợp lệ
- Red border cho voucher lỗi
- Opacity thấp cho voucher không khả dụng
- Success/error messages với animation

### Accessibility
- Disabled states cho voucher không khả dụng
- Clear error messages
- Keyboard navigation support

## 🔄 Workflow Test

### 1. User Journey
1. User xem voucher trên Homepage
2. User copy mã voucher
3. User thêm khóa học vào cart
4. User nhập mã voucher trong cart
5. User thấy discount amount
6. User checkout với voucher

### 2. Error Scenarios
1. User chưa đăng nhập → Hiển thị message yêu cầu đăng nhập
2. Voucher không tồn tại → Hiển thị error message
3. Voucher đã hết lượt → Hiển thị "Hết voucher"
4. Order amount thấp → Hiển thị điều kiện tối thiểu

## 📱 Responsive Design

- Mobile: Voucher cards stack vertically
- Tablet: 2 columns layout
- Desktop: 3 columns layout
- Touch-friendly copy buttons
- Optimized spacing cho mobile

## 🔒 Security

- Token validation cho voucher operations
- User authentication required
- Input sanitization
- Rate limiting (backend)

## 🚀 Performance

- Lazy loading cho voucher images
- Caching voucher data
- Optimized API calls
- Debounced search input 