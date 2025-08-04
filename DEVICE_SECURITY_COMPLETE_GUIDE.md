# 🔒 Hệ thống Bảo mật Thiết bị - Ngăn chặn Dùng chung Tài khoản

## 📋 Tổng quan

Hệ thống bảo mật thiết bị được thiết kế để **ngăn chặn việc dùng chung tài khoản** bằng cách:
- Theo dõi thiết bị người dùng truy cập khóa học
- Phát hiện nhiều tài khoản sử dụng cùng một thiết bị
- Báo cáo vi phạm cho admin thay vì tự động khóa
- Cho phép admin xem xét và quyết định khóa tài khoản

## 🎯 Nguyên tắc hoạt động

### **Quy tắc chính:**
1. **Mỗi tài khoản chỉ được sử dụng trên 1 thiết bị cho mỗi khóa học**
2. **Phát hiện vi phạm khi cùng 1 thiết bị có nhiều tài khoản**
3. **Không tự động khóa - chỉ báo cáo cho admin**
4. **Admin xem xét và quyết định khóa tài khoản thủ công**

## 🏗️ Kiến trúc Hệ thống

### **Database Schema:**
```sql
-- Bảng lưu thiết bị đã đăng ký
user_devices (
  user_id: ObjectId,           -- ID người dùng
  course_id: ObjectId,         -- ID khóa học
  device_id: String,           -- Fingerprint thiết bị (unique)
  device_info: Mixed,          -- Thông tin trình duyệt
  ip_address: String,          -- IP address
  user_agent: String,          -- User agent
  registered_at: Date,         -- Thời gian đăng ký
  last_activity: Date,         -- Hoạt động cuối
  is_active: Boolean           -- Trạng thái hoạt động
)

-- Bảng lưu vi phạm bảo mật
device_violations (
  device_id: String,           -- Device bị vi phạm
  violation_type: String,      -- Loại vi phạm
  user_ids: [ObjectId],        -- Danh sách user vi phạm
  course_ids: [ObjectId],      -- Danh sách khóa học
  device_info: Mixed,          -- Thông tin thiết bị
  ip_address: String,          -- IP address
  severity: String,            -- Mức độ (low/medium/high/critical)
  status: String,              -- Trạng thái (pending/resolved/dismissed)
  admin_notes: String,         -- Ghi chú admin
  reviewed_by: ObjectId,       -- Admin xử lý
  reviewed_at: Date            -- Thời gian xử lý
)
```

### **Composite Unique Index:**
```javascript
// Đảm bảo mỗi user chỉ có 1 device cho mỗi course
userDeviceSchema.index({ user_id: 1, course_id: 1, device_id: 1 }, { unique: true });
```

## 🔄 Quy trình Hoạt động

### **1. User truy cập khóa học:**
```
User → Course Page → CourseAccessWrapper → Device Check
```

### **2. Kiểm tra thiết bị:**
```javascript
// Tạo device fingerprint từ browser info
const deviceId = crypto.createHash('sha256')
  .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
  .digest('hex');

// Kiểm tra device đã đăng ký chưa
const existingDevice = await UserDevice.findOne({
  user_id: userId,
  course_id: courseId,
  device_id: deviceId
});
```

### **3. Xử lý kết quả:**

**✅ Device đã đăng ký:**
- Cập nhật `last_activity`
- Cho phép truy cập khóa học

**❌ Device chưa đăng ký:**
- Kiểm tra vi phạm trước khi đăng ký
- Nếu có vi phạm → Tạo báo cáo + Từ chối truy cập
- Nếu không vi phạm → Đăng ký device + Cho phép truy cập

### **4. Phát hiện vi phạm:**
```javascript
// Tìm user khác đang dùng cùng device cho cùng course
const existingUsers = await UserDevice.findAll({
  where: {
    device_id: deviceId,
    course_id: courseId,
    user_id: { [Op.ne]: userId },
    is_active: true
  }
});

if (existingUsers.length > 0) {
  // Tạo báo cáo vi phạm
  await DeviceViolation.create({
    device_id: deviceId,
    violation_type: 'multiple_accounts',
    user_ids: [userId, ...existingUsers.map(d => d.user_id)],
    course_ids: [courseId],
    severity: userIds.length > 3 ? 'high' : 'medium'
  });
  
  throw new Error('Device sharing detected');
}
```

## 🛠️ Components Đã triển khai

### **Backend Components:**

#### **1. Models:**
- `UserDevice.js` - Model lưu thiết bị đã đăng ký
- `DeviceViolation.js` - Model lưu vi phạm bảo mật

#### **2. Services:**
- `deviceSecurityService.js` - Logic xử lý bảo mật thiết bị
  - `generateDeviceFingerprint()` - Tạo device fingerprint
  - `registerDevice()` - Đăng ký thiết bị
  - `checkForViolations()` - Kiểm tra vi phạm
  - `getUserDevices()` - Lấy danh sách thiết bị user
  - `getViolations()` - Lấy danh sách vi phạm (Admin)
  - `handleViolation()` - Xử lý vi phạm (Admin)

#### **3. Controllers:**
- `deviceSecurityController.js` - API endpoints
  - `POST /register` - Đăng ký thiết bị
  - `GET /my-devices` - Danh sách thiết bị user
  - `GET /check-status/:courseId` - Kiểm tra trạng thái
  - `GET /violations` - Danh sách vi phạm (Admin)
  - `POST /violations/:id/handle` - Xử lý vi phạm (Admin)
  - `GET /stats` - Thống kê vi phạm (Admin)

#### **4. Routes:**
- `deviceSecurity.routes.js` - Định nghĩa API routes

#### **5. Middleware:**
- `deviceSecurity.js` - Middleware kiểm tra bảo mật

#### **6. Cron Jobs:**
- `deviceSecurityCleanup.js` - Dọn dẹp thiết bị không hoạt động (6h/lần)

### **Frontend Components:**

#### **1. Core Components:**
- `CourseAccessWrapper.tsx` - Component bao bọc course pages
- `DeviceRegistrationModal.tsx` - Modal đăng ký thiết bị
- `DeviceViolationAlert.tsx` - Alert cảnh báo vi phạm
- `LoginConflictModal.tsx` - Modal cảnh báo vi phạm đăng nhập

#### **2. Pages:**
- `AdminDeviceViolationsPage.tsx` - Trang quản lý vi phạm (Admin)
- `DeviceSecuritySettings.tsx` - Trang cài đặt thiết bị (User)

#### **3. Services:**
- `deviceSecurityService.ts` - Service gọi API

#### **4. Hooks:**
- `useDeviceSecurity.ts` - Hook quản lý logic device security

## 📱 Giao diện Người dùng

### **1. Modal Đăng ký Thiết bị:**
```
┌─────────────────────────────────────┐
│ 🔒 Đăng ký thiết bị                 │
├─────────────────────────────────────┤
│ Để đảm bảo bảo mật và ngăn chặn     │
│ việc chia sẻ tài khoản, bạn cần     │
│ đăng ký thiết bị này để truy cập    │
│ khóa học "Tên khóa học".            │
│                                     │
│ ⚠️ Lưu ý quan trọng:                │
│ • Mỗi tài khoản chỉ được sử dụng    │
│   trên một thiết bị cho mỗi khóa học│
│ • Việc sử dụng nhiều tài khoản trên │
│   cùng một thiết bị sẽ bị phát hiện │
│                                     │
│         [Hủy]  [Đăng ký thiết bị]   │
└─────────────────────────────────────┘
```

### **2. Alert Vi phạm:**
```
┌─────────────────────────────────────┐
│ ⚠️ Vi phạm bảo mật thiết bị          │
├─────────────────────────────────────┤
│ Device sharing detected. This       │
│ device is already registered for    │
│ 2 other account(s) in this course.  │
│                                     │
│ ⚠️ Hành vi này đã được ghi nhận và   │
│ báo cáo cho quản trị viên. Tài khoản│
│ của bạn có thể bị khóa nếu tiếp tục │
│ vi phạm.                            │
└─────────────────────────────────────┘
```

### **3. Trang Admin - Quản lý Vi phạm:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Quản lý vi phạm bảo mật thiết bị                         │
├─────────────────────────────────────────────────────────────┤
│ Thống kê: [Tổng: 15] [Chờ: 8] [Đã xử lý: 5] [Bỏ qua: 2]   │
├─────────────────────────────────────────────────────────────┤
│ Bộ lọc: [Trạng thái ▼] [Mức độ ▼]                          │
├─────────────────────────────────────────────────────────────┤
│ ID │ Thiết bị     │ Loại vi phạm │ Số TK │ Mức độ │ [Xử lý] │
│ 1  │ abc123...    │ Nhiều TK     │ 3     │ HIGH   │ [Xử lý] │
│ 2  │ def456...    │ Nhiều TK     │ 2     │ MEDIUM │ [Xử lý] │
└─────────────────────────────────────────────────────────────┘
```

### **4. Trang User - Cài đặt Thiết bị:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Bảo mật thiết bị                                         │
├─────────────────────────────────────────────────────────────┤
│ ℹ️ Thông tin về bảo mật thiết bị                            │
│ Hệ thống theo dõi các thiết bị bạn sử dụng...              │
├─────────────────────────────────────────────────────────────┤
│ Thống kê: [Tổng: 3] [Hoạt động: 1] [Gần đây: 1] [Cũ: 1]   │
├─────────────────────────────────────────────────────────────┤
│ Thiết bị     │ Khóa học      │ IP         │ Trạng thái      │
│ Chrome-abc.. │ ReactJS       │ 192.168.1.1│ Đang hoạt động  │
│ Firefox-def..│ NodeJS        │ 192.168.1.2│ Hoạt động gần   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Cài đặt và Triển khai

### **1. Database Setup:**
Hệ thống sử dụng MongoDB với Mongoose, các bảng sẽ được tự động tạo khi chạy ứng dụng.

### **2. Backend Setup:**
```bash
# Đã được tích hợp sẵn trong backend
# Routes: /api/device-security/*
# Cron job tự động khởi động khi start server
```

### **3. Frontend Integration:**
```jsx
// Bao bọc course pages với CourseAccessWrapper
<CourseAccessWrapper 
  courseId={courseId} 
  courseName={courseName}
  requireDeviceCheck={true}
>
  {/* Course content */}
</CourseAccessWrapper>
```

### **4. Admin Menu:**
Thêm menu item trong admin dashboard:
```jsx
{
  key: 'device-violations',
  label: 'Vi phạm Bảo mật',
  icon: <SecurityScanOutlined />,
  path: '/admin/device-violations'
}
```

### **5. User Settings:**
Thêm tab trong user settings:
```jsx
{
  key: 'device-security',
  label: 'Bảo mật Thiết bị',
  icon: <LaptopOutlined />,
  path: '/settings/device-security'
}
```

## 📊 API Endpoints

### **User Endpoints:**
```
POST   /api/device-security/register
GET    /api/device-security/my-devices
GET    /api/device-security/check-status/:courseId
```

### **Admin Endpoints:**
```
GET    /api/device-security/violations
POST   /api/device-security/violations/:id/handle
GET    /api/device-security/stats
```

## 🔍 Monitoring và Logging

### **Console Logs:**
```javascript
// Device registration
console.log('🔒 Device registered:', { userId, courseId, deviceId });

// Violation detection
console.log('🚨 Device violation detected:', { 
  deviceId, 
  userCount: userIds.length 
});

// Admin action
console.log('👮 Admin handled violation:', { 
  violationId, 
  action, 
  adminId 
});
```

### **Cleanup Job:**
```javascript
// Chạy mỗi 6 giờ
// Xóa thiết bị không hoạt động > 30 ngày
console.log('🧹 Cleaned up', cleanedCount, 'inactive devices');
```

## 🚀 Tính năng Nâng cao

### **1. Device Fingerprinting:**
- Sử dụng User Agent, Accept-Language, Accept-Encoding
- Tạo SHA256 hash để nhận diện thiết bị
- Không dựa vào cookies hay localStorage

### **2. Intelligent Violation Detection:**
- Phát hiện nhiều tài khoản trên cùng thiết bị
- Phân loại mức độ nghiêm trọng (low/medium/high/critical)
- Theo dõi xu hướng vi phạm

### **3. Admin Dashboard:**
- Thống kê tổng quan vi phạm
- Bộ lọc theo trạng thái và mức độ
- Xử lý hàng loạt vi phạm
- Export báo cáo

### **4. User Experience:**
- Modal đăng ký thiết bị thân thiện
- Cảnh báo vi phạm rõ ràng
- Trang cài đặt thiết bị chi tiết
- Thống kê sử dụng thiết bị

## 🛡️ Bảo mật

### **1. Data Protection:**
- Device fingerprint được hash
- Không lưu thông tin nhạy cảm
- IP address được mã hóa

### **2. Privacy:**
- Chỉ thu thập thông tin cần thiết
- Tự động xóa dữ liệu cũ
- Tuân thủ quy định bảo mật

### **3. Performance:**
- Index tối ưu cho truy vấn nhanh
- Cleanup job tự động
- Cache kết quả kiểm tra

## 📈 Metrics và KPIs

### **Tracking Metrics:**
- Số lượng thiết bị đăng ký
- Tỷ lệ vi phạm phát hiện
- Thời gian phản hồi admin
- Hiệu quả ngăn chặn chia sẻ tài khoản

### **Success Indicators:**
- Giảm số lượng tài khoản chia sẻ
- Tăng revenue per user
- Cải thiện chất lượng học viên
- Tăng độ tin cậy hệ thống

## 🎯 Kết luận

Hệ thống bảo mật thiết bị đã được triển khai hoàn chỉnh với đầy đủ tính năng:

✅ **Ngăn chặn dùng chung tài khoản hiệu quả**
✅ **Giao diện thân thiện với người dùng**
✅ **Dashboard admin mạnh mẽ**
✅ **Tự động hóa cao**
✅ **Bảo mật và hiệu suất tối ưu**

Hệ thống sẵn sàng để triển khai production và có thể mở rộng theo nhu cầu trong tương lai.

---

**📞 Hỗ trợ:** Liên hệ team phát triển nếu cần hỗ trợ triển khai hoặc tùy chỉnh thêm tính năng.
