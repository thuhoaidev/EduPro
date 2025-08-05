const mongoose = require('mongoose');
const UserBehavior = require('./src/models/UserBehavior');
const Course = require('./src/models/Course');
const User = require('./src/models/User');
require('dotenv').config();

async function createSampleUserBehavior() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });
    console.log('Đã kết nối với MongoDB');

    // Lấy danh sách khóa học
    const courses = await Course.find({ displayStatus: 'published' }).limit(10);
    const users = await User.find().limit(5);

    if (courses.length === 0) {
      console.log('Không có khóa học nào để tạo dữ liệu mẫu');
      return;
    }

    if (users.length === 0) {
      console.log('Không có user nào để tạo dữ liệu mẫu');
      return;
    }

    console.log(`Tìm thấy ${courses.length} khóa học và ${users.length} users`);

    // Tạo dữ liệu mẫu cho từng user
    for (const user of users) {
      const existingBehavior = await UserBehavior.findOne({ userId: user._id });
      
      if (existingBehavior) {
        console.log(`UserBehavior đã tồn tại cho user ${user._id}`);
        continue;
      }

      // Tạo dữ liệu mẫu
      const sampleBehavior = {
        userId: user._id,
        viewedCourses: courses.slice(0, 3).map(course => ({
          courseId: course._id,
          viewCount: Math.floor(Math.random() * 5) + 1,
          lastViewed: new Date(),
          totalTimeSpent: Math.floor(Math.random() * 600) + 60 // 1-10 phút
        })),
        completedCourses: courses.slice(0, 1).map(course => ({
          courseId: course._id,
          completedAt: new Date()
        })),
        ratedCourses: courses.slice(0, 2).map(course => ({
          courseId: course._id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 sao
          ratedAt: new Date()
        })),
        commentedCourses: courses.slice(0, 1).map(course => ({
          courseId: course._id,
          commentedAt: new Date()
        })),
        bookmarkedCourses: courses.slice(0, 2).map(course => ({
          courseId: course._id,
          bookmarkedAt: new Date()
        })),
        sharedCourses: courses.slice(0, 1).map(course => ({
          courseId: course._id,
          sharedAt: new Date()
        })),
        purchasedCourses: courses.slice(0, 2).map(course => ({
          courseId: course._id,
          price: course.price || 100000,
          purchasedAt: new Date()
        })),
        totalSpent: courses.slice(0, 2).reduce((sum, course) => sum + (course.price || 100000), 0),
        lastActivity: new Date()
      };

      await UserBehavior.create(sampleBehavior);
      console.log(`Đã tạo UserBehavior cho user ${user._id}`);
    }

    console.log('Hoàn thành tạo dữ liệu mẫu!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

createSampleUserBehavior(); 