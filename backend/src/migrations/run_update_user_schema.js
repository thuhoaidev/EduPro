const mongoose = require('mongoose');
const updateUserSchema = require('./update_user_schema');

async function runMigration() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect('mongodb://localhost:27017/edu_pro', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    console.log('Kết nối đến MongoDB thành công!');

    // Chạy migration
    await updateUserSchema();

    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('Hoàn thành migration!');
  } catch (error) {
    console.error('Lỗi khi chạy migration:', error);
    process.exit(1);
  }
}

runMigration();
