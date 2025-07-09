const CommentLike = require('../models/CommentLike');

// Toggle like: Nếu đã like thì unlike, chưa like thì like
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params.id;

    const existingLike = await CommentLike.findOne({ user: userId, comment: commentId });

    if (existingLike) {
      await existingLike.deleteOne();
      return res.json({ liked: false, message: 'Đã bỏ thích' });
    } else {
      await CommentLike.create({ user: userId, comment: commentId });
      return res.json({ liked: true, message: 'Đã thích bình luận' });
    }
  } catch (error) {
    console.error('❌ Lỗi khi toggle like comment:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thích/bỏ thích bình luận' });
  }
};

// Kiểm tra người dùng đã like comment chưa
exports.checkLiked = async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params.id;

    const liked = await CommentLike.exists({ user: userId, comment: commentId });
    res.json({ liked: !!liked });
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra like comment:', error);
    res.status(500).json({ message: 'Không thể kiểm tra trạng thái thích' });
  }
};

// Đếm tổng số lượt thích cho comment
exports.countLikes = async (req, res) => {
  try {
    const commentId = req.params.id;

    const count = await CommentLike.countDocuments({ comment: commentId });
    res.json({ count });
  } catch (error) {
    console.error('❌ Lỗi khi đếm like comment:', error);
    res.status(500).json({ message: 'Không thể đếm lượt thích' });
  }
};
