const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createQuizSchema, updateQuizSchema } = require('../validations/quiz.validation');

// Tạo bài quiz mới
exports.createQuiz = async (req, res, next) => {
  try {
    const { lesson_id, title, description, questions, time_limit, passing_score } = req.body;

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Kiểm tra lesson đã có quiz chưa
    const existingQuiz = await Quiz.findOne({ lesson_id });
    if (existingQuiz) {
      throw new ApiError(400, 'Bài học này đã có quiz');
    }

    // Validate dữ liệu
    const validatedData = await validateSchema(createQuizSchema, {
      lesson_id,
      title,
      description,
      questions,
      time_limit,
      passing_score,
    });

    // Kiểm tra đáp án có nằm trong options không
    validatedData.questions.forEach(question => {
      if (!question.options.includes(question.correct_answer)) {
        throw new ApiError(400, 'Đáp án phải nằm trong danh sách lựa chọn');
      }
    });

    // Tạo quiz mới
    const quiz = new Quiz(validatedData);
    await quiz.save();

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
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