# Test Guide - Instructor Registration Form

## Lỗi đã sửa: dateOfBirth format error

### Nguyên nhân:
- `values.dateOfBirth` có thể là `undefined` hoặc không phải dayjs object
- Validation không đủ chặt chẽ

### Giải pháp đã áp dụng:

1. **Helper function an toàn:**
```typescript
const formatDateSafely = (dateValue: any): string => {
  if (!dateValue) {
    throw new Error('Vui lòng chọn ngày sinh!');
  }
  
  if (!dayjs.isDayjs(dateValue)) {
    throw new Error('Ngày sinh không hợp lệ!');
  }
  
  return dateValue.format('YYYY-MM-DD');
};
```

2. **Validation cải thiện:**
```typescript
rules={[
  { required: true, message: "Vui lòng chọn ngày sinh!" },
  {
    validator: (_, value) => {
      if (!value) {
        return Promise.reject(new Error('Vui lòng chọn ngày sinh!'));
      }
      if (!dayjs.isDayjs(value)) {
        return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
      }
      if (value.isAfter(dayjs())) {
        return Promise.reject(new Error('Ngày sinh không thể là ngày trong tương lai!'));
      }
      if (value.isBefore(dayjs().subtract(100, 'year'))) {
        return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
      }
      return Promise.resolve();
    }
  }
]}
```

3. **DatePicker với disabledDate:**
```typescript
disabledDate={(current) => {
  return current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'));
}}
```

## Test Cases

### Test Case 1: Điền form đầy đủ
1. Mở trang `/instructor-registration`
2. Điền đầy đủ thông tin bước 1
3. Chọn ngày sinh hợp lệ
4. Chuyển sang bước 2
5. Điền thông tin học vấn
6. Chuyển sang bước 3
7. Upload files và submit
8. **Expected:** Thành công, không có lỗi dateOfBirth

### Test Case 2: Test validation ngày sinh
1. Chọn ngày trong tương lai
2. **Expected:** Hiển thị lỗi "Ngày sinh không thể là ngày trong tương lai!"

### Test Case 3: Test bỏ trống ngày sinh
1. Bỏ trống field ngày sinh
2. Click "Tiếp theo"
3. **Expected:** Hiển thị lỗi "Vui lòng chọn ngày sinh!"

### Test Case 4: Test ngày sinh quá cũ
1. Chọn ngày sinh > 100 năm trước
2. **Expected:** Hiển thị lỗi "Ngày sinh không hợp lệ!"

## Debug Steps

### Nếu vẫn gặp lỗi:

1. **Kiểm tra console:**
```javascript
console.log('dateOfBirth value:', values.dateOfBirth);
console.log('dateOfBirth type:', typeof values.dateOfBirth);
console.log('isDayjs:', dayjs.isDayjs(values.dateOfBirth));
```

2. **Kiểm tra dayjs import:**
```typescript
import dayjs from 'dayjs';
console.log('dayjs imported:', dayjs);
```

3. **Test helper function:**
```javascript
try {
  const formatted = formatDateSafely(values.dateOfBirth);
  console.log('Formatted date:', formatted);
} catch (error) {
  console.error('Date formatting error:', error);
}
```

## Common Issues & Solutions

### Issue 1: dayjs not imported properly
**Solution:** Đảm bảo import đúng:
```typescript
import dayjs from 'dayjs';
```

### Issue 2: DatePicker returns null
**Solution:** Thêm validation trong onFinish:
```typescript
if (!values.dateOfBirth) {
  throw new Error('Vui lòng chọn ngày sinh!');
}
```

### Issue 3: dayjs.isDayjs not working
**Solution:** Kiểm tra dayjs version và import:
```typescript
console.log('dayjs version:', dayjs.version);
console.log('isDayjs function:', dayjs.isDayjs);
```

## Expected Behavior

✅ **Form hoạt động đúng khi:**
- Chọn ngày sinh hợp lệ (trong khoảng 100 năm trước đến hiện tại)
- Validation hiển thị đúng thông báo lỗi
- Date được format đúng format 'YYYY-MM-DD' khi submit
- Không có lỗi TypeError trong console

❌ **Form có vấn đề khi:**
- Console hiển thị "Cannot read properties of undefined (reading 'format')"
- DatePicker không hoạt động
- Validation không hiển thị lỗi đúng 