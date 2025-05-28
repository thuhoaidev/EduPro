const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./src/app');

// Import routes
const authRoutes = require('./src/routes/auth');
const roleRoutes = require('./src/routes/roleRoutes');

const PORT = process.env.PORT || 5000;

// Các middleware cơ bản
const appMiddleware = express();
appMiddleware.use(cors());
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));

// Routes
appMiddleware.use('/api/auth', authRoutes);
appMiddleware.use('/api/roles', roleRoutes);

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

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Đã kết nối đến MongoDB');
    // Khởi động server
    appMiddleware.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
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