const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect, checkRole } = require('../middlewares/auth');

// Lấy danh sách vai trò - ai cũng có thể xem
router.get('/', roleController.getRoles);

// Các route yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(checkRole('admin'));

// Tạo vai trò mới
router.post('/', roleController.createRole);

// Cập nhật vai trò
router.put('/:id', roleController.updateRole);

// Xóa vai trò
router.delete('/:id', roleController.deleteRole);

// Gán vai trò cho người dùng
router.patch('/users/:id/role', roleController.assignUserRole);

module.exports = router; 