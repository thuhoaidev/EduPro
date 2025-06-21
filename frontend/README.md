# 🎨 EduPro Frontend

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)

Frontend cho nền tảng giáo dục trực tuyến EduPro, được xây dựng với React 18, TypeScript và Vite.

## 🚀 Tính năng chính

### 👨‍🎓 Cho Học viên
- Khóa học đa dạng với video bài giảng
- Theo dõi tiến độ học tập
- Blog và cộng đồng học tập
- Hồ sơ cá nhân và chứng chỉ

### 👨‍🏫 Cho Giảng viên
- Quản lý khóa học và nội dung
- Thống kê học viên và thu nhập
- Upload video và tài liệu
- Hồ sơ chuyên môn

### 👨‍💼 Cho Quản trị viên
- Dashboard quản lý toàn bộ hệ thống
- Duyệt giảng viên và nội dung
- Quản lý người dùng và báo cáo
- Thống kê tổng thể

### 🛡️ Cho Moderator
- Duyệt bài viết và bình luận
- Xử lý báo cáo vi phạm
- Quản lý nội dung cộng đồng

## 🛠️ Công nghệ sử dụng

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **SCSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

## ⚡ Cài đặt nhanh

### 1. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường
```bash
# Tạo file .env và cấu hình API URL
VITE_API_URL=http://localhost:5000/api
```

### 3. Khởi chạy development server
```bash
npm run dev
```

## 🚀 Scripts

```bash
npm run dev          # Khởi chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Kiểm tra code style
```

## 🏗️ Cấu trúc dự án

```
frontend/
├── src/
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin dashboard
│   │   ├── client/      # Client pages
│   │   ├── instructor/  # Instructor dashboard
│   │   └── Moderator/   # Moderator pages
│   ├── components/      # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── interfaces/     # TypeScript interfaces
│   ├── assets/         # Static assets
│   └── styles/         # CSS modules
└── public/             # Public assets
```

## 🔐 Authentication

Hệ thống sử dụng JWT tokens với role-based access control:
- **Student**: Truy cập khóa học, blog, profile
- **Instructor**: Tạo/quản lý khóa học
- **Admin**: Quản lý toàn bộ hệ thống
- **Moderator**: Duyệt nội dung

## 📱 Responsive Design

Giao diện được thiết kế responsive với mobile-first approach, hỗ trợ đầy đủ trên:
- Desktop (>= 1024px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🧪 Testing

```bash
npm test             # Chạy tests
npm run test:watch   # Chạy tests với watch mode
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit thay đổi
4. Push to branch
5. Mở Pull Request

## 📝 License

MIT License

## 📞 Support

- **Email**: frontend@edupro.com
- **Issues**: https://github.com/your-username/edupro/issues

---

⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star! 