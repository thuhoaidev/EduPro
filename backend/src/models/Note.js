const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Number, // Lưu thời gian bằng giây
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Index để tối ưu query
noteSchema.index({ user: 1, lesson: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note; 