const mongoose = require('mongoose');
const updateFullnameField = require('./update_fullname_field');

async function runMigration() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect('mongodb://localhost:27017/edu_pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Kết nối đến MongoDB thành công!');

    // Chạy migration
    await updateFullnameField();

    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('Hoàn thành migration!');
  } catch (error) {
    console.error('Lỗi khi chạy migration:', error);
    process.exit(1);
  }
}

runMigration();
