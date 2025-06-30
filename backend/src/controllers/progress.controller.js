const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');

// Lấy tiến độ học của học viên trong một khóa học
exports.getProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    res.json({ success: true, data: enrollment.progress || {} });
  } catch (err) { next(err); }
};

// Cập nhật tiến độ học cho một bài học
exports.updateProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { watchedSeconds, videoDuration, quizPassed } = req.body;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    if (!enrollment.progress) enrollment.progress = {};
    if (!enrollment.progress[lessonId]) enrollment.progress[lessonId] = {};
    enrollment.progress[lessonId].watchedSeconds = watchedSeconds;
    enrollment.progress[lessonId].videoDuration = videoDuration;
    enrollment.progress[lessonId].quizPassed = quizPassed;
    enrollment.progress[lessonId].lastWatchedAt = new Date();
    // Đánh dấu completed nếu đủ điều kiện
    const watchedPercent = (watchedSeconds / (videoDuration || 1)) * 100;
    enrollment.progress[lessonId].completed = watchedPercent >= 90 && quizPassed === true;
    await enrollment.save();
    res.json({ success: true, data: enrollment.progress[lessonId] });
  } catch (err) { next(err); }
};

// Lấy danh sách bài học đã mở khóa
exports.getUnlockedLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    // Lấy tất cả lessonId đã completed
    const unlocked = Object.entries(enrollment.progress || {})
      .filter(([_, v]) => v.completed)
      .map(([lessonId]) => lessonId);
    res.json({ success: true, data: unlocked });
  } catch (err) { next(err); }
}; 