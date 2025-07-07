# 🚀 EduPro Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)

Backend API cho nền tảng giáo dục trực tuyến EduPro, được xây dựng với Node.js, Express.js và MongoDB. Cung cấp RESTful API cho quản lý người dùng, khóa học, thanh toán và nhiều tính năng khác.

## 🏗️ Kiến trúc hệ thống

```
backend/
├── 📁 src/
│   ├── 📁 config/              # Cấu hình database, email, cloudinary
│   ├── 📁 controllers/         # Route controllers
│   │   ├── auth.controller.js      # Authentication
│   │   ├── user.controller.js      # User management
│   │   ├── course.controller.js    # Course management
│   │   ├── lesson.controller.js    # Lesson management
│   │   ├── blog.controller.js      # Blog management
│   │   └── quiz.controller.js      # Quiz management
│   ├── 📁 middlewares/         # Custom middleware
│   │   ├── auth.js                 # JWT authentication
│   │   ├── checkRole.js            # Role-based access control
│   │   ├── upload.js               # File upload handling
│   │   └── validation.js           # Request validation
│   ├── 📁 models/              # Database models
│   │   ├── User.js                 # User schema
│   │   ├── Course.js               # Course schema
│   │   ├── Lesson.js               # Lesson schema
│   │   ├── Blog.js                 # Blog schema
│   │   └── Role.js                 # Role schema
│   ├── 📁 routes/              # API routes
│   │   ├── auth.routes.js          # Authentication routes
│   │   ├── user.routes.js          # User routes
│   │   ├── course.routes.js        # Course routes
│   │   └── blog.routes.js          # Blog routes
│   ├── 📁 validations/         # Request validation schemas
│   ├── 📁 utils/               # Utility functions
│   │   ├── ApiError.js             # Error handling
│   │   ├── cloudinary.js           # Cloudinary config
│   │   └── sendEmail.js            # Email service
│   └── 📄 app.js               # Express app setup
├── 📁 scripts/                 # Database scripts & utilities
├── 📁 uploads/                 # File uploads (temporary)
├── 📁 migrations/              # Database migrations
└── 📄 server.js                # Server entry point
```

## 🛠️ Công nghệ sử dụng

### Core Framework
- **Node.js** (>= 18.0.0) - Runtime environment
- **Express.js** (^4.18.2) - Web framework
- **MongoDB** (^6.0.0) - NoSQL database
- **Mongoose** (^7.0.0) - MongoDB ODM

### Authentication & Security
- **JWT** (^9.0.0) - JSON Web Tokens
- **bcryptjs** (^2.4.3) - Password hashing
- **helmet** (^7.0.0) - Security headers
- **cors** (^2.8.5) - Cross-origin resource sharing
- **express-rate-limit** (^7.5.0) - Rate limiting

### File Handling & Storage
- **multer** (^1.4.5-lts.1) - File upload middleware
- **cloudinary** (^1.37.0) - Cloud storage service
- **express-mongo-sanitize** (^2.2.0) - MongoDB injection protection

### Validation & Sanitization
- **express-validator** (^7.0.0) - Input validation
- **joi** (^17.13.3) - Schema validation
- **xss-clean** (^0.1.4) - XSS protection

### Development & Logging
- **nodemon** (^2.0.22) - Auto-restart development
- **morgan** (^1.10.0) - HTTP request logger
- **winston** (^3.8.2) - Logging system
- **compression** (^1.8.0) - Response compression

### Email & Communication
- **nodemailer** (^7.0.3) - Email service
- **dotenv** (^16.0.0) - Environment variables

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0.0
- **Git** >= 2.0.0

## ⚡ Cài đặt nhanh

### 1. Clone và cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

### 3. Khởi chạy development server
```bash
npm run dev
```

## 🔧 Cấu hình môi trường

Tạo file `.env` với các biến sau:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edupro

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=EduPro <noreply@edupro.com>

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4
```

## 🚀 Scripts

```bash
# Development
npm run dev              # Khởi chạy development server với nodemon
npm start                # Khởi chạy production server
npm run build            # Build project (nếu có TypeScript)

# Testing
npm test                 # Chạy tests
npm run test:watch       # Chạy tests với watch mode
npm run test:coverage    # Chạy tests với coverage report

# Code Quality
npm run lint             # Kiểm tra code style với ESLint
npm run lint:fix         # Tự động fix lỗi ESLint
npm run format           # Format code với Prettier

# Database
npm run migrate          # Chạy database migrations
npm run seed             # Seed dữ liệu mẫu
```

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập | ❌ |
| `POST` | `/api/auth/logout` | Đăng xuất | ✅ |
| `POST` | `/api/auth/refresh-token` | Làm mới access token | ❌ |
| `POST` | `/api/auth/forgot-password` | Quên mật khẩu | ❌ |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu | ❌ |

### 👥 User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users/profile` | Lấy thông tin profile | ✅ |
| `PUT` | `/api/users/profile` | Cập nhật profile | ✅ |
| `GET` | `/api/users/instructors/pending` | Danh sách giảng viên chờ duyệt | ✅ (Admin) |
| `PUT` | `/api/users/instructors/:id/approval` | Duyệt giảng viên | ✅ (Admin) |

### 📚 Course Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/courses` | Lấy danh sách khóa học | ❌ |
| `GET` | `/api/courses/:id` | Lấy chi tiết khóa học | ❌ |
| `POST` | `/api/courses` | Tạo khóa học mới | ✅ (Instructor) |
| `PUT` | `/api/courses/:id` | Cập nhật khóa học | ✅ (Owner/Admin) |
| `DELETE` | `/api/courses/:id` | Xóa khóa học | ✅ (Owner/Admin) |

### 📝 Blog Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/blogs` | Lấy danh sách bài viết | ❌ |
| `GET` | `/api/blogs/:id` | Lấy chi tiết bài viết | ❌ |
| `POST` | `/api/blogs` | Tạo bài viết mới | ✅ |
| `PUT` | `/api/blogs/:id` | Cập nhật bài viết | ✅ (Owner/Admin) |
| `DELETE` | `/api/blogs/:id` | Xóa bài viết | ✅ (Owner/Admin) |

## 🔒 Authentication & Authorization

### JWT Token Structure
```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "student|instructor|admin|moderator",
    "iat": 1640995200,
    "exp": 1641600000
  }
}
```

### Role-based Access Control
- **Student**: Truy cập khóa học, blog, profile
- **Instructor**: Tạo/quản lý khóa học, xem thống kê
- **Admin**: Quản lý toàn bộ hệ thống
- **Moderator**: Duyệt nội dung, xử lý báo cáo

## 📊 Database Models

```

## 🧪 Testing

### Chạy tests
```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests cụ thể
npm test -- --grep "User API"
```

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

## 📦 Deployment

### Production Build
```bash
# Cài đặt dependencies
npm ci --only=production

# Set environment variables
NODE_ENV=production

# Khởi chạy server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔍 Monitoring & Logging

### Winston Logger Configuration
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được cấp phép theo [MIT License](LICENSE).

## 📞 Support

- **Email**: backend@edupro.com
- **Documentation**: https://docs.edupro.com/api
- **Issues**: https://github.com/your-username/edupro/issues

---

⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star! 