const LessonComment = require('../models/LessonComment');
const ApiError = require('../utils/ApiError');
const leoProfanity = require('leo-profanity');
leoProfanity.add(['địt', 'cứt', 'đỵt', 'bòi', 'đít', 'cặc', 'lồn', 'đụ', 'đéo', 'dcm', 'dm', 'dmm', 'vãi', 'rape']);
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const Section = require('../models/Section');

// Thêm bình luận mới cho bài học
exports.addComment = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    if (!content || !content.trim()) throw new ApiError(400, 'Nội dung bình luận không được để trống');
    if (leoProfanity.check(content)) throw new ApiError(400, 'Bình luận chứa ngôn từ không phù hợp!');
    const comment = await LessonComment.create({ lesson: lessonId, user: userId, content });
    // Gửi thông báo cho giảng viên/chủ khóa học
    const section = await Section.findOne({ lessons: lessonId });
    if (section) {
      const course = await Course.findById(section.course_id).populate('instructor');
      if (course && course.instructor && course.instructor.user) {
        const notification = await Notification.create({
          title: 'Bình luận mới vào bài học',
          content: `Bài học trong khóa "${course.title}" vừa có bình luận mới!`,
          type: 'info',
          receiver: course.instructor.user,
          icon: 'message-circle',
          meta: { link: `/courses/${course._id}/lessons/${lessonId}` }
        });
        const io = req.app.get && req.app.get('io');
        if (io && notification.receiver) {
          io.to(notification.receiver.toString()).emit('new-notification', notification);
        }
      }
    }
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

// Lấy danh sách bình luận của bài học
exports.getComments = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    // Lấy comment cha và populate replies nhiều cấp
    let comments = await LessonComment.find({ lesson: lessonId, parent: null })
      .populate('user', 'fullname avatar')
      .populate({ path: 'replies', populate: { path: 'user', select: 'fullname avatar' } })
      .sort({ createdAt: -1 })
      .lean();
    // Populate replies lồng nhau (nếu có)
    const populateReplies = async (commentArr) => {
      for (let c of commentArr) {
        if (c.replies && c.replies.length) {
          c.replies = await LessonComment.populate(c.replies, [
            { path: 'user', select: 'fullname avatar' },
            { path: 'replies', populate: { path: 'user', select: 'fullname avatar' } }
          ]);
          await populateReplies(c.replies);
        }
      }
    };
    await populateReplies(comments);
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
};

// Trả lời bình luận
exports.replyComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    const parentComment = await LessonComment.findById(commentId);
    if (!parentComment) throw new ApiError(404, 'Không tìm thấy bình luận gốc');
    if (!content || !content.trim()) throw new ApiError(400, 'Nội dung trả lời không được để trống');
    if (leoProfanity.check(content)) throw new ApiError(400, 'Bình luận chứa ngôn từ không phù hợp!');
    const reply = await LessonComment.create({ lesson: parentComment.lesson, user: userId, content, parent: commentId });
    // Gửi thông báo cho người đã bình luận trước đó (nếu không phải chính mình)
    if (parentComment.user && parentComment.user.toString() !== userId.toString()) {
      const notification = await Notification.create({
        title: 'Có trả lời bình luận của bạn',
        content: 'Bình luận của bạn vừa nhận được một phản hồi mới!',
        type: 'info',
        receiver: parentComment.user,
        icon: 'corner-down-right',
        meta: { link: `/lessons/${parentComment.lesson}/video?commentId=${commentId}` }
      });
      const io = req.app.get && req.app.get('io');
      if (io && notification.receiver) {
        io.to(notification.receiver.toString()).emit('new-notification', notification);
      }
    }
    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
};

// Toggle like cho bình luận bài học
exports.toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const comment = await LessonComment.findById(commentId);
    if (!comment) throw new ApiError(404, 'Không tìm thấy bình luận');
    const liked = comment.likes && comment.likes.some(id => id.toString() === userId.toString());
    if (liked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes = [...(comment.likes || []), userId];
    }
    await comment.save();
    res.json({ success: true, liked: !liked, count: comment.likes.length });
  } catch (err) { next(err); }
}; 