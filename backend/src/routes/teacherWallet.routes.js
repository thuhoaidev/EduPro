const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const TeacherWalletController = require('../controllers/teacherWallet.controller');

// Tất cả routes đều yêu cầu xác thực
router.use(auth);

// Giáo viên gửi yêu cầu rút tiền
router.post('/withdraw', checkRole(['teacher', 'admin']), TeacherWalletController.requestWithdraw);

// Admin duyệt yêu cầu rút tiền
router.post('/withdraw/:id/approve', checkRole(['admin']), TeacherWalletController.approveWithdraw);

// Giáo viên lấy số dư và lịch sử ví
router.get('/wallet', checkRole(['teacher', 'admin', 'user', 'instructor']), TeacherWalletController.getWallet);

// Admin xem danh sách yêu cầu rút tiền
router.get('/withdraw-requests', checkRole(['admin']), TeacherWalletController.getWithdrawRequests);

module.exports = router; 