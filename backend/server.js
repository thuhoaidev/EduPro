const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./src/app');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const roleRoutes = require('./src/routes/role.routes');
const voucherRoutes = require('./src/routes/voucher.routes');
const categoryRoutes = require('./src/routes/category.routes');
const userRoutes = require('./src/routes/userManagement.routes');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Các middleware cơ bản
const appMiddleware = express();
appMiddleware.use(cors({
    origin: 'http://localhost:5173', // Chỉ cho phép từ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 hours
}));
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));

// Routes
appMiddleware.use('/api/auth', authRoutes);
appMiddleware.use('/api/roles', roleRoutes);
appMiddleware.use('/api/vouchers', voucherRoutes);
appMiddleware.use('/api/categories', categoryRoutes);
appMiddleware.use('/api/admin/users', userRoutes);

// Xử lý preflight request (OPTIONS)
appMiddleware.options('*', cors());

// Logging
appMiddleware.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware xử lý lỗi
appMiddleware.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Có lỗi xảy ra!',
  });
});

// Middleware xử lý 404
appMiddleware.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy trang',
  });
});

// Khởi động server
const server = appMiddleware.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Xử lý lỗi chưa được bắt
process.on('unhandledRejection', (err) => {
  console.error('Lỗi chưa được xử lý:', err);
  process.exit(1);
});

// Xử lý lỗi chưa được bắt trong async
process.on('uncaughtException', (err) => {
  console.error('Lỗi chưa được bắt:', err);
  process.exit(1);
}); 