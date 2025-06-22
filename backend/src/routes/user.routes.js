const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const { uploadAvatar, processAvatarUpload, deleteOldAvatar, uploadInstructorFiles, processInstructorFilesUpload } = require('../middlewares/upload');
const {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateInstructorApproval,
  getPendingInstructors,
  getPendingInstructorDetail,
  submitInstructorProfile,
  getMyInstructorProfile,
  updateInstructorProfile,
  registerInstructor,
  verifyInstructorEmail,
} = require('../controllers/user.controller');

// Đăng ký giảng viên mới (không cần đăng nhập) - Đặt trước middleware auth
router.post('/instructor-register', uploadInstructorFiles, processInstructorFilesUpload, registerInstructor);

// Xác minh email cho instructor (không cần đăng nhập)
router.get('/verify-instructor-email/:token', verifyInstructorEmail);

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
router.put('/me', uploadAvatar, processAvatarUpload, deleteOldAvatar, updateCurrentUser);

// Routes cho sinh viên nộp hồ sơ giảng viên (chỉ cần đăng nhập)
router.post('/instructor-profile/register', uploadInstructorFiles, processInstructorFilesUpload, submitInstructorProfile);
router.get('/instructor-profile/my', getMyInstructorProfile);
router.put('/instructor-profile/update', updateInstructorProfile);

// Lấy danh sách hồ sơ giảng viên chờ duyệt (không cần quyền admin)
router.get('/instructors/pending', getPendingInstructors);
// Lấy thông tin chi tiết hồ sơ giảng viên chờ duyệt (không cần quyền admin)
router.get('/instructors/pending/:id', getPendingInstructorDetail);
// Cập nhật trạng thái hồ sơ giảng viên (không cần quyền admin)
router.put('/instructors/:id/approval', updateInstructorApproval);
// Routes cho admin (cần quyền admin)
router.use(checkRole(['admin']));

// Lấy danh sách tất cả người dùng
router.get('/', getAllUsers);

// Lấy thông tin chi tiết một người dùng theo ID
router.get('/:id', getUserById);

// Tạo người dùng mới (với upload avatar)
router.post('/', uploadAvatar, processAvatarUpload, createUser);

// Cập nhật thông tin người dùng theo ID
router.put('/:id', updateUser);

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