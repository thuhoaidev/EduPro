const CourseReview = require('../models/CourseReview');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');

// Thêm hoặc cập nhật review cho khóa học
exports.addOrUpdateReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating phải từ 1 đến 5');
    let review = await CourseReview.findOneAndUpdate(
      { user: userId, course: courseId },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    // Cập nhật rating trung bình và tổng số review cho Course
    const reviews = await CourseReview.find({ course: courseId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
    await Course.findByIdAndUpdate(courseId, { rating: avgRating, totalReviews: reviews.length });
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

// Lấy tất cả review của khóa học
exports.getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const reviews = await CourseReview.find({ course: courseId })
      .populate('user', 'fullname avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};

// Lấy review của user cho một khóa học
exports.getMyReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const review = await CourseReview.findOne({ user: userId, course: courseId });
    if (!review) throw new ApiError(404, 'Bạn chưa đánh giá khóa học này');
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
}; 