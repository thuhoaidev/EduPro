const LessonComment = require('../models/LessonComment');
const ApiError = require('../utils/ApiError');

// Thêm bình luận mới cho bài học
exports.addComment = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    if (!content || !content.trim()) throw new ApiError(400, 'Nội dung bình luận không được để trống');
    const comment = await LessonComment.create({ lesson: lessonId, user: userId, content });
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

// Lấy danh sách bình luận của bài học
exports.getComments = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const comments = await LessonComment.find({ lesson: lessonId, parent: null })
      .populate('user', 'fullname avatar')
      .populate({ path: 'replies', populate: { path: 'user', select: 'fullname avatar' } })
      .sort({ createdAt: -1 });
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
    const reply = await LessonComment.create({ lesson: parentComment.lesson, user: userId, content, parent: commentId });
    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
}; 