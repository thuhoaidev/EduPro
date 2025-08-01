const CommentLike = require('../models/commentLike.model'); // hoặc tên collection bạn đang dùng

exports.toggleLikeComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.commentId;

  try {
    const existingLike = await CommentLike.findOne({ user: userId, comment: commentId });

    if (existingLike) {
      await CommentLike.deleteOne({ _id: existingLike._id });
      return res.json({ success: true, liked: false });
    }

    await CommentLike.create({ user: userId, comment: commentId });
    res.json({ success: true, liked: true });
  } catch (error) {
    console.error('toggleLikeComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCommentLikeCount = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const count = await CommentLike.countDocuments({ comment: commentId });
    res.json({ success: true, count });
  } catch (error) {
    console.error('getCommentLikeCount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.hasLikedComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.commentId;

  try {
    const existingLike = await CommentLike.findOne({ user: userId, comment: commentId });
    res.json({ success: true, liked: !!existingLike });
  } catch (error) {
    console.error('hasLikedComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

