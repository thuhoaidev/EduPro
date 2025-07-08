const mongoose = require('mongoose');
const path = require('path');
const Course = require(path.join(__dirname, '../src/models/Course'));

const MONGO_URI = 'mongodb://localhost:27017/EduPro'; // Sửa lại nếu khác

async function fixInstructor(courseId, instructorId) {
  await mongoose.connect(MONGO_URI);
  const result = await Course.updateOne(
    { _id: courseId },
    { $set: { instructor: instructorId } }
  );
  if (result.modifiedCount > 0) {
    console.log('Đã cập nhật instructor cho khóa học');
  } else {
    console.log('Không tìm thấy hoặc không cập nhật được khóa học');
  }
  await mongoose.disconnect();
}

// Thay đổi 2 giá trị dưới đây cho phù hợp
const COURSE_ID = '686cebf878bff54b6744823c'; // _id của khóa học
const INSTRUCTOR_ID = '68515db5afb6d1b134031695'; // _id của user giảng viên

fixInstructor(COURSE_ID, INSTRUCTOR_ID); 