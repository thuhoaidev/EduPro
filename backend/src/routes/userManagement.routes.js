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
} = require('../controllers/userManagement.controller');

// Tất cả các routes đều yêu cầu xác thực và quyền admin
router.use(auth);
router.use(checkRole(ROLES.ADMIN));

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