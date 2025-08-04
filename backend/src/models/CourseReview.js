const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

// Compound index to ensure one review per user per course
courseReviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('CourseReview', courseReviewSchema); 