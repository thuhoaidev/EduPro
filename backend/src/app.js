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
const { Role } = require('./models/Role');

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/roleRoutes');

// Khởi tạo app
const app = express();

// Hàm khởi tạo roles mặc định
async function initializeDefaultRoles() {
  try {
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Quản trị viên hệ thống',
        permissions: [
          'manage_users',
          'manage_roles',
          'manage_courses',
          'manage_categories',
          'manage_quizzes',
          'manage_questions',
          'manage_announcements',
          'manage_reports',
          'manage_settings',
          'approve_courses',
          'approve_instructors',
          'view_statistics',
          'manage_moderators',
        ],
      },
      {
        name: 'moderator',
        description: 'Người kiểm duyệt nội dung',
        permissions: [
          'manage_courses',
          'manage_categories',
          'manage_quizzes',
          'manage_questions',
          'manage_announcements',
          'manage_reports',
          'approve_courses',
          'approve_instructors',
          'view_statistics',
        ],
      },
      {
        name: 'instructor',
        description: 'Giảng viên',
        permissions: [
          'create_courses',
          'edit_own_courses',
          'delete_own_courses',
          'create_quizzes',
          'edit_own_quizzes',
          'delete_own_quizzes',
          'create_questions',
          'edit_own_questions',
          'delete_own_questions',
          'view_own_statistics',
          'manage_own_announcements',
        ],
      },
      {
        name: 'student',
        description: 'Sinh viên',
        permissions: [
          'view_courses',
          'enroll_courses',
          'take_quizzes',
          'view_own_progress',
          'view_own_certificates',
          'create_discussions',
          'comment_on_discussions',
        ],
      },
      {
        name: 'guest',
        description: 'Khách',
        permissions: [
          'view_courses',
          'view_categories',
          'search_courses',
          'view_announcements',
        ],
      },
    ];

    // Tạo hoặc cập nhật roles
    for (const roleData of defaultRoles) {
      await Role.findOneAndUpdate(
        { name: roleData.name },
        roleData,
        { upsert: true, new: true },
      );
      console.log(`Đã tạo/cập nhật role: ${roleData.name}`);
    }
    console.log('Khởi tạo roles thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo roles:', error);
  }
}

// Kết nối MongoDB và khởi tạo roles
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Đã kết nối với MongoDB');
    // Khởi tạo roles sau khi kết nối database thành công
    await initializeDefaultRoles();
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Middleware bảo mật
app.use(helmet()); // Bảo vệ headers
app.use(mongoSanitize()); // Ngăn chặn NoSQL injection
app.use(xss()); // Ngăn chặn XSS attacks
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})); // CORS
app.use(cookieParser()); // Parse cookies
app.use(compression()); // Nén response

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
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