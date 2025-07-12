const mongoose = require('mongoose');
const Course = require('../src/models/Course');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateCourseStatuses = async () => {
  try {
    console.log('Bắt đầu cập nhật trạng thái khóa học...');

    // Cập nhật tất cả khóa học hiện có
    const courses = await Course.find({});
    console.log(`Tìm thấy ${courses.length} khóa học cần cập nhật`);

    for (const course of courses) {
      let newStatus = course.status;
      let newDisplayStatus = 'hidden';

      // Chuyển đổi trạng thái cũ sang trạng thái mới
      switch (course.status) {
        case 'draft':
          newStatus = 'draft';
          newDisplayStatus = 'hidden';
          break;
        case 'pending':
          newStatus = 'pending';
          newDisplayStatus = 'hidden';
          break;
        case 'published':
          newStatus = 'approved';
          newDisplayStatus = 'published';
          break;
        case 'rejected':
          newStatus = 'rejected';
          newDisplayStatus = 'hidden';
          break;
        case 'archived':
          newStatus = 'draft';
          newDisplayStatus = 'hidden';
          break;
        default:
          newStatus = 'draft';
          newDisplayStatus = 'hidden';
      }

      // Cập nhật khóa học
      await Course.findByIdAndUpdate(course._id, {
        status: newStatus,
        displayStatus: newDisplayStatus
      });

      console.log(`Đã cập nhật khóa học: ${course.title} - ${course.status} -> ${newStatus} (${newDisplayStatus})`);
    }

    console.log('Hoàn thành cập nhật trạng thái khóa học!');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái khóa học:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateCourseStatuses(); 