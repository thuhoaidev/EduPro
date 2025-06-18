# Hướng dẫn sử dụng chức năng Profile

## Tổng quan
Chức năng Profile cho phép người dùng xem và chỉnh sửa thông tin cá nhân của mình.

## Các tính năng chính

### 1. Xem thông tin cá nhân (`/profile`)
- Hiển thị thông tin cá nhân đầy đủ
- Avatar người dùng
- Thông tin cơ bản: họ tên, email, số điện thoại
- Thông tin chi tiết: giới tính, ngày sinh, địa chỉ
- Giới thiệu cá nhân (bio)
- Ngày tham gia hệ thống

### 2. Chỉnh sửa thông tin (`/profile/edit`)
- Cập nhật thông tin cá nhân
- Upload ảnh đại diện
- Chỉnh sửa các trường thông tin
- Lưu thay đổi vào database

### 3. Đổi mật khẩu (`/profile/change-password`)
- Thay đổi mật khẩu hiện tại
- Bảo mật tài khoản

## Cấu trúc file

```
frontend/src/pages/client/Profile/
├── Profile.tsx          # Trang hiển thị thông tin cá nhân
└── ProfileEdit.tsx      # Trang chỉnh sửa thông tin

frontend/src/pages/layout/
├── ProfileLayout.tsx    # Layout chung cho các trang profile
└── ProfileNav.tsx       # Navigation sidebar
```

## API Endpoints

### Backend
- `GET /users/me` - Lấy thông tin người dùng hiện tại
- `PUT /users/me` - Cập nhật thông tin người dùng (với upload avatar)

### Frontend
- `/profile` - Trang thông tin cá nhân
- `/profile/edit` - Trang chỉnh sửa thông tin
- `/profile/change-password` - Trang đổi mật khẩu

## Các trường thông tin

### Thông tin cơ bản
- `fullname`: Họ và tên (bắt buộc)
- `email`: Email (không thể chỉnh sửa)
- `phone`: Số điện thoại
- `nickname`: Biệt danh

### Thông tin chi tiết
- `gender`: Giới tính (Nam/Nữ/Khác)
- `dob`: Ngày sinh
- `address`: Địa chỉ
- `bio`: Giới thiệu cá nhân
- `avatar`: Ảnh đại diện

## Tính năng đặc biệt

### Upload Avatar
- Hỗ trợ upload ảnh đại diện
- Tự động resize và tối ưu hóa ảnh
- Lưu trữ trên Cloudinary
- Hiển thị preview ngay lập tức

### Validation
- Kiểm tra định dạng email
- Validate số điện thoại
- Kiểm tra kích thước file upload
- Hiển thị thông báo lỗi rõ ràng

### Responsive Design
- Giao diện responsive cho mobile và desktop
- Navigation sidebar tự động ẩn/hiện
- Layout tối ưu cho các kích thước màn hình

## Sử dụng

### Để xem thông tin cá nhân:
1. Đăng nhập vào hệ thống
2. Truy cập `/profile`
3. Xem thông tin cá nhân đầy đủ

### Để chỉnh sửa thông tin:
1. Từ trang profile, click "Chỉnh sửa hồ sơ"
2. Hoặc truy cập trực tiếp `/profile/edit`
3. Chỉnh sửa các trường thông tin
4. Upload ảnh đại diện (tùy chọn)
5. Click "Lưu thay đổi"

### Để đổi mật khẩu:
1. Truy cập `/profile/change-password`
2. Nhập mật khẩu hiện tại
3. Nhập mật khẩu mới
4. Xác nhận mật khẩu mới
5. Click "Đổi mật khẩu"

## Bảo mật

- Tất cả các trang profile yêu cầu đăng nhập
- Token được kiểm tra trước khi cho phép truy cập
- Mật khẩu được mã hóa khi lưu trữ
- Validation chặt chẽ cho tất cả input

## Lưu ý

- Email không thể thay đổi sau khi đăng ký
- Avatar được tự động tối ưu hóa kích thước
- Thông tin được cache trong localStorage để tăng tốc độ
- Có thể refresh trang mà không mất dữ liệu đã nhập 