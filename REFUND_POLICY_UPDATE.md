# Cập nhật Chính sách Hoàn tiền Khóa học

## 📋 Điều kiện hoàn tiền mới (cập nhật)

### ✅ **Các điều kiện được phép hoàn tiền:**

1. **Thời gian mua hàng**: Phải mua khóa học **dưới 7 ngày** (tính từ ngày tạo đơn hàng)

2. **Tiến độ học tập**: **Tiến độ học phải dưới 20%** (tính theo số bài học đã hoàn thành)

3. **Trạng thái đơn hàng**: 
   - Đơn hàng phải có trạng thái `paid` (đã thanh toán)
   - Chưa được hoàn tiền trước đó (không có `refundedAt` và status không phải `refunded`)

4. **Quyền sở hữu**: 
   - Chỉ người mua khóa học mới có thể yêu cầu hoàn tiền
   - Phải đăng nhập và xác thực

5. **Tính hợp lệ của khóa học**:
   - Khóa học phải tồn tại trong đơn hàng
   - Phải đã đăng ký học khóa học đó

### ❌ **Các trường hợp KHÔNG được hoàn tiền:**

1. **Quá thời hạn**: Mua khóa học trên 7 ngày
2. **Tiến độ vượt quá**: Đã hoàn thành trên 20% bài học
3. **Đã hoàn tiền**: Đơn hàng đã được hoàn tiền trước đó
4. **Không tìm thấy đơn hàng**: Đơn hàng không tồn tại hoặc không thuộc về user
5. **Không chứa khóa học**: Đơn hàng không có khóa học được yêu cầu hoàn tiền

### 💰 **Mức hoàn tiền:**

- **Hoàn tiền 70%** giá trị đã trả cho khóa học
- Tiền được cộng vào **ví người dùng** (UserWallet)
- Số tiền được làm tròn theo đơn vị VND

### 🔄 **Quy trình hoàn tiền:**

1. **Kiểm tra điều kiện** → Xác minh thời gian, tiến độ, trạng thái, quyền sở hữu
2. **Tính toán số tiền** → 70% × giá khóa học × số lượng
3. **Cộng tiền vào ví** → Cập nhật balance và lịch sử giao dịch
4. **Cập nhật trạng thái** → Đánh dấu đơn hàng đã hoàn tiền
5. **Xóa enrollment** → Hủy đăng ký khóa học của user

### 🎯 **Giao diện người dùng:**

- Nút "Hoàn tiền 70%" hiển thị thông tin tiến độ và thời gian còn lại
- Thông báo rõ ràng khi không đủ điều kiện hoàn tiền
- Hiển thị phần trăm tiến độ hiện tại
- Thông báo thành công/thất bại chi tiết

### 📊 **Cách tính tiến độ:**

- Tiến độ = (Số bài học đã hoàn thành / Tổng số bài học) × 100%
- Bài học được tính là "hoàn thành" khi:
  - Đã xem đủ 90% video
  - Đã vượt qua quiz (nếu có)
  - Trường `completed = true` trong enrollment progress

### 🔧 **Cập nhật kỹ thuật:**

1. **Backend**: Thêm logic kiểm tra tiến độ trong `refundOrder`
2. **API mới**: `GET /api/orders/check-refund/:courseId` để kiểm tra điều kiện
3. **Frontend**: Cập nhật UI hiển thị thông tin chi tiết
4. **Service**: Thêm method `checkRefundEligibility` trong OrderService

### 📝 **Lưu ý:**

- Điều kiện 20% tiến độ giúp bảo vệ quyền lợi của giảng viên
- Người dùng vẫn có 7 ngày để thử nghiệm khóa học
- Thông tin tiến độ được tính toán real-time
- Hệ thống tự động cập nhật trạng thái hoàn tiền 