const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Câu hỏi không được để trống'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Danh sách lựa chọn không được để trống'],
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'Phải có ít nhất 2 lựa chọn',
    },
  },
  correct_answer: {
    type: String,
    required: [true, 'Đáp án không được để trống'],
  },
  explanation: {
    type: String,
    required: [true, 'Giải thích không được để trống'],
  },
});

const quizSchema = new mongoose.Schema(
  {
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Bài học không được để trống'],
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề không được để trống'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: [questionSchema],
    time_limit: {
      type: Number, // Thời gian làm bài (phút)
      default: 15,
    },
    passing_score: {
      type: Number, // Điểm đạt (phần trăm)
      default: 70,
    },
  },
  {
    timestamps: true,
  }
);

// Kiểm tra đáp án có nằm trong options không
quizSchema.pre('save', function(next) {
  this.questions.forEach(question => {
    if (!question.options.includes(question.correct_answer)) {
      next(new Error('Đáp án phải nằm trong danh sách lựa chọn'));
    }
  });
  next();
});

module.exports = mongoose.model('Quiz', quizSchema); 