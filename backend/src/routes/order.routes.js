const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const OrderController = require('../controllers/order.controller');

// Tất cả routes đều yêu cầu xác thực
router.use(auth);

// [POST] /api/orders - Tạo đơn hàng mới
router.post('/', OrderController.createOrder);

// [GET] /api/orders - Lấy danh sách đơn hàng của user
router.get('/', OrderController.getUserOrders);

// [GET] /api/orders/all - Lấy tất cả đơn hàng (chỉ admin)
router.get('/all', checkRole(['admin']), OrderController.getOrders);

// [GET] /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', OrderController.getOrderDetail);

// [PUT] /api/orders/:id/cancel - Hủy đơn hàng
router.put('/:id/cancel', OrderController.cancelOrder);

// [POST] /api/orders/:id/complete-payment - Hoàn thành thanh toán (admin)
router.post('/:id/complete-payment', OrderController.completePayment);

module.exports = router; 