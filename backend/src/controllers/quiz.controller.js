const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createQuizSchema, updateQuizSchema } = require('../validations/quiz.validation');
const Video = require('../models/Video');

// Tạo bài quiz mới
exports.createQuiz = async (req, res, next) => {
  try {
    const { video_id, questions } = req.body;
    // Kiểm tra video tồn tại
    const video = await Video.findById(video_id);
    if (!video) return res.status(404).json({ success: false, message: 'Không tìm thấy video' });
    // Kiểm tra đã có quiz chưa
    const existing = await Quiz.findOne({ video_id });
    if (existing) return res.status(400).json({ success: false, message: 'Video này đã có quiz' });
    // Tạo quiz
    const quiz = new Quiz({ video_id, questions });
    await quiz.save();
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

// Cập nhật bài quiz
exports.updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, questions, time_limit, passing_score } = req.body;

    // Validate dữ liệu
    const validatedData = await validateSchema(updateQuizSchema, {
      title,
      description,
      questions,
      time_limit,
      passing_score,
    });

    // Nếu có cập nhật questions
    if (validatedData.questions) {
      validatedData.questions.forEach(question => {
        if (!question.options.includes(question.correct_answer)) {
          throw new ApiError(400, 'Đáp án phải nằm trong danh sách lựa chọn');
        }
      });
    }

    // Cập nhật quiz
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );

    if (!quiz) {
      throw new ApiError(404, 'Không tìm thấy bài quiz');
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa bài quiz
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa quiz
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      throw new ApiError(404, 'Không tìm thấy bài quiz');
    }

    res.json({
      success: true,
      message: 'Xóa bài quiz thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy bài quiz theo bài học
exports.getQuizByLesson = async (req, res, next) => {
  try {
    const { lesson_id } = req.params;

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Lấy quiz
    const quiz = await Quiz.findOne({ lesson_id });
    if (!quiz) {
      throw new ApiError(404, 'Không tìm thấy bài quiz');
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy quiz theo video
exports.getQuizByVideo = async (req, res, next) => {
  try {
    const { video_id } = req.params;
    const quiz = await Quiz.findOne({ video_id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

// Nộp đáp án và check đúng/sai
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quiz_id } = req.params;
    const { answers } = req.body;
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ success: false, message: 'Số lượng đáp án không hợp lệ' });
    }
    const wrongQuestions = [];
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== q.correctIndex) wrongQuestions.push(idx);
    });
    if (wrongQuestions.length === 0) {
      return res.json({ success: true, message: 'Tất cả đáp án đều đúng!' });
    } else {
      return res.json({ success: false, message: 'Có đáp án sai.', wrongQuestions });
    }
  } catch (err) { next(err); }
}; 