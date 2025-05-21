const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');

const app = express();

// Các middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Có lỗi xảy ra!',
  });
});

// Middleware xử lý 404
app.use((req, res) => {
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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  }); 