const express = require('express');
const router = express.Router();
const { auth, requireAuth, checkRole } = require('../middlewares/auth');
const {
  approveCourseWithContent,
  getCourseContentStatus,
} = require('../controllers/admin.controller');

// Tất cả các routes đều yêu cầu xác thực và quyền admin
router.use(auth);
router.use(checkRole(['admin']));

// Duyệt khóa học và cập nhật trạng thái lesson/section
router.put('/courses/:courseId/approve-content', approveCourseWithContent);

// Lấy thông tin trạng thái lesson và section của khóa học
router.get('/courses/:courseId/content-status', getCourseContentStatus);

module.exports = router;
