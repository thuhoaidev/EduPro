const mongoose = require('mongoose');

const lessonCommentSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonComment', default: null }, // for replies
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

lessonCommentSchema.virtual('replies', {
  ref: 'LessonComment',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

module.exports = mongoose.model('LessonComment', lessonCommentSchema); 