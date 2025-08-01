const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
}, { timestamps: true });

module.exports = mongoose.model('CommentLike', commentLikeSchema);
