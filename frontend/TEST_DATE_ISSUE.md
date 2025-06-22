# Quick Test Guide - Date Issue

## 🚀 Cách test nhanh

### Bước 1: Mở trang test
1. Mở trang `/instructor-registration`
2. Mở Developer Tools (F12)
3. Chọn tab Console

### Bước 2: Test DatePicker
1. Chọn một ngày trong DatePicker
2. Kiểm tra console logs:
   ```
   DatePicker onChange - date: [Dayjs object]
   DatePicker onChange - isDayjs: true
   ```

### Bước 3: Test form validation
1. Điền form và click "Tiếp theo"
2. Kiểm tra console logs:
   ```
   DatePicker validator - value: [Dayjs object]
   DatePicker validator - isDayjs: true
   ```

### Bước 4: Test form submission
1. Điền đầy đủ form và submit
2. Kiểm tra console logs:
   ```
   Form values: {dateOfBirth: [Dayjs object], ...}
   dateOfBirth value: [Dayjs object]
   dateOfBirth from form: [Dayjs object]
   Formatted date: 1990-01-01
   ```

## 🔍 Nếu vẫn có lỗi

### Kiểm tra package.json
```bash
npm list dayjs
npm list antd
```

### Kiểm tra import
```typescript
import dayjs from 'dayjs';
console.log('dayjs version:', dayjs.version);
```

### Test dayjs trực tiếp
```typescript
const testDate = dayjs('1990-01-01');
console.log('Test:', testDate.format('YYYY-MM-DD'));
```

## 📞 Báo cáo lỗi

Copy toàn bộ console logs và gửi cho tôi để debug tiếp. 