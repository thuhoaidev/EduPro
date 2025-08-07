# Hệ thống Bảo mật Thiết bị EduPro

## Tổng quan

Hệ thống bảo mật thiết bị được thiết kế để ngăn chặn việc chia sẻ tài khoản và đảm bảo mỗi tài khoản chỉ được sử dụng bởi một người trên một thiết bị cho mỗi khóa học.

## Cấu trúc Database

### Bảng `user_devices`
```sql
CREATE TABLE user_devices (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id, course_id, device_id)
);
```

### Bảng `device_violations`
```sql
CREATE TABLE device_violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(255) NOT NULL,
    violation_type ENUM('multiple_accounts', 'suspicious_activity', 'account_sharing'),
    user_ids JSON NOT NULL,
    course_ids JSON NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    severity ENUM('low', 'medium', 'high', 'critical'),
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    admin_notes TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Quy trình hoạt động

### 1. Đăng ký thiết bị
- User truy cập khóa học lần đầu
- Hệ thống tạo device fingerprint từ thông tin trình duyệt
- Kiểm tra xem thiết bị đã được đăng ký bởi user khác chưa
- Nếu có vi phạm → tạo báo cáo và từ chối truy cập
- Nếu không → đăng ký thiết bị thành công

### 2. Phát hiện vi phạm
- Khi phát hiện nhiều tài khoản sử dụng cùng thiết bị
- Tạo record trong bảng `device_violations`
- Ghi nhận thông tin: user_ids, course_ids, device_info, severity
- Báo cáo được gửi đến admin để xem xét

### 3. Xử lý vi phạm (Admin)
- Admin xem danh sách vi phạm
- Có thể chọn:
  - **Block Users**: Khóa tất cả tài khoản vi phạm
  - **Dismiss**: Bỏ qua vi phạm (false positive)
- Thêm ghi chú về quyết định
- Cập nhật trạng thái vi phạm

## API Endpoints

### User APIs
- `POST /api/device-security/register` - Đăng ký thiết bị
- `GET /api/device-security/my-devices` - Lấy danh sách thiết bị
- `GET /api/device-security/check-status/:courseId` - Kiểm tra trạng thái thiết bị

### Admin APIs
- `GET /api/device-security/violations` - Lấy danh sách vi phạm
- `POST /api/device-security/violations/:id/handle` - Xử lý vi phạm
- `GET /api/device-security/stats` - Thống kê vi phạm
- `POST /api/device-security/cleanup` - Dọn dẹp thiết bị không hoạt động

## Frontend Components

### User Components
- `DeviceRegistrationModal` - Modal đăng ký thiết bị
- `DeviceSecuritySettings` - Trang cài đặt bảo mật user
- `DeviceViolationAlert` - Thông báo vi phạm
- `LoginConflictModal` - Modal cảnh báo vi phạm

### Admin Components
- `AdminViolationsPage` - Trang quản lý vi phạm cho admin

## Middleware

### `deviceSecurity.js`
- `checkDeviceAccess` - Kiểm tra thiết bị khi truy cập course
- `checkUserBlocked` - Kiểm tra user có bị khóa không
- `logDeviceActivity` - Ghi log hoạt động thiết bị

## Cron Job

### `deviceSecurityCleanup.js`
- Chạy mỗi 6 giờ
- Vô hiệu hóa thiết bị không hoạt động > 30 ngày
- Dọn dẹp dữ liệu cũ

## Cách triển khai

### 1. Backend Setup
```bash
# Chạy migration tạo bảng
mysql -u username -p database_name < backend/src/scripts/createDeviceSecurityTables.sql

# Cập nhật app.js
const deviceSecurityRoutes = require('./routes/deviceSecurity.routes');
app.use('/api/device-security', deviceSecurityRoutes);

# Khởi động cron job
const deviceSecurityCleanup = require('./jobs/deviceSecurityCleanup');
deviceSecurityCleanup.start();
```

### 2. Frontend Setup
```typescript
// Thêm vào App.tsx routes
import AdminViolationsPage from './components/DeviceSecurity/AdminViolationsPage';
import DeviceSecuritySettings from './components/DeviceSecurity/DeviceSecuritySettings';

// Routes
<Route path="/admin/violations" element={<AdminViolationsPage />} />
<Route path="/settings/device-security" element={<DeviceSecuritySettings />} />
```

### 3. Tích hợp vào Course Pages
```typescript
import DeviceRegistrationModal from './components/DeviceSecurity/DeviceRegistrationModal';
import deviceSecurityService from './services/deviceSecurityService';

// Kiểm tra thiết bị khi vào course
useEffect(() => {
  const checkDevice = async () => {
    try {
      const status = await deviceSecurityService.checkDeviceStatus(courseId);
      if (!status.data.isRegistered) {
        setShowRegistrationModal(true);
      }
    } catch (error) {
      // Handle error
    }
  };
  
  checkDevice();
}, [courseId]);
```

## Cấu hình bảo mật

### Device Fingerprinting
- User Agent
- Accept Language
- Accept Encoding
- Screen Resolution (nếu có)
- Timezone

### Mức độ vi phạm
- **Low**: 2 tài khoản trên cùng thiết bị
- **Medium**: 3-4 tài khoản
- **High**: 5+ tài khoản
- **Critical**: Hoạt động đáng ngờ khác

### Thời gian cleanup
- Thiết bị không hoạt động > 30 ngày → vô hiệu hóa
- Cron job chạy mỗi 6 giờ
- Có thể chạy manual cleanup

## Monitoring & Logging

### Logs quan trọng
- Device registration attempts
- Violation detections
- Admin actions
- Cleanup activities

### Metrics cần theo dõi
- Số lượng vi phạm/ngày
- Tỷ lệ vi phạm được xử lý
- Số thiết bị active/inactive
- Thời gian phản hồi của admin

## Troubleshooting

### Vấn đề thường gặp
1. **False positive**: User hợp lệ bị báo vi phạm
   - Kiểm tra device fingerprint
   - Xem log chi tiết
   - Admin có thể dismiss violation

2. **Thiết bị không được nhận diện**
   - Kiểm tra headers request
   - Verify fingerprint algorithm
   - Test với nhiều browser

3. **Performance issues**
   - Index database tables
   - Optimize queries
   - Cache device status

### Debug Commands
```bash
# Kiểm tra vi phạm pending
SELECT * FROM device_violations WHERE status = 'pending';

# Kiểm tra thiết bị của user
SELECT * FROM user_devices WHERE user_id = ?;

# Thống kê vi phạm
SELECT status, COUNT(*) FROM device_violations GROUP BY status;
```

## Bảo mật & Privacy

### Dữ liệu thu thập
- Chỉ thu thập thông tin cần thiết cho fingerprinting
- Không lưu thông tin cá nhân nhạy cảm
- Tuân thủ GDPR/privacy laws

### Mã hóa
- Device ID được hash SHA-256
- Sensitive data encrypted at rest
- Secure transmission (HTTPS)

### Retention Policy
- Device records: 1 năm
- Violation records: 2 năm
- Logs: 6 tháng

---

*Hệ thống này đảm bảo tính bảo mật cao while maintaining user experience tốt. Regular monitoring và updates cần thiết để duy trì hiệu quả.*
