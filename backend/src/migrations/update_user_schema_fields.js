const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30s
  socketTimeoutMS: 30000
})
  .then(() => console.log('Connected to MongoDB for migration'))
  .catch(err => console.error('MongoDB connection error:', err));

// Migration script để thêm các trường mới
async function updateUserSchema() {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('Bắt đầu migration: Thêm các trường mới vào User schema...');

    // Cập nhật tất cả documents để thêm các trường mới nếu chưa có
    const result = await usersCollection.updateMany(
      {
        $or: [
          { phone: { $exists: false } },
          { dob: { $exists: false } },
          { address: { $exists: false } },
        ]
      },
      {
        $set: {
          phone: null,
          dob: null,
          address: null,
        }
      }
    );

    console.log(`Migration hoàn thành! Đã cập nhật ${result.modifiedCount} documents.`);

    // Kiểm tra kết quả
    const totalUsers = await usersCollection.countDocuments();
    const usersWithNewFields = await usersCollection.countDocuments({
      $and: [
        { phone: { $exists: true } },
        { dob: { $exists: true } },
        { address: { $exists: true } },
      ]
    });

    console.log(`Tổng số users: ${totalUsers}`);
    console.log(`Users có đầy đủ trường mới: ${usersWithNewFields}`);

    // Hiển thị một số users để kiểm tra
    const sampleUsers = await usersCollection.find({}).limit(3).toArray();
    console.log('Sample users sau migration:');
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        dob: user.dob,
        address: user.address,
      });
    });

  } catch (error) {
    console.error('Lỗi trong quá trình migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy migration
updateUserSchema();

const CourseSchema = new mongoose.Schema({ ... });
CourseSchema.index({ title: 'text', description: 'text' }); 