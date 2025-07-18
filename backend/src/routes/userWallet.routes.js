const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const userWalletController = require('../controllers/userWallet.controller');

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

module.exports = router; 