# EduPro Backend

## Công nghệ và Thư viện sử dụng

### 1. Core Framework
- **Node.js**
  - Runtime environment
  - Version: >= 14.0.0

- **Express.js**
  - Web framework
  - Xử lý HTTP requests và routing
  - Version: ^4.18.2

### 2. Database
- **MongoDB**
  - NoSQL database
  - Lưu trữ dữ liệu chính của ứng dụng
  - Version: ^6.0.0

- **Mongoose**
  - MongoDB object modeling
  - Schema validation và data modeling
  - Version: ^7.0.0

### 3. Authentication & Authorization
- **JWT (jsonwebtoken)**
  - Xử lý authentication tokens
  - Version: ^9.0.0

- **bcryptjs**
  - Mã hóa mật khẩu
  - Version: ^2.4.3

### 4. Validation & Sanitization
- **express-validator**
  - Input validation và sanitization
  - Version: ^7.0.0

### 5. Security
- **helmet**
  - Bảo mật HTTP headers
  - Version: ^7.0.0

- **cors**
  - Cross-Origin Resource Sharing
  - Version: ^2.8.5

- **dotenv**
  - Quản lý environment variables
  - Version: ^16.0.0

### 6. File Upload & Storage
- **multer**
  - Xử lý file uploads
  - Version: ^1.4.5-lts.1

- **cloudinary**
  - Cloud storage cho media files
  - Version: ^1.37.0

### 7. Development Tools
- **nodemon**
  - Auto-restart server khi có thay đổi
  - Version: ^2.0.22

- **morgan**
  - HTTP request logger
  - Version: ^1.10.0

- **winston**
  - Logging system
  - Version: ^3.8.2

### 8. Testing
- **Jest**
  - Testing framework
  - Version: ^29.5.0

- **supertest**
  - HTTP testing
  - Version: ^6.3.3

## Scripts

```bash
# Khởi chạy development server
npm run dev

# Khởi chạy production server
npm start

# Chạy tests
npm test

# Build TypeScript
npm run build
```

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình (database, env, etc.)
│   ├── controllers/     # Route controllers
│   │   ├── auth/       # Authentication controllers
│   │   ├── user/       # User management
│   │   ├── course/     # Course management
│   │   ├── lesson/     # Lesson management
│   │   ├── order/      # Order processing
│   │   └── ...         # Other controllers
│   ├── middleware/      # Custom middleware
│   │   ├── auth/       # Authentication middleware
│   │   ├── upload/     # File upload middleware
│   │   └── validation/ # Request validation
│   ├── models/         # Database models
│   │   ├── user.js
│   │   ├── course.js
│   │   ├── lesson.js
│   │   └── ...        # Other models
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── course.js
│   │   └── ...        # Other routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── tests/              # Test files
├── .env               # Environment variables
└── package.json       # Dependencies và scripts
```

## API Endpoints

### Authentication
- POST /api/auth/register - Đăng ký tài khoản
- POST /api/auth/login - Đăng nhập
- POST /api/auth/logout - Đăng xuất
- POST /api/auth/refresh-token - Làm mới token

### Users
- GET /api/users/profile - Lấy thông tin profile
- PUT /api/users/profile - Cập nhật profile
- GET /api/users/courses - Lấy danh sách khóa học của user

### Courses
- GET /api/courses - Lấy danh sách khóa học
- GET /api/courses/:id - Lấy chi tiết khóa học
- POST /api/courses - Tạo khóa học mới (Admin)
- PUT /api/courses/:id - Cập nhật khóa học (Admin)
- DELETE /api/courses/:id - Xóa khóa học (Admin)

### Lessons
- GET /api/courses/:courseId/lessons - Lấy danh sách bài học
- GET /api/lessons/:id - Lấy chi tiết bài học
- POST /api/lessons - Tạo bài học mới (Admin)
- PUT /api/lessons/:id - Cập nhật bài học (Admin)
- DELETE /api/lessons/:id - Xóa bài học (Admin)

### Orders
- POST /api/orders - Tạo đơn hàng mới
- GET /api/orders - Lấy danh sách đơn hàng
- GET /api/orders/:id - Lấy chi tiết đơn hàng

## Yêu cầu hệ thống

- Node.js (version >= 14.0.0)
- npm (version >= 6.0.0)
- MongoDB (version >= 6.0.0)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình các biến môi trường trong .env
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
# ...

# Khởi chạy development server
npm run dev
```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/edupro

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (nếu cần)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

## Security

- Sử dụng HTTPS trong production
- Implement rate limiting
- Sanitize user inputs
- Validate request data
- Secure headers với helmet
- CORS configuration
- JWT authentication
- Password hashing với bcrypt
- Environment variables cho sensitive data

## Error Handling

- Global error handling middleware
- Custom error classes
- Validation error handling
- JWT error handling
- MongoDB error handling

## Logging

- Winston logger cho application logs
- Morgan cho HTTP request logging
- Error logging
- Access logging

## Testing

```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch
``` 