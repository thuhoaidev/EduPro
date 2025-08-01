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
  } catch (err) {
    next(err);
  }
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
    if (Array.isArray(quizAnswers)) {
      enrollment.progress[lessonId].quizAnswers = quizAnswers;
    }
    // Đánh dấu videoCompleted nếu đủ 90% (và không bao giờ set lại false)
    const watchedPercent = (watchedSeconds / (videoDuration || 1)) * 100;
    let justCompleted = false;
    if (watchedPercent >= 90) {
      enrollment.progress[lessonId].videoCompleted = true;
      // completed chỉ true khi đã xem đủ 90% và qua quiz
      const wasCompleted = enrollment.progress[lessonId].completed;
      enrollment.progress[lessonId].completed =
        enrollment.progress[lessonId].videoCompleted && quizPassed === true;
      if (!wasCompleted && enrollment.progress[lessonId].completed) {
        justCompleted = true;
      }
      // Tìm và mở khóa bài học tiếp theo nếu có
      const sections = await Section.find({ course_id: courseId }).sort({ position: 1 }).lean();
      let found = false;
      let nextLessonId = null;
      for (let s = 0; s < sections.length; s++) {
        const lessons = sections[s].lessons;
        const lessonDocs = await Lesson.find({ _id: { $in: lessons } })
          .sort({ position: 1 })
          .lean();
        for (let l = 0; l < lessonDocs.length; l++) {
          if (String(lessonDocs[l]._id) === String(lessonId)) {
            if (l + 1 < lessonDocs.length) {
              nextLessonId = lessonDocs[l + 1]._id;
            } else if (s + 1 < sections.length) {
              const nextSectionLessons = await Lesson.find({
                _id: { $in: sections[s + 1].lessons },
              })
                .sort({ position: 1 })
                .lean();
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
        // Chỉ mở khóa bài học tiếp theo khi đã hoàn thành cả video và quiz
        const isCurrentLessonCompleted =
          enrollment.progress[lessonId].videoCompleted && quizPassed === true;

        if (isCurrentLessonCompleted) {
          if (!enrollment.progress[nextLessonId]) {
            enrollment.progress[nextLessonId] = { videoCompleted: false, watchedSeconds: 0 };
          } else if (
            enrollment.progress[nextLessonId] &&
            enrollment.progress[nextLessonId].videoCompleted !== true
          ) {
            enrollment.progress[nextLessonId].videoCompleted = false;
            if (
              typeof enrollment.progress[nextLessonId].watchedSeconds !== 'number' ||
              enrollment.progress[nextLessonId].watchedSeconds > 0
            ) {
              enrollment.progress[nextLessonId].watchedSeconds = 0;
            }
          }
        }
      }
    }
    // completed chỉ true khi đã xem đủ 90% và qua quiz
    if (!enrollment.progress[lessonId].completed) {
      enrollment.progress[lessonId].completed =
        enrollment.progress[lessonId].videoCompleted && quizPassed === true;
    }
    enrollment.markModified('progress');
    await enrollment.save();
    // Gửi thông báo khi vừa hoàn thành bài học
    if (justCompleted) {
      const lesson = await Lesson.findById(lessonId);
      const course = await Course.findById(courseId);
      const notification = await Notification.create({
        title: 'Chúc mừng bạn đã hoàn thành bài học!',
        content: `Bạn vừa hoàn thành bài học "${lesson?.title || ''}" trong khóa "${
          course?.title || ''
        }".`,
        type: 'success',
        receiver: userId,
        icon: 'book-open',
        meta: { link: `/lessons/${lessonId}/video` },
      });
      const io = req.app.get && req.app.get('io');
      if (io && notification.receiver) {
        io.to(notification.receiver.toString()).emit('new-notification', notification);
      }
    }
    res.json({ success: true, data: enrollment.progress[lessonId] });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách bài học đã mở khóa
exports.getUnlockedLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');

    // Lấy tất cả sections và lessons của khóa học
    const sections = await Section.find({ course_id: courseId }).sort({ position: 1 }).lean();
    const allLessons = [];
    for (const section of sections) {
      const lessons = await Lesson.find({ _id: { $in: section.lessons } })
        .sort({ position: 1 })
        .lean();
      allLessons.push(...lessons);
    }

    // Lấy tất cả lessonId đã được mở khóa (có completed = true hoặc là bài học đầu tiên)
    const unlockedFromProgress = Object.entries(enrollment.progress || {})
      .filter(([_, v]) => v.completed === true)
      .map(([lessonId]) => lessonId);

    // Thêm bài học đầu tiên nếu chưa có
    const firstLessonId = allLessons.length > 0 ? String(allLessons[0]._id) : null;

    // Thêm bài học tiếp theo của những bài học đã hoàn thành
    const nextLessonsFromCompleted = [];
    for (const [lessonId, progress] of Object.entries(enrollment.progress || {})) {
      if (progress.completed === true) {
        // Tìm bài học tiếp theo
        for (let s = 0; s < sections.length; s++) {
          const lessons = sections[s].lessons;
          const lessonDocs = await Lesson.find({ _id: { $in: lessons } })
            .sort({ position: 1 })
            .lean();
          for (let l = 0; l < lessonDocs.length; l++) {
            if (String(lessonDocs[l]._id) === String(lessonId)) {
              if (l + 1 < lessonDocs.length) {
                nextLessonsFromCompleted.push(String(lessonDocs[l + 1]._id));
              } else if (s + 1 < sections.length) {
                const nextSectionLessons = await Lesson.find({
                  _id: { $in: sections[s + 1].lessons },
                })
                  .sort({ position: 1 })
                  .lean();
                if (nextSectionLessons.length > 0) {
                  nextLessonsFromCompleted.push(String(nextSectionLessons[0]._id));
                }
              }
              break;
            }
          }
        }
      }
    }

    const unlocked = [
      ...new Set(
        [...unlockedFromProgress, ...nextLessonsFromCompleted, firstLessonId].filter(Boolean),
      ),
    ];

    res.json({ success: true, data: unlocked });
  } catch (err) {
    next(err);
  }
};

// Lấy thời gian xem video cuối cùng của một bài học
exports.getVideoProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne(
      { course: courseId, student: userId },
      { progress: { $ifNull: ['$progress', {}] } }, // Chỉ lấy trường progress, nếu null thì trả về {}
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
    const { currentTime, videoDuration } = req.body;

    if (typeof currentTime !== 'number') {
      throw new ApiError(400, 'Dữ liệu currentTime không hợp lệ');
    }

    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');

    // Sử dụng $set để cập nhật hoặc tạo mới trường trong object progress
    const updateDate = new Date();
    const update = {
      $set: {
        [`progress.${lessonId}.watchedSeconds`]: currentTime,
        [`progress.${lessonId}.lastWatchedAt`]: updateDate,
      },
    };

    // Thêm videoDuration nếu có
    if (typeof videoDuration === 'number') {
      update.$set[`progress.${lessonId}.videoDuration`] = videoDuration;
    }

    await enrollment.updateOne(update);
    res.json({ success: true, data: enrollment.progress[lessonId] });
  } catch (err) {
    next(err);
  }
};

// Đánh dấu hoàn thành toàn bộ khóa học
exports.markCourseCompleted = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    if (!enrollment) throw new ApiError(404, 'Bạn chưa đăng ký khóa học này');
    if (enrollment.completed) {
      return res.json({
        success: true,
        completed: true,
        message: 'Khóa học đã được đánh dấu hoàn thành trước đó.',
      });
    }
    enrollment.completed = true;
    await enrollment.save();
    res.json({ success: true, completed: true });
  } catch (err) {
    next(err);
  }
};
