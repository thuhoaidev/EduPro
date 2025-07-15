const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Ngăn không cho 1 user like 1 blog nhiều làn
blogLikeSchema.index({ blog: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('BlogLike', blogLikeSchema);
