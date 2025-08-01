# Hướng Dẫn Cập Nhật Chứng Chỉ Edu Pro

## Tổng Quan

Hệ thống chứng chỉ đã được cập nhật để sử dụng phôi chứng chỉ mới "Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png" với đầy đủ thông tin như mẫu.

## Các Thay Đổi Chính

### 1. Model Certificate (backend/src/models/Certificate.js)

**Các trường mới được thêm:**
- `certificateNumber`: Số chứng chỉ (CERT-xxx)
- `issuingUnit`: Đơn vị cấp chứng chỉ (mặc định: "Edu Pro")
- `instructorSignature`: Chữ ký của giảng viên
- `instructorName`: Tên giảng viên
- `motivationalText`: Lời chúc động viên
- `templateUsed`: Template sử dụng

### 2. Controller Certificate (backend/src/controllers/certificate.controller.js)

**Các cập nhật chính:**
- Sử dụng phôi chứng chỉ mới: "Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png"
- Tạo chứng chỉ với đầy đủ thông tin như mẫu
- Thêm API endpoints mới:
  - `GET /certificates/:courseId/details` - Lấy thông tin chi tiết chứng chỉ
  - `GET /certificates/user/all` - Lấy danh sách tất cả chứng chỉ của user

### 3. Routes Certificate (backend/src/routes/certificate.routes.js)

**Các routes mới:**
```javascript
// Lấy thông tin chi tiết chứng chỉ
router.get('/:courseId/details', certificateController.getCertificateDetails);

// Lấy danh sách tất cả chứng chỉ của user
router.get('/user/all', certificateController.getUserCertificates);
```

## Cấu Trúc Chứng Chỉ Mới

### Thông Tin Hiển Thị Trên Chứng Chỉ:
1. **Tiêu đề chính**: "GIẤY CHỨNG NHẬN"
2. **Tên khóa học**: Tên khóa học đã hoàn thành
3. **Tên học viên**: Tên đầy đủ của học viên
4. **Lời chúc động viên**: Thông điệp khuyến khích
5. **Ngày cấp**: Ngày phát hành chứng chỉ
6. **Đơn vị cấp chứng nhận**: "Edu Pro"
7. **Chữ ký**: Tên giảng viên tạo khóa học
8. **Số chứng chỉ**: Mã số duy nhất (CERT-xxx)

### Màu sắc và Font:
- **Tiêu đề chính**: Màu cam (#FF6B35)
- **Tên học viên**: Màu đen (#222)
- **Thông tin khác**: Màu xám (#666)
- **Font**: Roboto Unicode

## API Endpoints

### 1. Tạo Chứng Chỉ
```http
POST /api/certificates/:courseId/issue
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "certificateNumber": "CERT-1234567890",
    "code": "A1B2C3D4",
    "issuingUnit": "Edu Pro",
    "instructorName": "Tên Giảng Viên",
    "templateUsed": "Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png",
    "file": "certificate_xxx.pdf",
    "fileUrl": "/certificates/certificate_xxx.pdf"
  }
}
```

### 2. Lấy Thông Tin Chi Tiết Chứng Chỉ
```http
GET /api/certificates/:courseId/details
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "certificateNumber": "CERT-1234567890",
    "code": "A1B2C3D4",
    "issuedAt": "2025-01-15T10:30:00.000Z",
    "file": "certificate_xxx.pdf",
    "fileUrl": "/certificates/certificate_xxx.pdf",
    "templateUsed": "Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png",
    "issuingUnit": "Edu Pro",
    "instructorName": "Tên Giảng Viên",
    "instructorSignature": "Tên Giảng Viên",
    "motivationalText": "Cảm ơn bạn vì tất cả sự chăm chỉ...",
    "student": {
      "name": "Tên Học Viên",
      "email": "email@example.com"
    },
    "course": {
      "title": "Tên Khóa Học",
      "instructor": "Tên Giảng Viên"
    }
  }
}
```

### 3. Lấy Danh Sách Chứng Chỉ Của User
```http
GET /api/certificates/user/all
Authorization: Bearer <token>
```

### 4. Tải File PDF Chứng Chỉ
```http
GET /api/certificates/download/:fileName
Authorization: Bearer <token>
```

## Scripts Hỗ Trợ

### 1. Test Chứng Chỉ Mới
```bash
node test-certificate-new.js
```

### 2. Cập Nhật Chứng Chỉ Cũ
```bash
node scripts/update_existing_certificates.js
```

## Yêu Cầu Hệ Thống

### Files Cần Thiết:
1. **Phôi chứng chỉ**: `backend/certificates/Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png`
2. **Font chữ**: `backend/certificates/Roboto-Regular.ttf`

### Dependencies:
- `pdfkit`: Tạo file PDF
- `crypto`: Tạo mã chứng chỉ
- `fs`: Xử lý file system

## Lưu Ý Quan Trọng

1. **Phôi chứng chỉ**: Đảm bảo file phôi có đúng tên và định dạng
2. **Font chữ**: Font Roboto Unicode để hỗ trợ tiếng Việt
3. **Quyền ghi file**: Đảm bảo thư mục certificates có quyền ghi
4. **Database**: Cập nhật schema Certificate với các trường mới

## Troubleshooting

### Lỗi Thường Gặp:

1. **Không tìm thấy phôi chứng chỉ**:
   - Kiểm tra file `Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png` trong thư mục certificates
   - Hệ thống sẽ fallback về phôi cũ nếu không tìm thấy

2. **Lỗi font chữ**:
   - Kiểm tra file `Roboto-Regular.ttf` trong thư mục certificates
   - Hệ thống sẽ sử dụng font mặc định nếu không tìm thấy

3. **Lỗi quyền ghi file**:
   - Kiểm tra quyền ghi thư mục certificates
   - Chạy script test để kiểm tra

4. **Lỗi database**:
   - Chạy script cập nhật chứng chỉ cũ
   - Kiểm tra kết nối MongoDB

## Kết Luận

Hệ thống chứng chỉ đã được cập nhật hoàn chỉnh với:
- Phôi chứng chỉ mới đẹp mắt
- Đầy đủ thông tin như mẫu
- API endpoints mới
- Hỗ trợ cập nhật chứng chỉ cũ
- Scripts test và migration

Tất cả chứng chỉ mới sẽ được tạo với format chuẩn và thông tin đầy đủ. 