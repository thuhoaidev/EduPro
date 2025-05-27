# EduPro - Nền tảng Giáo dục Trực tuyến

EduPro là một nền tảng học trực tuyến toàn diện, cung cấp các khóa học chất lượng cao với nhiều tính năng tương tác và học tập.

## Tính năng chính

- Quản lý khóa học và nội dung học tập
- Hệ thống học nhóm và tương tác
- Theo dõi tiến độ học tập
- Hệ thống điểm danh và streak
- Quản lý chứng chỉ và huy hiệu
- Hệ thống thanh toán và voucher
- Blog và cộng đồng học tập

## Cấu trúc dự án

```
edupro/
├── backend/     # Backend API (Node.js/Express)
├── frontend/    # Frontend (React)
└── shared/      # Shared code giữa frontend và backend
```

## Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

## Cài đặt

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Môi trường phát triển

1. Clone repository
2. Cài đặt dependencies cho cả frontend và backend
3. Cấu hình file môi trường (.env)
4. Chạy database migrations
5. Khởi động server development

## Đóng góp

Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết về quy trình đóng góp.

## Giấy phép

Dự án này được cấp phép theo [MIT License](LICENSE).





1. 🔐 Quản trị viên (Admin)
🎨 Giao diện chính:
Sidebar chứa các menu:
Trang tổng quan
Quản lý người dùng
Quản lý giảng viên
Duyệt nội dung khóa học & blog
Quản lý báo cáo
Quản lý hệ thống (voucher, thanh toán,...)
Thống kê & báo cáo
🔧 Chức năng:
✅ Duyệt, khóa, xóa bất kỳ người dùng hoặc khóa học nào
✅ Gán role cho người dùng
✅ Xem thống kê tổng thể: số người dùng, khóa học, doanh thu,...
✅ Quản lý báo cáo vi phạm
✅ Quản lý hệ thống thanh toán, mã giảm giá, phương thức thanh toán
✅ Quản lý thông báo hệ thống

📦pages/
├── 📁admin/
│   ├── 📁dashboard/
│   ├── 📁users/                 # Quản lý người dùng
│   ├── 📁instructors/           # Quản lý giảng viên
│   ├── 📁content-approval/      # Duyệt khóa học & blog
│   ├── 📁reports/               # Quản lý báo cáo
│   ├── 📁system/                # Cấu hình hệ thống (mã giảm giá, thanh toán, thông báo)
│   ├── 📁statistics/            # Báo cáo thống kê
│   └── 📄index.tsx              # AdminDashboard

├── 📁moderator/
│   ├── 📁blogs/                 # Duyệt bài viết
│   ├── 📁comments/              # Duyệt bình luận/đánh giá
│   ├── 📁reports/               # Xử lý báo cáo
│   ├── 📁violations/            # Thống kê nội dung vi phạm
│   └── 📄index.tsx              # ModeratorDashboard

├── 📁instructor/
│   ├── 📁dashboard/
│   ├── 📁my-courses/            # Quản lý khóa học
│   ├── 📁create-course/         # Tạo khóa học mới
│   ├── 📁lessons/               # Quản lý bài học/video
│   ├── 📁students/              # Thống kê học viên
│   ├── 📁income/                # Thu nhập & giao dịch
│   └── 📄index.tsx              # InstructorDashboard

├── 📁client/                    # Giao diện người dùng (học viên)
│   ├── 📁home/
│   ├── 📁courses/
│   ├── 📁blogs/
│   └── 📄index.tsx              # Homepage

├── 📁layout/
│   ├── 📄AdminLayout.tsx
│   ├── 📄ModeratorLayout.tsx
│   ├── 📄InstructorLayout.tsx
│   ├── 📄ClientLayout.tsx
│   └── 📄CommonLayout.tsx

📦components/
│   ├── 📁UserTable/
│   ├── 📁CourseCard/
│   ├── 📁BlogApprovalList/
│   ├── 📁Statistics/
│   └── 📁Shared/               # Các component như Modal, ConfirmDialog, Tag, Badge,...

📦services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── course.service.ts
│   ├── report.service.ts
│   ├── payment.service.ts
│   └── ...

📦store/                        # Redux / Zustand state management

📦interfaces/                   # TypeScript interfaces cho User, Course, Report, etc.

📦utils/                        # Helper functions

📦assets/                       # Hình ảnh, icon, v.v.