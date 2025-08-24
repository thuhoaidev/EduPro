const CourseReview = require('../models/CourseReview');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');

// Thêm hoặc cập nhật review cho khóa học
exports.addOrUpdateReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    
    console.log('Adding/updating review:', { courseId, userId, rating, comment }); // Debug log
    
    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating phải từ 1 đến 5');
    
    let review = await CourseReview.findOneAndUpdate(
      { user: userId, course: courseId },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    console.log('Review saved:', review); // Debug log
    
    // Cập nhật rating trung bình và tổng số review cho Course
    const reviews = await CourseReview.find({ course: courseId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
    
    console.log('Updating course with new rating:', { avgRating, totalReviews: reviews.length }); // Debug log
    
    await Course.findByIdAndUpdate(courseId, { 
      rating: Math.round(avgRating * 10) / 10, 
      totalReviews: reviews.length 
    });
    
    res.status(200).json({ 
      success: true, 
      data: review,
      message: 'Đánh giá đã được lưu thành công'
    });
  } catch (err) { 
    console.error('Error in addOrUpdateReview:', err); // Debug log
    next(err); 
  }
};

// Lấy tất cả review của khóa học
exports.getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    console.log('Getting reviews for course:', courseId); // Debug log
    
    const reviews = await CourseReview.find({ course: courseId })
      .populate('user', 'fullname avatar')
      .sort({ createdAt: -1 });
    
    console.log('Found reviews:', reviews.length); // Debug log
    
    res.json({ success: true, data: reviews });
  } catch (err) { 
    console.error('Error in getCourseReviews:', err); // Debug log
    next(err); 
  }
};

// Lấy review của user cho một khóa học
exports.getMyReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    console.log('Getting my review for course:', { courseId, userId }); // Debug log
    
    const review = await CourseReview.findOne({ user: userId, course: courseId });
    if (!review) throw new ApiError(404, 'Bạn chưa đánh giá khóa học này');
    
    console.log('Found my review:', review); // Debug log
    res.json({ success: true, data: review });
  } catch (err) { 
    console.error('Error in getMyReview:', err); // Debug log
    next(err); 
  }
};

// Toggle like a review
exports.toggleLikeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await CourseReview.findById(reviewId);
    if (!review) throw new ApiError(404, 'Không tìm thấy đánh giá');
    // Remove from dislikes if exists
    review.dislikes.pull(userId);
    // Toggle in likes
    const isLiked = review.likes.some(id => id.equals(userId));
    if (isLiked) {
      review.likes.pull(userId);
    } else {
      review.likes.push(userId);
    }
    await review.save();
    res.json({ success: true, data: { likes: review.likes.length, dislikes: review.dislikes.length } });
  } catch (err) { next(err); }
};

// Toggle dislike a review
exports.toggleDislikeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await CourseReview.findById(reviewId);
    if (!review) throw new ApiError(404, 'Không tìm thấy đánh giá');
    // Remove from likes if exists
    review.likes.pull(userId);
    // Toggle in dislikes
    const isDisliked = review.dislikes.some(id => id.equals(userId));
    if (isDisliked) {
      review.dislikes.pull(userId);
    } else {
      review.dislikes.push(userId);
    }
    await review.save();
    res.json({ success: true, data: { likes: review.likes.length, dislikes: review.dislikes.length } });
  } catch (err) { next(err); }
};

// Report a review
exports.reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    if (!reason) throw new ApiError(400, 'Cần có lý do báo cáo');
    const review = await CourseReview.findById(reviewId);
    if (!review) throw new ApiError(404, 'Không tìm thấy đánh giá');
    // Check if user has already reported
    if (review.reports.some(r => r.user.toString() === userId.toString())) {
      throw new ApiError(400, 'Bạn đã báo cáo đánh giá này rồi');
    }
    review.reports.push({ user: userId, reason });
    await review.save();
    res.json({ success: true, message: 'Đã gửi báo cáo' });
  } catch (err) { next(err); }
}; 