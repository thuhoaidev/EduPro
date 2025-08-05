# Hệ thống Hóa đơn Rút tiền - EduPro

## Tổng quan

Hệ thống hóa đơn rút tiền được tích hợp vào nền tảng EduPro để tự động tạo hóa đơn khi admin duyệt yêu cầu rút tiền của giảng viên. Hệ thống này đảm bảo tính minh bạch và tuân thủ quy định tài chính.

## Tính năng chính

### 1. Tự động tạo hóa đơn
- Khi admin duyệt yêu cầu rút tiền, hệ thống tự động tạo hóa đơn PDF
- Hóa đơn chứa đầy đủ thông tin: giảng viên, số tiền, ngân hàng, ngày xuất
- Số hóa đơn được tạo tự động theo format: `INV-000001`

### 2. Quản lý hóa đơn cho Admin
- Xem danh sách tất cả hóa đơn đã tạo
- Tìm kiếm hóa đơn theo tên giảng viên, email, số hóa đơn
- Tải hóa đơn PDF
- Xem chi tiết hóa đơn
- Thống kê tổng quan: tổng hóa đơn, tổng tiền, hóa đơn tháng này

### 3. Quản lý hóa đơn cho Giảng viên
- Xem danh sách hóa đơn của mình
- Tải hóa đơn PDF
- Thống kê thu nhập và hóa đơn

## Cấu trúc Database

### Model Invoice
```javascript
{
  invoiceNumber: String,        // Số hóa đơn (INV-000001)
  withdrawRequestId: ObjectId,  // ID yêu cầu rút tiền
  teacherId: ObjectId,          // ID giảng viên
  amount: Number,               // Số tiền
  bank: String,                 // Ngân hàng
  account: String,              // Số tài khoản
  holder: String,               // Chủ tài khoản
  issuedAt: Date,               // Ngày xuất
  issuedBy: ObjectId,           // Admin tạo hóa đơn
  file: String,                 // Tên file PDF
  status: String                // Trạng thái (issued/cancelled)
}
```

## API Endpoints

### Admin APIs
- `GET /api/invoices` - Lấy tất cả hóa đơn
- `GET /api/invoices/:id` - Lấy hóa đơn theo ID
- `GET /api/invoices/download/:fileName` - Tải file PDF hóa đơn

### Giảng viên APIs
- `GET /api/invoices/my/invoices` - Lấy hóa đơn của giảng viên
- `GET /api/invoices/download/:fileName` - Tải file PDF hóa đơn

## Quy trình hoạt động

### 1. Giảng viên yêu cầu rút tiền
1. Giảng viên vào trang "Thu nhập & giao dịch"
2. Nhấn "Rút tiền" và điền thông tin
3. Hệ thống tạo yêu cầu rút tiền với trạng thái "pending"

### 2. Admin duyệt yêu cầu
1. Admin vào trang "Thu nhập giảng viên"
2. Xem danh sách yêu cầu rút tiền
3. Nhấn "Duyệt" cho yêu cầu hợp lệ
4. Hệ thống tự động:
   - Cập nhật trạng thái yêu cầu thành "approved"
   - Tạo hóa đơn PDF
   - Gửi notification cho giảng viên
   - Hiển thị nút "Tải HĐ" trong bảng

### 3. Giảng viên xem hóa đơn
1. Giảng viên nhận notification về hóa đơn đã tạo
2. Vào trang "Hóa đơn rút tiền" để xem danh sách
3. Tải hóa đơn PDF khi cần

## Cấu trúc file PDF

Hóa đơn PDF bao gồm:
- Header: Tiêu đề "HÓA ĐƠN RÚT TIỀN"
- Số hóa đơn và ngày xuất
- Thông tin giảng viên (tên, email)
- Thông tin rút tiền (số tiền, ngân hàng, tài khoản)
- Thông tin yêu cầu (mã yêu cầu, ngày yêu cầu, ngày duyệt)
- Chữ ký admin và giảng viên
- Footer: Thông tin hệ thống

## Cài đặt và triển khai

### 1. Backend
```bash
# Đảm bảo có thư mục invoices
mkdir -p backend/invoices

# Cài đặt dependencies (pdfkit đã có sẵn)
npm install

# Khởi động server
npm run dev
```

### 2. Frontend
```bash
# Cài đặt dependencies
npm install

# Khởi động development server
npm run dev
```

### 3. Routes cần thêm
- `/admin/invoices` - Trang quản lý hóa đơn admin
- `/instructor/invoices` - Trang hóa đơn giảng viên

## Bảo mật

### 1. Quyền truy cập
- Chỉ admin mới có thể xem tất cả hóa đơn
- Giảng viên chỉ xem được hóa đơn của mình
- API có middleware kiểm tra quyền truy cập

### 2. File PDF
- File PDF được lưu trong thư mục riêng biệt
- Tên file có timestamp để tránh trùng lặp
- Kiểm tra quyền truy cập trước khi tải file

## Monitoring và Logs

### 1. Logs quan trọng
- Tạo hóa đơn thành công/thất bại
- Tải hóa đơn
- Lỗi tạo PDF

### 2. Metrics cần theo dõi
- Số lượng hóa đơn tạo mỗi ngày/tháng
- Tổng tiền rút qua hóa đơn
- Tỷ lệ lỗi tạo hóa đơn

## Troubleshooting

### 1. Lỗi tạo PDF
- Kiểm tra quyền ghi file trong thư mục invoices
- Kiểm tra font chữ có sẵn
- Xem logs để debug

### 2. Lỗi tải hóa đơn
- Kiểm tra file có tồn tại không
- Kiểm tra quyền truy cập file
- Kiểm tra đường dẫn file

### 3. Lỗi hiển thị hóa đơn
- Kiểm tra API response
- Kiểm tra quyền truy cập
- Kiểm tra dữ liệu trong database

## Cập nhật và bảo trì

### 1. Backup
- Backup thư mục invoices định kỳ
- Backup collection Invoice trong MongoDB

### 2. Cleanup
- Xóa file PDF cũ không cần thiết
- Archive hóa đơn cũ

### 3. Monitoring
- Theo dõi dung lượng thư mục invoices
- Kiểm tra performance khi tạo PDF
- Monitor API response time

## Tương lai

### 1. Tính năng có thể thêm
- Email hóa đơn tự động
- Template hóa đơn tùy chỉnh
- Export Excel danh sách hóa đơn
- Tích hợp với hệ thống kế toán

### 2. Cải tiến
- Cache PDF để tăng performance
- Compress PDF để giảm dung lượng
- Watermark cho bảo mật
- Digital signature cho hóa đơn 