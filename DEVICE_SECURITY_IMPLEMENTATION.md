# HỆ THỐNG BẢO MẬT THIẾT BỊ EDUPRO - HƯỚNG DẪN CHI TIẾT

## 🎯 MỤC TIÊU
Ngăn chặn việc chia sẻ tài khoản bằng cách:
- Mỗi tài khoản chỉ được sử dụng trên 1 thiết bị cho mỗi khóa học
- Phát hiện và báo cáo vi phạm cho admin
- Admin xem xét và khóa tài khoản thủ công (không tự động)

## 📁 CẤU TRÚC FILE ĐÃ TẠO

### 🗄️ BACKEND FILES

#### 1. **Models (Mô hình dữ liệu)**

**`UserDevice.js`** - Mô hình lưu thông tin thiết bị của user
```javascript
// Lưu thông tin: user_id, course_id, device_id, thời gian đăng ký, hoạt động cuối
// Mỗi user có thể có nhiều thiết bị cho các khóa học khác nhau
// Primary key: (user_id, course_id, device_id) - đảm bảo unique
```

**`DeviceViolation.js`** - Mô hình lưu vi phạm bảo mật
```javascript
// Lưu thông tin vi phạm: thiết bị nào, user nào, mức độ nghiêm trọng
// Trạng thái: pending (chờ xử lý), resolved (đã khóa user), dismissed (bỏ qua)
// Admin có thể thêm ghi chú khi xử lý
```

#### 2. **Services (Dịch vụ xử lý logic)**

**`deviceSecurityService.js`** - Service chính xử lý logic bảo mật
```javascript
// generateDeviceFingerprint(): Tạo "dấu vân tay" thiết bị từ thông tin browser
// registerDevice(): Đăng ký thiết bị mới cho user và course
// checkForViolations(): Kiểm tra xem có vi phạm không (nhiều user cùng thiết bị)
// getViolations(): Lấy danh sách vi phạm cho admin
// handleViolation(): Admin xử lý vi phạm (khóa user hoặc bỏ qua)
```

#### 3. **Controllers (Điều khiển API)**

**`deviceSecurityController.js`** - Controller xử lý các API request
```javascript
// registerDevice(): API đăng ký thiết bị
// getUserDevices(): API lấy danh sách thiết bị của user
// getViolations(): API admin lấy danh sách vi phạm
// handleViolation(): API admin xử lý vi phạm
// getViolationStats(): API thống kê vi phạm
```

#### 4. **Routes (Định tuyến API)**

**`deviceSecurity.routes.js`** - Định nghĩa các endpoint API
```javascript
// User routes:
// POST /api/device-security/register - Đăng ký thiết bị
// GET /api/device-security/my-devices - Xem thiết bị của mình
// GET /api/device-security/check-status/:courseId - Kiểm tra trạng thái

// Admin routes:
// GET /api/device-security/violations - Xem vi phạm
// POST /api/device-security/violations/:id/handle - Xử lý vi phạm
// GET /api/device-security/stats - Thống kê
```

#### 5. **Middleware (Phần mềm trung gian)**

**`deviceSecurity.js`** - Middleware kiểm tra bảo mật
```javascript
// checkDeviceAccess(): Kiểm tra thiết bị khi truy cập course
// checkUserBlocked(): Kiểm tra user có bị khóa không
// logDeviceActivity(): Ghi log hoạt động thiết bị
```

#### 6. **Jobs (Công việc tự động)**

**`deviceSecurityCleanup.js`** - Cron job dọn dẹp tự động
```javascript
// Chạy mỗi 6 tiếng
// Vô hiệu hóa thiết bị không hoạt động > 30 ngày
// Giúp giữ database sạch sẽ
```

#### 7. **Database Scripts**

**`createDeviceSecurityTables.sql`** - Script tạo bảng database
```sql
-- Tạo bảng user_devices và device_violations
-- Thêm indexes để tăng tốc truy vấn
-- Thêm cột status vào bảng users
```

### 🎨 FRONTEND FILES

#### 1. **Services (Dịch vụ gọi API)**

**`deviceSecurityService.ts`** - Service gọi API backend
```typescript
// registerDevice(): Gọi API đăng ký thiết bị
// checkDeviceStatus(): Kiểm tra thiết bị đã đăng ký chưa
// getUserDevices(): Lấy danh sách thiết bị của user
// getViolations(): Admin lấy danh sách vi phạm
// handleViolation(): Admin xử lý vi phạm
```

#### 2. **Components (Thành phần giao diện)**

**`DeviceRegistrationModal.tsx`** - Modal đăng ký thiết bị
```typescript
// Hiển thị khi user chưa đăng ký thiết bị cho course
// Giải thích quy định bảo mật
// Nút đăng ký thiết bị
// Xử lý lỗi vi phạm
```

**`DeviceViolationAlert.tsx`** - Thông báo vi phạm
```typescript
// Hiển thị cảnh báo khi phát hiện vi phạm
// Thông báo hậu quả (có thể bị khóa tài khoản)
// Màu đỏ, icon cảnh báo
```

**`DeviceSecuritySettings.tsx`** - Trang cài đặt bảo mật user
```typescript
// Hiển thị danh sách thiết bị đã đăng ký
// Thống kê: tổng thiết bị, thiết bị hoạt động, khóa học
// Hướng dẫn sử dụng
// Lưu ý quan trọng
```

**`AdminViolationsPage.tsx`** - Trang quản lý vi phạm cho admin
```typescript
// Bảng danh sách vi phạm với filter
// Thống kê: tổng vi phạm, chờ xử lý, đã xử lý
// Modal xem chi tiết vi phạm
// Nút khóa user hoặc bỏ qua
// Thêm ghi chú admin
```

**`CourseAccessWrapper.tsx`** - Component bao bọc course
```typescript
// Tự động kiểm tra thiết bị khi vào course
// Hiển thị modal đăng ký nếu cần
// Hiển thị alert vi phạm nếu có
// Bao bọc nội dung course
```

#### 3. **Hooks (Custom React Hooks)**

**`useDeviceSecurity.ts`** - Hook quản lý logic bảo mật
```typescript
// checkDeviceStatus(): Kiểm tra trạng thái thiết bị
// registerDevice(): Đăng ký thiết bị
// Quản lý state: loading, error, modal visibility
// Auto-check khi courseId thay đổi
```

## 🔄 QUY TRÌNH HOẠT ĐỘNG

### 1. **User truy cập khóa học lần đầu:**
```
User click vào course
↓
CourseAccessWrapper kiểm tra thiết bị
↓
Nếu chưa đăng ký → Hiển thị DeviceRegistrationModal
↓
User click "Đăng ký thiết bị"
↓
Gọi API registerDevice()
↓
Backend tạo device fingerprint
↓
Kiểm tra vi phạm (có user khác dùng thiết bị này không?)
↓
Nếu có vi phạm → Tạo record DeviceViolation → Từ chối
↓
Nếu không → Tạo record UserDevice → Thành công
```

### 2. **Khi phát hiện vi phạm:**
```
Nhiều user cùng thiết bị
↓
Tạo record trong device_violations
↓
Status = 'pending'
↓
Admin vào trang AdminViolationsPage
↓
Xem danh sách vi phạm
↓
Click "Xem chi tiết" → Modal hiển thị thông tin
↓
Admin chọn:
- "Khóa tài khoản" → Update users.status = 'blocked'
- "Bỏ qua" → Update violation.status = 'dismissed'
↓
Thêm ghi chú → Lưu
```

### 3. **Cron job dọn dẹp:**
```
Mỗi 6 tiếng
↓
Tìm thiết bị không hoạt động > 30 ngày
↓
Update is_active = false
↓
Log số lượng đã dọn dẹp
```

## 🛠️ CÁCH SỬ DỤNG

### 1. **Setup Database:**
```bash
mysql -u username -p database_name < backend/src/scripts/createDeviceSecurityTables.sql
```

### 2. **Tích hợp vào Course Page:**
```typescript
import CourseAccessWrapper from './components/DeviceSecurity/CourseAccessWrapper';

// Bao bọc nội dung course
<CourseAccessWrapper courseId={courseId} courseName={courseName}>
  {/* Nội dung course của bạn */}
  <VideoPlayer />
  <LessonContent />
</CourseAccessWrapper>
```

### 3. **Thêm vào Admin Menu:**
```typescript
// Thêm link đến trang quản lý vi phạm
<Menu.Item key="violations">
  <Link to="/admin/violations">Quản lý vi phạm</Link>
</Menu.Item>
```

### 4. **Thêm vào User Settings:**
```typescript
// Thêm link đến trang cài đặt bảo mật
<Menu.Item key="device-security">
  <Link to="/settings/device-security">Bảo mật thiết bị</Link>
</Menu.Item>
```

## 🔧 CẤU HÌNH

### **Environment Variables:**
```env
# Không cần thêm biến môi trường mới
# Sử dụng database và JWT hiện có
```

### **Package Dependencies:**
```json
// Backend (đã có sẵn)
"node-cron": "^3.0.2"
"crypto": "built-in"

// Frontend (đã có sẵn)
"antd": "^5.0.0"
"moment": "^2.29.0"
```

## 📊 THỐNG KÊ & MONITORING

### **Metrics quan trọng:**
- Số vi phạm/ngày
- Tỷ lệ vi phạm được xử lý
- Số thiết bị active/inactive
- Thời gian phản hồi admin

### **Logs cần theo dõi:**
- Device registration attempts
- Violation detections
- Admin actions
- Cleanup activities

## 🚨 LƯU Ý QUAN TRỌNG

### **Bảo mật:**
- Device fingerprint được hash SHA-256
- Không lưu thông tin cá nhân nhạy cảm
- Tuân thủ GDPR/privacy laws

### **Performance:**
- Đã tạo indexes cho các truy vấn thường dùng
- Cron job chạy ngoài giờ cao điểm
- Cache device status nếu cần

### **User Experience:**
- Modal đăng ký thân thiện
- Giải thích rõ ràng quy định
- Không làm gián đoạn học tập

## ✅ CHECKLIST TRIỂN KHAI

- [x] Tạo database tables
- [x] Backend APIs hoàn chỉnh
- [x] Frontend components
- [x] Middleware bảo mật
- [x] Cron job cleanup
- [x] Documentation chi tiết
- [ ] Testing
- [ ] Deploy to production
- [ ] Monitor & optimize

---

**🎉 HỆ THỐNG ĐÃ HOÀN THÀNH!**

Bạn có thể bắt đầu sử dụng ngay bằng cách:
1. Chạy script tạo database
2. Restart server để load routes mới
3. Tích hợp CourseAccessWrapper vào course pages
4. Thêm admin menu cho quản lý vi phạm

Nếu có thắc mắc, hãy tham khảo file DEVICE_SECURITY_GUIDE.md để biết thêm chi tiết!
