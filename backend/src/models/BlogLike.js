const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

blogLikeSchema.index({ blog: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('BlogLike', blogLikeSchema); 