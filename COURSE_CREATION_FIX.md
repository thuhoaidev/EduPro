# Sửa lỗi tạo khóa học - Dữ liệu vẫn vào DB nhưng BE báo lỗi

## Vấn đề
- Khi tạo khóa học, dữ liệu vẫn được lưu vào database nhưng backend trả về lỗi "Dữ liệu không hợp lệ"
- Lỗi xảy ra tại dòng 504 trong `course.controller.js`

## Nguyên nhân
1. **Cấu trúc try-catch lồng nhau phức tạp** gây ra việc dữ liệu được lưu nhưng vẫn throw error
2. **URL placeholder không hợp lệ** cho validation schema
3. **Validation schema quá nghiêm ngặt** với một số trường

## Giải pháp đã thực hiện

### 1. Sửa URL placeholder
```javascript
// Trước
thumbnailUrl = 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Khóa+học';

// Sau  
thumbnailUrl = 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/landscape-panorama';
```

### 2. Đơn giản hóa cấu trúc try-catch
- Loại bỏ try-catch lồng nhau không cần thiết
- Đảm bảo validation được thực hiện trước khi tạo course
- Xử lý lỗi một cách rõ ràng và nhất quán

### 3. Cải thiện validation schema
```javascript
// Làm cho requirements và thumbnail không bắt buộc
requirements: Joi.array().items(Joi.string().min(3)).min(1).optional().default([])
thumbnail: Joi.string().optional().uri()
```

### 4. Cải thiện xử lý requirements
```javascript
// Lọc requirements hợp lệ
requirements: Array.isArray(req.body.requirements)
  ? req.body.requirements.filter(req => req && req.trim().length >= 3)
  : typeof req.body.requirements === 'string' && req.body.requirements.trim()
  ? [req.body.requirements.trim()]
  : []
```

### 5. Xử lý lỗi chi tiết hơn
```javascript
// Xử lý các loại lỗi cụ thể
if (error.name === 'ValidationError') {
  return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.errors));
}

if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
  return next(new ApiError(400, 'Tên khóa học đã tồn tại. Vui lòng chọn tên khác.'));
}

if (error.isJoi) {
  return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.details));
}
```

## Kết quả
- ✅ Dữ liệu được validate đúng cách trước khi lưu
- ✅ Không còn tình trạng dữ liệu vào DB nhưng vẫn báo lỗi
- ✅ Error handling rõ ràng và nhất quán
- ✅ Validation schema linh hoạt hơn

## Test
Sử dụng file `test-course-creation.js` để test việc tạo khóa học:
```bash
node test-course-creation.js
```

## Lưu ý
- Đảm bảo thay `YOUR_TOKEN_HERE` bằng token thực khi test
- Kiểm tra category ID có tồn tại trong database
- Đảm bảo user có quyền instructor hoặc admin 