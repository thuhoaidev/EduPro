# Cập nhật Blog với Ảnh Bìa Bắt Buộc

## 🎯 Tổng quan

Đã cập nhật hệ thống blog để yêu cầu ảnh bìa bắt buộc khi viết blog mới. Ảnh bìa sẽ được hiển thị ở trang danh sách blog và trang chi tiết blog.

## 🔧 Thay đổi Backend

### 1. Model Blog (`src/models/Blog.js`)
- ✅ Thêm trường `coverImage` bắt buộc
- ✅ Giữ nguyên trường `image` (cho ảnh trong nội dung)

```javascript
coverImage: {
  type: String,
  required: true,
  trim: true
}
```

### 2. Controller Blog (`src/controllers/blog.controller.js`)
- ✅ Cập nhật `createBlog` để xử lý upload ảnh bìa
- ✅ Cập nhật `updateBlog` để xử lý cập nhật ảnh bìa
- ✅ Validation: Ảnh bìa là bắt buộc

### 3. Routes Blog (`src/routes/blog.routes.js`)
- ✅ Cập nhật để xử lý upload nhiều file
- ✅ Hỗ trợ cả `image` và `coverImage`

## 🎨 Thay đổi Frontend

### 1. BlogWritePage (`src/pages/client/blog/BlogWritePage.tsx`)
- ✅ Thêm UI upload ảnh bìa bắt buộc
- ✅ Preview ảnh bìa trước khi đăng
- ✅ Validation: Yêu cầu ảnh bìa trước khi publish
- ✅ Hỗ trợ xóa ảnh bìa

### 2. BlogPage (`src/pages/client/BlogPage.tsx`)
- ✅ Hiển thị ảnh bìa từ trường `coverImage`
- ✅ Fallback về `image` nếu không có `coverImage`
- ✅ Fallback về ảnh trong nội dung nếu không có ảnh bìa

### 3. MyBlogPosts (`src/pages/client/blog/MyBlogPosts.tsx`)
- ✅ Hiển thị ảnh bìa trong danh sách bài viết của tôi
- ✅ Xóa phần thống kê và 3 dòng chữ nhỏ ở cuối danh mục
- ✅ Cập nhật interface để hỗ trợ `coverImage`

## 🚀 Cách sử dụng

### Viết blog mới:
1. Vào trang `/blog/write`
2. **Bắt buộc**: Thêm ảnh bìa trước khi đăng bài
3. Viết nội dung và thêm ảnh trong bài (tùy chọn)
4. Chọn danh mục
5. Đăng bài

### Hiển thị blog:
- Trang danh sách blog: Hiển thị ảnh bìa
- Trang chi tiết blog: Hiển thị ảnh bìa lớn ở đầu bài
- Trang "Blog của tôi": Hiển thị ảnh bìa, không có thống kê

## 🔍 Test

Chạy script test để kiểm tra model:
```bash
cd backend
node test-blog-cover.js
```

## 📝 Lưu ý

1. **Ảnh bìa bắt buộc**: Không thể đăng bài mà không có ảnh bìa
2. **Kích thước ảnh**: Tối đa 5MB
3. **Định dạng**: JPG, PNG, GIF
4. **Fallback**: Nếu không có ảnh bìa, sẽ dùng ảnh trong nội dung hoặc ảnh mặc định
5. **Backward compatibility**: Vẫn hỗ trợ trường `image` cũ

## 🎨 UI/UX Improvements

- ✅ Giao diện upload ảnh bìa đẹp mắt
- ✅ Preview ảnh bìa trước khi đăng
- ✅ Thông báo lỗi rõ ràng khi thiếu ảnh bìa
- ✅ Xóa phần thống kê không cần thiết
- ✅ Cải thiện hiển thị ảnh bìa trong danh sách blog

