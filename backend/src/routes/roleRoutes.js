const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { auth } = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// Lấy danh sách vai trò - Ai cũng có thể xem
router.get('/', roleController.getRoles);

// Tạo vai trò mới (yêu cầu admin)
router.post('/', auth, checkRole('admin'), roleController.createRole);

// Cập nhật vai trò (yêu cầu admin)
router.put('/:id', auth, checkRole('admin'), roleController.updateRole);

// Xóa vai trò (yêu cầu admin)
router.delete('/:id', auth, checkRole('admin'), roleController.deleteRole);

// Gán vai trò cho người dùng (yêu cầu admin)
router.patch('/users/:id/role', auth, checkRole('admin'), roleController.assignRoleToUser);

module.exports = router; 