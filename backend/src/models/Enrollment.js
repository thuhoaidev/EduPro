const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Object, default: {} }, // { [lessonId]: { watchedSeconds, videoDuration, completed, lastWatchedAt, quizPassed } }
  completed: { type: Boolean, default: false }, // Đánh dấu đã hoàn thành toàn bộ khóa học
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema); 