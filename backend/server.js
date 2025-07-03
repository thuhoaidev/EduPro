const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro', {
    serverSelectionTimeoutMS: 30000, // 30s
    socketTimeoutMS: 45000 // 45s
  })
  .then(() => {
    // console.log('Đã kết nối với MongoDB');
  })
  .catch(() => {
    // Không log lỗi chi tiết ra console
    process.exit(1);
  });

// Import app từ src/app.js
const app = require('./src/app');

// Các middleware cơ bản
app.use(cors({
  origin: 'http://localhost:5173', // Chỉ cho phép từ frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
}));

// Xử lý preflight request (OPTIONS)
app.options('*', cors());

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  // Kiểm tra nếu là ApiError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Có lỗi xảy ra!',
      errors: err.errors || [],
    });
  }

  // Lỗi khác
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

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

// Xử lý lỗi chưa được bắt
process.on('unhandledRejection', (err) => {
  process.exit(1);
});

// Xử lý lỗi chưa được bắt trong async
process.on('uncaughtException', (err) => {
  process.exit(1);
}); 