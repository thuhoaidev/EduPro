const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const { uploadAvatar, processAvatarUpload, deleteOldAvatar } = require('../middlewares/upload');
const { handleUploadError } = require('../middlewares/upload.middleware');
const {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateInstructorApproval,
  getInstructors,
  getInstructorDetail,
} = require('../controllers/user.controller');

// Routes cho người dùng hiện tại (cần đăng nhập)
router.use(auth);

// Test endpoint để kiểm tra role
router.get('/test-role', (req, res) => {
  console.log('Test role endpoint - User info:', {
    id: req.user._id,
    email: req.user.email,
    roles: req.user.roles,
    role_id: req.user.role_id,
    originalRoleId: req.user.role_id,
  });

  res.json({
    success: true,
    message: 'Role test successful',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        roles: req.user.roles,
        role_id: req.user.role_id,
      },
      isAdmin: req.user.roles.includes('admin'),
      isInstructor: req.user.roles.includes('instructor'),
    },
  });
});

// Lấy thông tin người dùng hiện tại
router.get('/me', getCurrentUser);

// Cập nhật thông tin người dùng hiện tại (với upload avatar)
router.put('/me', uploadAvatar, processAvatarUpload, deleteOldAvatar, handleUploadError, updateCurrentUser);

// Lấy danh sách hồ sơ giảng viên chờ duyệt (không cần quyền admin)
router.get('/instructors', getInstructors);
// Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt (không cần quyền admin)
router.get('/instructors/:id/detail', getInstructorDetail);
// Cập nhật trạng thái hồ sơ giảng viên (không cần quyền admin)
router.put('/instructors/:id/approval', updateInstructorApproval);

// Cập nhật hồ sơ giảng viên (và đồng bộ sang User)
router.put('/instructor-profiles/:id', require('./../controllers/user.controller').updateInstructorProfile);

// Routes cho admin (cần quyền admin)
router.use(checkRole(['admin']));

// Lấy danh sách tất cả người dùng
router.get('/', getAllUsers);

// Lấy thông tin chi tiết một người dùng theo ID
router.get('/:id', getUserById);

// Tạo người dùng mới (với upload avatar)
router.post('/', uploadAvatar, processAvatarUpload, handleUploadError, createUser);

// Cập nhật thông tin người dùng theo ID (với upload avatar)
router.put('/:id', uploadAvatar, processAvatarUpload, deleteOldAvatar, handleUploadError, updateUser);

// Xóa người dùng theo ID
router.delete('/:id', deleteUser);

// Thêm route upload avatar cho user
router.post('/upload-avatar', auth, uploadAvatar, processAvatarUpload, (req, res) => {
  if (!req.uploadedAvatar) {
    return res.status(400).json({ success: false, message: 'Không có file ảnh được upload' });
  }
  res.json({ success: true, data: { url: req.uploadedAvatar.url } });
});

module.exports = router; 