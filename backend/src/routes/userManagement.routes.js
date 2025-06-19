const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const { ROLES } = require('../models/Role');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getInstructors,
  getInstructorProfile,
  updateInstructorProfile,
  updateInstructorApproval
} = require('../controllers/userManagement.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes liên quan đến giảng viên
router.route('/instructors')
  .get(getInstructors); // Lấy danh sách giảng viên và hồ sơ chờ duyệt

router.route('/instructors/:id')
  .get(getInstructorProfile) // Lấy chi tiết hồ sơ giảng viên
  .put(updateInstructorProfile); // Cập nhật hồ sơ giảng viên

  // router.get('/instructors/me', auth, getCurrentInstructor);
// Cập nhật trạng thái hồ sơ giảng viên
router.put('/instructors/:id/approval', updateInstructorApproval);

// Lấy danh sách người dùng (có phân trang và tìm kiếm)
router.get('/', getAllUsers);

// Lấy thông tin chi tiết một người dùng
router.get('/:id', getUserById);

// Tạo người dùng mới
router.post('/', createUser);

// Cập nhật thông tin người dùng
router.put('/:id', updateUser);

// Xóa người dùng
router.delete('/:id', deleteUser);

module.exports = router;