const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const Section = require('../models/Section');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

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
    const { watchedSeconds, videoDuration, quizPassed, quizAnswers } = req.body;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    if (!enrollment.progress) enrollment.progress = {};
    if (!enrollment.progress[lessonId]) enrollment.progress[lessonId] = {};
    enrollment.progress[lessonId].watchedSeconds = watchedSeconds;
    enrollment.progress[lessonId].videoDuration = videoDuration;
    enrollment.progress[lessonId].quizPassed = quizPassed;
    enrollment.progress[lessonId].lastWatchedAt = new Date();
    // Cập nhật bài học đang học dở mới nhất
    enrollment.progress.lastWatchedLessonId = lessonId;
    // Lưu đáp án quiz
    console.log('quizAnswers nhận được:', quizAnswers);
    if (Array.isArray(quizAnswers)) {
      enrollment.progress[lessonId].quizAnswers = quizAnswers;
      console.log('quizAnswers đã lưu vào progress:', enrollment.progress[lessonId].quizAnswers);
    }
    // Đánh dấu videoCompleted nếu đủ 90% (và không bao giờ set lại false)
    const watchedPercent = (watchedSeconds / (videoDuration || 1)) * 100;
    let justCompleted = false;
    if (watchedPercent >= 90) {
      enrollment.progress[lessonId].videoCompleted = true;
      // completed chỉ true khi đã xem đủ 90% và qua quiz
      const wasCompleted = enrollment.progress[lessonId].completed;
      enrollment.progress[lessonId].completed = enrollment.progress[lessonId].videoCompleted && quizPassed === true;
      if (!wasCompleted && enrollment.progress[lessonId].completed) {
        justCompleted = true;
      }
      // Tìm và mở khóa bài học tiếp theo nếu có
      const sections = await Section.find({ course_id: courseId }).sort({ position: 1 }).lean();
      let found = false;
      let nextLessonId = null;
      for (let s = 0; s < sections.length; s++) {
        const lessons = sections[s].lessons;
        const lessonDocs = await Lesson.find({ _id: { $in: lessons } }).sort({ position: 1 }).lean();
        for (let l = 0; l < lessonDocs.length; l++) {
          if (String(lessonDocs[l]._id) === String(lessonId)) {
            if (l + 1 < lessonDocs.length) {
              nextLessonId = lessonDocs[l + 1]._id;
            } else if (s + 1 < sections.length) {
              const nextSectionLessons = await Lesson.find({ _id: { $in: sections[s + 1].lessons } }).sort({ position: 1 }).lean();
              if (nextSectionLessons.length > 0) {
                nextLessonId = nextSectionLessons[0]._id;
              }
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (nextLessonId) {
        if (!enrollment.progress[nextLessonId]) {
          enrollment.progress[nextLessonId] = { videoCompleted: false, watchedSeconds: 0 };
          console.log('Đã mở khóa bài tiếp theo:', nextLessonId);
        } else if (enrollment.progress[nextLessonId] && enrollment.progress[nextLessonId].videoCompleted !== true) {
          enrollment.progress[nextLessonId].videoCompleted = false;
          if (typeof enrollment.progress[nextLessonId].watchedSeconds !== 'number' || enrollment.progress[nextLessonId].watchedSeconds > 0) {
            enrollment.progress[nextLessonId].watchedSeconds = 0;
          }
          console.log('Đã cập nhật videoCompleted: false và watchedSeconds: 0 cho bài tiếp theo:', nextLessonId);
        } else {
          console.log('Bài tiếp theo đã mở hoặc đã hoàn thành:', nextLessonId);
        }
      }
    }
    // completed chỉ true khi đã xem đủ 90% và qua quiz
    if (!enrollment.progress[lessonId].completed) {
      enrollment.progress[lessonId].completed = enrollment.progress[lessonId].videoCompleted && quizPassed === true;
    }
    enrollment.markModified('progress');
    await enrollment.save();
    // Gửi thông báo khi vừa hoàn thành bài học
    if (justCompleted) {
      const lesson = await Lesson.findById(lessonId);
      const course = await Course.findById(courseId);
      const notification = await Notification.create({
        title: 'Chúc mừng bạn đã hoàn thành bài học!',
        content: `Bạn vừa hoàn thành bài học "${lesson?.title || ''}" trong khóa "${course?.title || ''}".`,
        type: 'success',
        receiver: userId,
        icon: 'book-open',
        meta: { link: `/courses/${courseId}/lessons/${lessonId}` }
      });
      const io = req.app.get && req.app.get('io');
      if (io && notification.receiver) {
        io.to(notification.receiver.toString()).emit('new-notification', notification);
      }
    }
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
    // Lấy tất cả lessonId đã có trường videoCompleted (dù true hay false)
    const unlocked = Object.entries(enrollment.progress || {})
      .filter(([_, v]) => v.videoCompleted !== undefined)
      .map(([lessonId]) => lessonId);
    // Log debug
    console.log('getUnlockedLessons - user:', userId, 'course:', courseId);
    console.log('getUnlockedLessons - progress:', enrollment.progress);
    console.log('getUnlockedLessons - unlocked:', unlocked);
    res.json({ success: true, data: unlocked });
  } catch (err) { next(err); }
};

// Lấy thời gian xem video cuối cùng của một bài học
exports.getVideoProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne(
      { course: courseId, student: userId },
      { progress: { $ifNull: ['$progress', {}] } } // Chỉ lấy trường progress, nếu null thì trả về {}
    );

    if (!enrollment) {
      // Không cần ném lỗi vì có thể người dùng mới bắt đầu, chưa có enrollment
      return res.json({ success: true, data: { watchedSeconds: 0 } });
    }

    const lessonProgress = enrollment.progress[lessonId];
    const watchedSeconds = lessonProgress ? lessonProgress.watchedSeconds || 0 : 0;

    res.json({ success: true, data: { watchedSeconds } });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thời gian xem video
exports.updateVideoProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { currentTime } = req.body;

    if (typeof currentTime !== 'number') {
      throw new ApiError(400, 'Dữ liệu currentTime không hợp lệ');
    }

    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');

    // Sử dụng $set để cập nhật hoặc tạo mới trường trong object progress
    const updateField = `progress.${lessonId}.watchedSeconds`;
    const updateDate = new Date();
    const update = {
      $set: {
        [updateField]: currentTime,
        'progress.${lessonId}.lastWatchedAt': updateDate
      }
    };
    await enrollment.updateOne(update);
    res.json({ success: true, data: enrollment.progress[lessonId] });
  } catch (err) { next(err); }
};

// Đánh dấu hoàn thành toàn bộ khóa học
exports.markCourseCompleted = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    if (enrollment.completed) {
      return res.json({ success: true, completed: true, message: 'Khóa học đã được đánh dấu hoàn thành trước đó.' });
    }
    enrollment.completed = true;
    await enrollment.save();
    res.json({ success: true, completed: true });
  } catch (err) { next(err); }
};