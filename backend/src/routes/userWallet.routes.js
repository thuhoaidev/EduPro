const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const userWalletController = require('../controllers/userWallet.controller');
const { checkRole } = require('../middlewares/auth');

// Lấy số dư và lịch sử giao dịch
router.get('/', auth, userWalletController.getWallet);
// Tạo yêu cầu nạp tiền
router.post('/deposit', auth, userWalletController.createDeposit);
// Callback/payment result cho Momo
router.post('/momo-callback', userWalletController.handlePaymentResult);
router.get('/momo-callback', userWalletController.handlePaymentResult);
// Callback/payment result cho ZaloPay
router.post('/zalopay-callback', userWalletController.handlePaymentResult);
router.get('/zalopay-callback', userWalletController.handlePaymentResult);
// Callback/payment result cho VNPAY (nếu có)
router.get('/vnpay-callback', userWalletController.handlePaymentResult);
// API endpoint để frontend gửi kết quả thanh toán
router.post('/payment-callback', auth, userWalletController.paymentCallback);
// API để kiểm tra trạng thái giao dịch
router.get('/transaction/:orderId/status', auth, userWalletController.checkTransactionStatus);
// API để kiểm tra trạng thái giao dịch theo transId
router.get('/transaction/transId/:transId/status', auth, userWalletController.checkTransactionByTransId);

// Rút tiền
router.post('/withdraw', auth, userWalletController.requestWithdraw); // user gửi yêu cầu rút tiền
router.get('/withdraw-requests', auth, checkRole(['admin']), userWalletController.getWithdrawRequests); // admin xem tất cả yêu cầu
router.get('/my-withdraw-requests', auth, userWalletController.getMyWithdrawRequests); // user xem lịch sử
router.post('/withdraw/:id/approve', auth, checkRole(['admin']), userWalletController.approveWithdraw); // admin duyệt
router.post('/withdraw/:id/reject', auth, checkRole(['admin']), userWalletController.rejectWithdraw); // admin từ chối
router.delete('/withdraw/:id/cancel', auth, userWalletController.cancelWithdrawRequest); // user hủy

module.exports = router; 