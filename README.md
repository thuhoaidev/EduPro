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