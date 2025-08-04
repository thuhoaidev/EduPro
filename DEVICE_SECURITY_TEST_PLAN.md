# 🧪 Test Plan - Hệ thống Bảo mật Thiết bị

## 📋 Chuẩn bị Test

### **1. Khởi động Hệ thống:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **2. Tạo Test Data:**
- **2 tài khoản user:** user1@test.com, user2@test.com
- **1 tài khoản admin:** admin@test.com
- **1 khóa học có ID:** (lấy từ database)

---

## 🎯 Test Scenarios

### **Scenario 1: Đăng ký thiết bị lần đầu (✅ Thành công)**

**Mục tiêu:** Test quy trình đăng ký thiết bị bình thường

**Các bước:**
1. **Login** với `user1@test.com`
2. **Truy cập** một khóa học bất kỳ (ví dụ: `/course/123/lesson/456`)
3. **Quan sát:** Modal "Đăng ký thiết bị" xuất hiện
4. **Click** "Đăng ký thiết bị"
5. **Kết quả mong đợi:**
   - ✅ Modal đóng lại
   - ✅ Hiển thị message "Đăng ký thiết bị thành công!"
   - ✅ Có thể truy cập nội dung khóa học

**Console logs để kiểm tra:**
```
🔒 Device registered: { userId: "...", courseId: "...", deviceId: "..." }
✅ Device security cleanup job started
```

---

### **Scenario 2: Truy cập lại với thiết bị đã đăng ký (✅ Thành công)**

**Mục tiêu:** Test thiết bị đã đăng ký không cần đăng ký lại

**Các bước:**
1. **Refresh** trang hoặc truy cập khóa học khác
2. **Kết quả mong đợi:**
   - ✅ Không hiển thị modal đăng ký
   - ✅ Truy cập trực tiếp vào nội dung
   - ✅ Console log: "Device already registered"

---

### **Scenario 3: Vi phạm - Nhiều tài khoản cùng thiết bị (❌ Từ chối)**

**Mục tiêu:** Test phát hiện vi phạm chia sẻ tài khoản

**Các bước:**
1. **Logout** khỏi `user1@test.com`
2. **Login** với `user2@test.com` (trên cùng trình duyệt)
3. **Truy cập** cùng khóa học đã test ở Scenario 1
4. **Kết quả mong đợi:**
   - ❌ Hiển thị Alert "Vi phạm bảo mật thiết bị"
   - ❌ Không thể truy cập nội dung khóa học
   - ❌ Message: "Device sharing detected. This device is already registered for 1 other account(s)"

**Console logs để kiểm tra:**
```
🚨 Device violation detected: 2 accounts on device abc123...
```

---

### **Scenario 4: Admin xem và xử lý vi phạm**

**Mục tiêu:** Test dashboard admin quản lý vi phạm

**Các bước:**
1. **Login** với tài khoản admin
2. **Truy cập** `/admin/device-violations` (cần thêm vào menu)
3. **Quan sát:**
   - ✅ Thấy 1 vi phạm từ Scenario 3
   - ✅ Thông tin: Device ID, 2 tài khoản, mức độ MEDIUM
   - ✅ Trạng thái: Chờ xử lý
4. **Click** "Xử lý" → Modal xuất hiện
5. **Chọn** "Khóa tài khoản vi phạm" → Nhập ghi chú → "Khóa tài khoản"
6. **Kết quả mong đợi:**
   - ✅ Vi phạm chuyển trạng thái "Đã xử lý"
   - ✅ Tài khoản user2 bị khóa (status = blocked)

---

### **Scenario 5: User xem thiết bị đã đăng ký**

**Mục tiêu:** Test trang settings của user

**Các bước:**
1. **Login** với `user1@test.com`
2. **Truy cập** `/settings/device-security` (cần thêm vào menu)
3. **Quan sát:**
   - ✅ Thấy 1 thiết bị đã đăng ký
   - ✅ Thông tin: Device ID, khóa học, IP, trạng thái "Đang hoạt động"
   - ✅ Thống kê: Tổng 1, Hoạt động 1

---

### **Scenario 6: Test với trình duyệt khác (✅ Thành công)**

**Mục tiêu:** Test thiết bị khác nhau được phép

**Các bước:**
1. **Mở trình duyệt khác** (Chrome → Firefox hoặc ngược lại)
2. **Login** với `user1@test.com`
3. **Truy cập** cùng khóa học
4. **Kết quả mong đợi:**
   - ✅ Hiển thị modal đăng ký thiết bị (device fingerprint khác)
   - ✅ Có thể đăng ký thành công
   - ✅ Cùng user có thể có nhiều device cho cùng course

---

### **Scenario 7: Test Cleanup Job**

**Mục tiêu:** Test tự động dọn dẹp thiết bị cũ

**Các bước:**
1. **Kiểm tra** console log khi khởi động server:
   ```
   ✅ Device security cleanup job started
   ```
2. **Đợi 6 giờ** hoặc **trigger manual** (nếu có endpoint)
3. **Kết quả mong đợi:**
   - ✅ Console log: "🧹 Cleaned up X inactive devices"

---

## 🔍 Debug và Troubleshooting

### **1. Kiểm tra Database:**
```javascript
// MongoDB queries để kiểm tra data
db.userdevices.find({}).pretty()
db.deviceviolations.find({}).pretty()
```

### **2. Kiểm tra API Endpoints:**
```bash
# Test với Postman hoặc curl
GET http://localhost:5000/api/device-security/my-devices
GET http://localhost:5000/api/device-security/check-status/123
POST http://localhost:5000/api/device-security/register
```

### **3. Console Logs quan trọng:**
```javascript
// Frontend
🔒 CourseAccessWrapper: { courseId, courseName, requireDeviceCheck }
🔍 Checking device status for course: 123
✅ Device registration result: { success: true }

// Backend  
🔒 Device registered: { userId, courseId, deviceId }
🚨 Device violation detected: 2 accounts on device abc123...
👮 Admin handled violation: { violationId, action: "block_users" }
```

---

## 📊 Test Results Template

### **Test Execution Checklist:**

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Đăng ký thiết bị lần đầu | ⬜ Pass / ❌ Fail | |
| 2. Truy cập với thiết bị đã đăng ký | ⬜ Pass / ❌ Fail | |
| 3. Vi phạm nhiều tài khoản | ⬜ Pass / ❌ Fail | |
| 4. Admin xử lý vi phạm | ⬜ Pass / ❌ Fail | |
| 5. User xem thiết bị | ⬜ Pass / ❌ Fail | |
| 6. Test trình duyệt khác | ⬜ Pass / ❌ Fail | |
| 7. Cleanup job | ⬜ Pass / ❌ Fail | |

### **Performance Metrics:**
- **Response time** API calls: < 500ms
- **Database queries** optimized với index
- **Memory usage** ổn định
- **Error handling** đầy đủ

---

## 🚀 Production Readiness Checklist

### **Trước khi deploy:**
- [ ] Tất cả test scenarios pass
- [ ] Database indexes được tạo
- [ ] Environment variables cấu hình
- [ ] Error logging đầy đủ
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] Documentation updated

### **Monitoring sau deploy:**
- [ ] Vi phạm được phát hiện và báo cáo
- [ ] Admin dashboard hoạt động
- [ ] Cleanup job chạy đúng schedule
- [ ] User experience mượt mà
- [ ] No false positives

---

## 🔧 Troubleshooting Common Issues

### **Issue 1: Modal không xuất hiện**
**Nguyên nhân:** CourseAccessWrapper chưa được tích hợp
**Giải pháp:** Kiểm tra LessonVideoPage.tsx có bao bọc bằng CourseAccessWrapper

### **Issue 2: API 404 Not Found**
**Nguyên nhân:** Routes chưa được đăng ký
**Giải pháp:** Kiểm tra app.js có dòng `app.use('/api/device-security', deviceSecurityRoutes)`

### **Issue 3: Vi phạm không được phát hiện**
**Nguyên nhân:** Device fingerprint không ổn định
**Giải pháp:** Kiểm tra generateDeviceFingerprint() function

### **Issue 4: Cron job không chạy**
**Nguyên nhân:** Job chưa được khởi động
**Giải pháp:** Kiểm tra server.js có khởi động deviceSecurityCleanup

---

**🎯 Mục tiêu:** Đảm bảo 100% test scenarios pass trước khi triển khai production!
