const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const courseReviewController = require('../controllers/courseReview.controller');

router.use(auth);

// Thêm hoặc cập nhật review cho khóa học
router.post('/:courseId/review', courseReviewController.addOrUpdateReview);
// Lấy tất cả review của khóa học
router.get('/:courseId/reviews', courseReviewController.getCourseReviews);
// Lấy review của user cho một khóa học
router.get('/:courseId/my-review', courseReviewController.getMyReview);

module.exports = router; 