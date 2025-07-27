const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(auth);
router.use(checkRole(['admin']));

// Lấy thống kê tổng quan
router.get('/overview', statisticsController.getOverviewStatistics);

// Lấy dữ liệu doanh thu theo thời gian
router.get('/revenue', statisticsController.getRevenueData);

// Lấy top khóa học bán chạy
router.get('/top-courses', statisticsController.getTopCourses);

// Lấy thống kê theo danh mục
router.get('/categories', statisticsController.getCategoryStatistics);

// Lấy thống kê theo tháng
router.get('/monthly', statisticsController.getMonthlyStatistics);

module.exports = router; 