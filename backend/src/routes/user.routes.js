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
  getApprovedInstructors,
  getApprovedInstructorDetail,
  getInstructorDetail,
  getMyEnrollments,
} = require('../controllers/user.controller');

// Routes cho client (không cần đăng nhập)
// Lấy danh sách giảng viên đã duyệt cho client
router.get('/approved-instructors', getApprovedInstructors);
// Lấy chi tiết giảng viên đã duyệt cho client
router.get('/approved-instructors/:id', getApprovedInstructorDetail);

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

// Thêm route GET /me/enrollments
router.get('/me/enrollments', getMyEnrollments);

// Lấy danh sách hồ sơ giảng viên chờ duyệt (cần đăng nhập)
router.get('/instructors', getInstructors);
// Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt (cần đăng nhập)
router.get('/instructors/:id/detail', getInstructorDetail);
// Cập nhật trạng thái hồ sơ giảng viên (cần đăng nhập)
router.put('/instructors/:id/approval', updateInstructorApproval);

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

// Cập nhật hồ sơ giảng viên (và đồng bộ sang User)
router.put('/instructor-profiles/:id', require('./../controllers/user.controller').updateInstructorProfile);

module.exports = router; 