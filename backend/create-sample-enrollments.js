const mongoose = require('mongoose');
const Enrollment = require('./src/models/Enrollment');
const Course = require('./src/models/Course');
const User = require('./src/models/User');
require('dotenv').config();

async function createSampleEnrollments() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });
    console.log('Đã kết nối với MongoDB');

    // Lấy danh sách khóa học và users
    const courses = await Course.find({ displayStatus: 'published' }).limit(8);
    const users = await User.find().limit(3);

    if (courses.length === 0) {
      console.log('Không có khóa học nào để tạo enrollment');
      return;
    }

    if (users.length === 0) {
      console.log('Không có user nào để tạo enrollment');
      return;
    }

    console.log(`Tìm thấy ${courses.length} khóa học và ${users.length} users`);

    // Tạo enrollment cho từng user
    for (const user of users) {
      // Mỗi user sẽ đăng ký 2-3 khóa học
      const coursesToEnroll = courses.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const course of coursesToEnroll) {
        const existingEnrollment = await Enrollment.findOne({ 
          student: user._id, 
          course: course._id 
        });
        
        if (existingEnrollment) {
          console.log(`Enrollment đã tồn tại cho user ${user._id} và course ${course._id}`);
          continue;
        }

        // Tạo enrollment với progress mẫu
        const enrollment = {
          student: user._id,
          course: course._id,
          enrolledAt: new Date(),
          progress: {
            // Tạo progress mẫu cho một số lesson
            [`lesson_${course._id}_1`]: {
              watchedSeconds: Math.floor(Math.random() * 300) + 60,
              videoDuration: 600,
              completed: Math.random() > 0.5,
              lastWatchedAt: new Date(),
              quizPassed: Math.random() > 0.3
            },
            [`lesson_${course._id}_2`]: {
              watchedSeconds: Math.floor(Math.random() * 400) + 100,
              videoDuration: 800,
              completed: Math.random() > 0.4,
              lastWatchedAt: new Date(),
              quizPassed: Math.random() > 0.5
            }
          },
          completed: false
        };

        await Enrollment.create(enrollment);
        console.log(`Đã tạo enrollment cho user ${user._id} và course ${course.title}`);
      }
    }

    console.log('Hoàn thành tạo dữ liệu enrollment mẫu!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

createSampleEnrollments(); 