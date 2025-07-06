const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected','published'],
    default: 'draft',
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  },
  rejected_reason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals để populate comments, likes
blogSchema.virtual('comments', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'blog'
});

blogSchema.virtual('likes', {
  ref: 'BlogLike',
  localField: '_id',
  foreignField: 'blog'
});

module.exports = mongoose.model('Blog', blogSchema);
