# 🎓 EduPro - Nền tảng Giáo dục Trực tuyến

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

EduPro là một nền tảng học trực tuyến toàn diện, cung cấp các khóa học chất lượng cao với nhiều tính năng tương tác và học tập hiện đại. Dự án được xây dựng với kiến trúc microservices, sử dụng Node.js cho backend và React cho frontend.

## 🚀 Tính năng chính

### 👨‍🎓 Cho Học viên
- **Khóa học đa dạng**: Truy cập hàng nghìn khóa học từ các lĩnh vực khác nhau
- **Học tập tương tác**: Video bài giảng, quiz, bài tập thực hành
- **Theo dõi tiến độ**: Dashboard cá nhân với thống kê học tập chi tiết
- **Hệ thống điểm danh**: Streak học tập và huy hiệu thành tích
- **Cộng đồng học tập**: Blog, bình luận, chia sẻ kiến thức
- **Chứng chỉ**: Nhận chứng chỉ hoàn thành khóa học

### 👨‍🏫 Cho Giảng viên
- **Quản lý khóa học**: Tạo, chỉnh sửa, xuất bản khóa học
- **Quản lý nội dung**: Upload video, tạo quiz, bài tập
- **Thống kê học viên**: Theo dõi tiến độ và phản hồi
- **Thu nhập**: Quản lý doanh thu và giao dịch
- **Hồ sơ chuyên môn**: Upload bằng cấp, kinh nghiệm

### 👨‍💼 Cho Quản trị viên
- **Quản lý người dùng**: Duyệt, khóa, phân quyền
- **Duyệt nội dung**: Kiểm duyệt khóa học và bài viết
- **Quản lý báo cáo**: Xử lý vi phạm và khiếu nại
- **Thống kê tổng thể**: Dashboard với dữ liệu chi tiết
- **Quản lý hệ thống**: Voucher, thanh toán, thông báo

## 🏗️ Kiến trúc hệ thống

```
EduPro/
├── 📁 backend/                 # Backend API (Node.js/Express)
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Route controllers
│   │   ├── 📁 models/          # Database models
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 middlewares/     # Custom middleware
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 validations/     # Request validation
│   ├── 📁 scripts/             # Database scripts
│   ├── 📁 uploads/             # File uploads
│   └── 📄 server.js            # Entry point
├── 📁 frontend/                # Frontend (React/TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 services/        # API services
│   │   ├── 📁 hooks/           # Custom hooks
│   │   └── 📁 utils/           # Utility functions
│   └── 📄 package.json
└── 📄 README.md
```

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage
- **Nodemailer** - Email service

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Routing
- **SCSS** - Styling

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0.0
- **Git** >= 2.0.0

## ⚡ Cài đặt nhanh

### 1. Clone repository
```bash
git clone https://github.com/your-username/edupro.git
cd edupro
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
cp .env.example .env
# Cấu hình các biến môi trường trong .env
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Cấu hình môi trường

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edupro

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 🚀 Scripts

### Backend
```bash
npm run dev          # Khởi chạy development server
npm start            # Khởi chạy production server
npm run test         # Chạy tests
npm run lint         # Kiểm tra code style
```

### Frontend
```bash
npm run dev          # Khởi chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Kiểm tra code style
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/instructors/pending` - Danh sách giảng viên chờ duyệt

### Courses
- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Lấy chi tiết khóa học
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id` - Cập nhật khóa học

### Instructor Profile
- `GET /api/users/instructor-profile/my` - Lấy hồ sơ giảng viên
- `POST /api/users/instructor-profile/submit` - Nộp hồ sơ giảng viên
- `PUT /api/users/instructor-profile/update` - Cập nhật hồ sơ

## 👥 Roles và Permissions

### 🔐 Admin
- Quản lý toàn bộ hệ thống
- Duyệt giảng viên và nội dung
- Xem thống kê tổng thể
- Quản lý báo cáo vi phạm

### 👨‍🏫 Instructor
- Tạo và quản lý khóa học
- Upload nội dung giảng dạy
- Xem thống kê học viên
- Quản lý thu nhập

### 👨‍🎓 Student
- Đăng ký và học khóa học
- Tương tác với cộng đồng
- Nộp hồ sơ trở thành giảng viên
- Theo dõi tiến độ học tập

### 🛡️ Moderator
- Duyệt bài viết và bình luận
- Xử lý báo cáo vi phạm
- Quản lý nội dung cộng đồng

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  fullname: String,
  nickname: String,
  role_id: ObjectId,
  status: String,
  approval_status: String,
  avatar: String,
  social_links: {
    facebook: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    github: String,
    website: String
  },
  instructorInfo: {
    is_approved: Boolean,
    experience_years: Number,
    specializations: [String],
    certificates: [Object],
    demo_video: String,
    cv_file: String
  }
}
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend (Heroku/Vercel)
```bash
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
npm run build
```

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được cấp phép theo [MIT License](LICENSE).

## 📞 Liên hệ

- **Email**: contact@edupro.com
- **Website**: https://edupro.com
- **GitHub**: https://github.com/your-username/edupro

## 🙏 Acknowledgments

- Cảm ơn tất cả contributors đã đóng góp cho dự án
- Icons từ [Feather Icons](https://feathericons.com/)
- UI components từ [Ant Design](https://ant.design/)

---

⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star!