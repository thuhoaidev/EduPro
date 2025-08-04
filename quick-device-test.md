# 🚀 Quick Test - Device Security System

## ⚡ Test nhanh (5 phút)

### **Bước 1: Khởi động hệ thống**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Bước 2: Test cơ bản**

#### **2.1 Đăng ký thiết bị lần đầu:**
1. **Mở browser** → `http://localhost:5173`
2. **Login** với tài khoản user bất kỳ
3. **Truy cập** một lesson page (ví dụ: `/course/123/lesson/456`)
4. **Kết quả mong đợi:**
   - ✅ Modal "Đăng ký thiết bị" xuất hiện
   - ✅ Có thông tin khóa học
   - ✅ Có cảnh báo về quy tắc sử dụng

#### **2.2 Đăng ký thiết bị:**
1. **Click** "Đăng ký thiết bị" trong modal
2. **Kết quả mong đợi:**
   - ✅ Modal đóng lại
   - ✅ Message "Đăng ký thiết bị thành công!"
   - ✅ Có thể truy cập nội dung lesson

#### **2.3 Test vi phạm:**
1. **Logout** khỏi tài khoản hiện tại
2. **Login** với tài khoản khác (cùng browser)
3. **Truy cập** cùng lesson đã test
4. **Kết quả mong đợi:**
   - ❌ Alert "Vi phạm bảo mật thiết bị" xuất hiện
   - ❌ Không thể truy cập nội dung
   - ❌ Message chứa "Device sharing detected"

### **Bước 3: Kiểm tra Console Logs**

#### **Frontend Console:**
```
🔒 CourseAccessWrapper: { courseId: 123, courseName: "...", requireDeviceCheck: true }
🔍 Checking device status for course: 123
✅ Device status response: { data: { isRegistered: false } }
🔒 Device Security State: { showRegistrationModal: true, isLoading: false }
```

#### **Backend Console:**
```
🔒 Device registered: { userId: "...", courseId: "123", deviceId: "abc123..." }
🚨 Device violation detected: 2 accounts on device abc123...
```

### **Bước 4: Kiểm tra Database**

#### **MongoDB Collections:**
```javascript
// Kiểm tra thiết bị đã đăng ký
db.userdevices.find({}).pretty()

// Kiểm tra vi phạm được tạo
db.deviceviolations.find({}).pretty()
```

**Kết quả mong đợi:**
- `userdevices`: Có 1 record với user đầu tiên
- `deviceviolations`: Có 1 record với 2 user_ids

---

## 🔍 Debug nếu không hoạt động

### **Vấn đề 1: Modal không xuất hiện**
**Kiểm tra:**
- [ ] CourseAccessWrapper có bao bọc lesson page?
- [ ] courseId có được truyền đúng?
- [ ] Console có lỗi API?

**Sửa:**
```jsx
// Đảm bảo LessonVideoPage.tsx có:
<CourseAccessWrapper 
  courseId={parseInt(courseId)} 
  courseName={courseOverview.title}
  requireDeviceCheck={true}
>
  {/* content */}
</CourseAccessWrapper>
```

### **Vấn đề 2: API 404 Error**
**Kiểm tra:**
- [ ] Backend server có chạy?
- [ ] Routes có được đăng ký?

**Sửa:**
```javascript
// Kiểm tra backend/src/app.js có:
app.use('/api/device-security', deviceSecurityRoutes);
```

### **Vấn đề 3: Vi phạm không được phát hiện**
**Kiểm tra:**
- [ ] Backend service có sử dụng đúng MongoDB syntax?
- [ ] Device fingerprint có ổn định?

**Sửa:**
```javascript
// Kiểm tra deviceSecurityService.js đã sửa từ Sequelize sang Mongoose
const existingUsers = await UserDevice.find({
  device_id: deviceId,
  course_id: courseId,
  user_id: { $ne: userId },
  is_active: true
});
```

---

## ✅ Success Criteria

### **Test Pass khi:**
- [x] Modal đăng ký xuất hiện cho user đầu tiên
- [x] Đăng ký thành công và có thể truy cập lesson
- [x] Alert vi phạm xuất hiện cho user thứ 2
- [x] Console logs hiển thị đúng flow
- [x] Database có records mới

### **Test Fail khi:**
- [ ] Modal không xuất hiện (tự động đăng ký)
- [ ] Không có alert vi phạm (user thứ 2 vẫn đăng ký được)
- [ ] API errors trong console
- [ ] Database không có records

---

## 🎯 Next Steps

**Nếu test pass:**
1. Test với trình duyệt khác (Chrome → Firefox)
2. Test admin dashboard
3. Test user settings page
4. Deploy to production

**Nếu test fail:**
1. Check integration checklist
2. Review backend service syntax
3. Verify API endpoints
4. Check console errors

---

**⏱️ Thời gian ước tính:** 5-10 phút
**🎯 Mục tiêu:** Xác nhận hệ thống ngăn chặn dùng chung tài khoản hoạt động đúng
