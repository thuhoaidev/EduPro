const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

courseReviewSchema.index({ user: 1, course: 1 }, { unique: true }); // 1 user chỉ review 1 lần/khóa

module.exports = mongoose.model('CourseReview', courseReviewSchema); 