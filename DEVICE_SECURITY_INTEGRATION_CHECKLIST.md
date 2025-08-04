# ✅ Device Security Integration Checklist

## 🔧 Backend Integration

### **1. Routes Registration**
- [ ] Kiểm tra `backend/src/app.js` có dòng:
  ```javascript
  app.use('/api/device-security', deviceSecurityRoutes);
  ```

### **2. Cron Job Startup**
- [ ] Kiểm tra `backend/server.js` có đoạn:
  ```javascript
  const deviceSecurityCleanup = require('./src/jobs/deviceSecurityCleanup');
  deviceSecurityCleanup.start();
  ```

### **3. Database Models**
- [ ] File `backend/src/models/UserDevice.js` tồn tại
- [ ] File `backend/src/models/DeviceViolation.js` tồn tại
- [ ] Models được import trong associations nếu có

### **4. Test API Endpoints**
```bash
# Chạy script test
node test-device-security.js
```
- [ ] POST `/api/device-security/register` hoạt động
- [ ] GET `/api/device-security/check-status/:courseId` hoạt động
- [ ] GET `/api/device-security/my-devices` hoạt động
- [ ] GET `/api/device-security/violations` hoạt động (admin)

---

## 🎨 Frontend Integration

### **1. Course Pages Wrapper**
- [ ] Kiểm tra `LessonVideoPage.tsx` có:
  ```jsx
  <CourseAccessWrapper 
    courseId={courseId} 
    courseName={courseName}
    requireDeviceCheck={true}
  >
    {/* content */}
  </CourseAccessWrapper>
  ```

### **2. Components Import**
- [ ] `CourseAccessWrapper` import đúng path
- [ ] `useDeviceSecurity` hook hoạt động
- [ ] `deviceSecurityService` import đúng axios config

### **3. Admin Menu Integration**
Thêm vào admin layout/menu:
```jsx
{
  key: 'device-violations',
  label: 'Vi phạm Bảo mật',
  icon: <SecurityScanOutlined />,
  path: '/admin/device-violations'
}
```

### **4. User Settings Integration**
Thêm vào user settings menu:
```jsx
{
  key: 'device-security',
  label: 'Bảo mật Thiết bị', 
  icon: <LaptopOutlined />,
  path: '/settings/device-security'
}
```

### **5. Routes Configuration**
Thêm vào `App.tsx` hoặc router config:
```jsx
<Route path="/admin/device-violations" component={AdminDeviceViolationsPage} />
<Route path="/settings/device-security" component={DeviceSecuritySettings} />
```

---

## 🧪 Manual Testing Steps

### **Quick Test (5 phút):**

1. **Start servers:**
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2  
   cd frontend && npm run dev
   ```

2. **Test basic flow:**
   - Login với user account
   - Truy cập một lesson page
   - Quan sát modal "Đăng ký thiết bị" xuất hiện
   - Click "Đăng ký thiết bị"
   - Kiểm tra console logs

3. **Test violation:**
   - Logout và login với user khác
   - Truy cập cùng lesson
   - Quan sát alert "Vi phạm bảo mật thiết bị"

### **Full Test (30 phút):**
Làm theo `DEVICE_SECURITY_TEST_PLAN.md`

---

## 🔍 Debugging Common Issues

### **Issue: Modal không xuất hiện**
**Check:**
- [ ] CourseAccessWrapper có được import?
- [ ] courseId có được truyền đúng?
- [ ] Console có error gì không?

**Fix:**
```jsx
// Đảm bảo CourseAccessWrapper bao bọc đúng
<CourseAccessWrapper courseId={parseInt(courseId)} courseName="Test Course">
  {/* content */}
</CourseAccessWrapper>
```

### **Issue: API 404 Not Found**
**Check:**
- [ ] Backend server có chạy?
- [ ] Routes có được đăng ký trong app.js?
- [ ] URL endpoint đúng format?

**Fix:**
```javascript
// Kiểm tra app.js
const deviceSecurityRoutes = require('./routes/deviceSecurity.routes');
app.use('/api/device-security', deviceSecurityRoutes);
```

### **Issue: Device fingerprint không ổn định**
**Check:**
- [ ] Browser headers có đầy đủ?
- [ ] Hash function hoạt động đúng?

**Fix:**
```javascript
// Kiểm tra deviceSecurityService.js
generateDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  console.log('Fingerprint data:', { userAgent, acceptLanguage, acceptEncoding });
  
  return crypto.createHash('sha256')
    .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest('hex');
}
```

### **Issue: Vi phạm không được phát hiện**
**Check:**
- [ ] Database có data user_devices?
- [ ] Logic checkForViolations đúng?
- [ ] Query MongoDB hoạt động?

**Fix:**
```javascript
// Test MongoDB query
db.userdevices.find({ device_id: "your_device_id" }).pretty()
```

---

## 📊 Success Criteria

### **Backend:**
- [ ] ✅ All API endpoints return 200/201
- [ ] ✅ Database records created correctly
- [ ] ✅ Cron job starts without errors
- [ ] ✅ Console logs show proper flow

### **Frontend:**
- [ ] ✅ Modal appears on first course access
- [ ] ✅ Registration completes successfully
- [ ] ✅ Violation alert shows for multiple accounts
- [ ] ✅ Admin page loads violation data
- [ ] ✅ User settings show registered devices

### **Integration:**
- [ ] ✅ No console errors
- [ ] ✅ API calls successful
- [ ] ✅ UI responsive and user-friendly
- [ ] ✅ Error handling works properly

---

## 🚀 Deployment Checklist

### **Before Production:**
- [ ] All tests pass
- [ ] Performance acceptable (<500ms API response)
- [ ] Error logging configured
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] Security review completed

### **After Production:**
- [ ] Monitor violation detection rate
- [ ] Check admin dashboard usage
- [ ] Verify cleanup job runs correctly
- [ ] Monitor user complaints/feedback
- [ ] Track false positive rate

---

**🎯 Goal:** Achieve 100% test pass rate before production deployment!
