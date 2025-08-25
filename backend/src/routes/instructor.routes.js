const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
console.log('Instructor controller imported:', instructorController);
console.log('Available functions:', Object.keys(instructorController || {}));
const { auth } = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const ROLES = require('../constants/roles');

// Middleware kiểm tra quyền instructor
const instructorAuth = [auth, checkRole([ROLES.INSTRUCTOR])];

// Test route to check if controller is loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Instructor routes working' });
});

// Lấy thống kê tổng quan cho instructor dashboard
router.get('/dashboard/stats', instructorAuth, instructorController.getInstructorDashboardStats);

// Lấy thống kê chi tiết khóa học
router.get('/dashboard/course/:courseId/analytics', instructorAuth, instructorController.getCourseAnalytics);

// Lấy thống kê thu nhập chi tiết
router.get('/dashboard/earnings', instructorAuth, instructorController.getEarningsAnalytics);

// Lấy danh sách học viên của instructor
router.get('/students', instructorAuth, instructorController.getInstructorStudents);

// Lấy danh sách khóa học của instructor
router.get('/courses', instructorAuth, instructorController.getInstructorCourses);

// Lấy chi tiết học viên
router.get('/students/:studentId', instructorAuth, instructorController.getStudentDetail);
router.get('/analytics', instructorAuth, instructorController.getAnalytics);

module.exports = router;
