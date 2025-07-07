const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogComment',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual populate replies
blogCommentSchema.virtual('replies', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'parent',
});

module.exports = mongoose.model('BlogComment', blogCommentSchema); 