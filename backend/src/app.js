const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const courseRoutes = require('./routes/course.routes');
const categoryRoutes = require('./routes/category.routes');
const sectionRoutes = require('./routes/section.routes');
const lessonRoutes = require('./routes/lesson.routes');
const videoRoutes = require('./routes/video.routes');
const quizRoutes = require('./routes/quiz.routes');
const voucherRoutes = require('./routes/voucher.routes');
const userRoutes = require('./routes/user.routes');
const blogRoutes = require('./routes/blog.routes');

// Khởi tạo app
const app = express();

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối với MongoDB'))
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Middleware bảo mật
app.use(helmet()); // Bảo vệ headers
app.use(mongoSanitize()); // Ngăn chặn NoSQL injection
app.use(xss()); // Ngăn chặn XSS attacks
app.use(cors({
  origin: ['https://api.edupro.com', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
})); // CORS
app.use(cookieParser()); // Parse cookies
app.use(compression()); // Nén response
app.use(express.json()); // Parse JSON body

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi IP
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút',
});
app.use('/api', limiter);

// Middleware logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware parse body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy route',
  });
});

module.exports = app; 