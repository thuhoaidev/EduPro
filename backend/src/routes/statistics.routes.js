const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin hoặc moderator
router.use(auth);
router.use(checkRole(['admin', 'moderator']));

// Lấy thống kê tổng quan
router.get('/overview', statisticsController.getOverviewStatistics);

// Lấy dữ liệu doanh thu theo thời gian
router.get('/revenue', statisticsController.getRevenueData);

// Lấy thống kê khóa học
router.get('/courses', statisticsController.getCourseStatistics);

// Lấy thống kê đơn hàng
router.get('/orders', statisticsController.getOrderStatistics);

// Lấy thống kê học viên
router.get('/students', statisticsController.getStudentStatistics);

// Lấy thống kê giảng viên
router.get('/instructors', statisticsController.getInstructorStatistics);

// Lấy thống kê theo danh mục
router.get('/categories', statisticsController.getCategoryStatistics);

// Lấy thống kê theo tháng
router.get('/monthly', statisticsController.getMonthlyStatistics);

module.exports = router; 