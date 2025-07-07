const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30s
  socketTimeoutMS: 45000 // 45s
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Lỗi kết nối MongoDB:'));
db.once('open', async () => {
  console.log('Đã kết nối thành công với MongoDB');

  try {
    // Lấy danh sách roles
    const roles = await db.collection('roles').find({}).toArray();

    console.log('\n=== DANH SÁCH ROLES ===');
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name.toUpperCase()}:`);
      console.log(`   ID: ${role._id}`);
      console.log(`   Description: ${role.description || 'N/A'}`);
      console.log(`   Permissions: ${role.permissions ? role.permissions.join(', ') : 'N/A'}`);
      console.log('');
    });

    console.log('=== SỬ DỤNG TRONG POSTMAN ===');
    console.log('Thay thế ROLE_ID_HERE bằng một trong các ID trên:');
    roles.forEach(role => {
      console.log(`${role.name}: ${role._id}`);
    });

  } catch (error) {
    console.error('Lỗi trong quá trình lấy roles:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nĐã đóng kết nối MongoDB');
  }
}); 