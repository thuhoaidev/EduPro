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
    // Cập nhật collection users để thêm trường avatar và social_links
    const result = await db.collection('users').updateMany(
      {},
      {
        $set: {
          avatar: null, // Mặc định null, sẽ được cập nhật sau
          social_links: {
            facebook: null,
            twitter: null,
            linkedin: null,
            youtube: null,
            github: null,
            website: null,
          },
        },
      }
    );

    console.log(`Đã cập nhật ${result.modifiedCount} user documents`);
    console.log('Migration hoàn thành thành công!');

    // Hiển thị một số user để kiểm tra
    const sampleUsers = await db.collection('users').find({}).limit(3).toArray();
    console.log('\nMẫu user sau khi cập nhật:');
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        email: user.email,
        avatar: user.avatar,
        social_links: user.social_links,
      });
    });

  } catch (error) {
    console.error('Lỗi trong quá trình migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}); 