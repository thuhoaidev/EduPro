const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const Notification = require('./src/models/Notification');

const PORT = process.env.PORT || 5000;

// Kết nối đến MongoDB
console.log('About to connect to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro', {
    serverSelectionTimeoutMS: 30000, // 30s
    socketTimeoutMS: 45000 // 45s
  })
  .then(() => {
    console.log('Đã kết nối với MongoDB thành công!');
  })
  .catch((error) => {
    console.log('Inside catch block for MongoDB connection error');
    console.error('Lỗi kết nối MongoDB:', error);
    fs.appendFileSync('mongo_error.log', `\n${new Date().toISOString()}\n${error.stack || error}\n`);
    console.log('Exiting due to MongoDB connection error.');
    setTimeout(() => process.exit(1), 2000); // Wait 2s to flush error
  });

// Import app từ src/app.js
const app = require('./src/app');

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

const http = require('http');
const socketio = require('socket.io');
const httpServer = http.createServer(app);
const io = socketio(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(userId);
  });

  // Lắng nghe sự kiện realtime auth-event
  socket.on('auth-event', async (data) => {
    try {
      let notif = null;
      if (data.type === 'register') {
        notif = await Notification.create({
          title: 'Đăng ký thành công',
          content: `Chào mừng ${data.user.fullname || data.user.email || 'người dùng'} đã đăng ký tài khoản!`,
          type: 'success',
          receiver: data.user._id,
          is_global: false,
          meta: { email: data.user.email },
        });
        // Gửi realtime cho user
        io.to(data.user._id).emit('new-notification', notif);
        // Gửi cho admin nếu muốn
        // io.to('admin').emit('new-notification', notif);
      } else if (data.type === 'login') {
        notif = await Notification.create({
          title: 'Đăng nhập thành công',
          content: `Xin chào ${data.user.fullname || data.user.email || 'người dùng'}!`,
          type: 'success',
          receiver: data.user._id,
          is_global: false,
          meta: { email: data.user.email },
        });
        io.to(data.user._id).emit('new-notification', notif);
      } else if (data.type === 'logout') {
        notif = await Notification.create({
          title: 'Đăng xuất thành công',
          content: 'Bạn đã đăng xuất khỏi hệ thống. Hẹn gặp lại!',
          type: 'info',
          receiver: data.userId,
          is_global: false,
        });
        io.to(data.userId).emit('new-notification', notif);
      }
    } catch (err) {
      console.error('Lỗi khi xử lý auth-event:', err);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

// Xử lý lỗi chưa được bắt
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Xử lý lỗi chưa được bắt trong async
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 