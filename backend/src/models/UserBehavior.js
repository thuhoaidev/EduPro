const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  viewedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    viewCount: { type: Number, default: 1 },
    lastViewed: { type: Date, default: Date.now },
    totalTimeSpent: { type: Number, default: 0 }
  }],
  completedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedAt: { type: Date, default: Date.now }
  }],
  ratedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    rating: { type: Number },
    ratedAt: { type: Date, default: Date.now }
  }],
  commentedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    commentedAt: { type: Date, default: Date.now }
  }],
  bookmarkedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    bookmarkedAt: { type: Date, default: Date.now }
  }],
  sharedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    sharedAt: { type: Date, default: Date.now }
  }],
  purchasedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    price: { type: Number },
    purchasedAt: { type: Date, default: Date.now }
  }],
  totalSpent: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserBehavior', userBehaviorSchema); 