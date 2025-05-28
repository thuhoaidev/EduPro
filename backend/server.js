const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Đã kết nối đến MongoDB');
    // Khởi động server
    app.listen(PORT, () => {
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