const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
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

// Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
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
  console.error('Lỗi chưa được xử lý:', err);
  process.exit(1);
});

// Xử lý lỗi chưa được bắt trong async
process.on('uncaughtException', (err) => {
  console.error('Lỗi chưa được bắt:', err);
  process.exit(1);
}); 