const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');

// Tạo ghi chú mới
exports.createNote = async (req, res, next) => {
  try {
    const { content, timestamp, lessonId, courseId } = req.body;
    const userId = req.user._id;

    if (!content || timestamp === undefined || !lessonId || !courseId) {
      throw new ApiError(400, 'Thiếu thông tin cần thiết');
    }

    const note = await Note.create({
      content,
      timestamp,
      lesson: lessonId,
      course: courseId,
      user: userId,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả ghi chú của user cho một bài học
exports.getNotesByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const notes = await Note.find({ user: userId, lesson: lessonId }).sort({ timestamp: 'asc' });

    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

// Xóa một ghi chú
exports.deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const result = await Note.deleteOne({ _id: noteId, user: userId });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Không tìm thấy ghi chú hoặc bạn không có quyền xóa');
    }

    res.json({ success: true, message: 'Đã xóa ghi chú' });
  } catch (error) {
    next(error);
  }
};

// Sửa một ghi chú
exports.updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, 'Nội dung ghi chú không được để trống');
    }

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      throw new ApiError(404, 'Không tìm thấy ghi chú hoặc bạn không có quyền sửa');
    }

    note.content = content;
    await note.save();

    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
}; 