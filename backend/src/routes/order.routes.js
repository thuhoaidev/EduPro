const express = require('express');
const router = express.Router();
const { auth, checkRole, checkPermission } = require('../middlewares/auth');
const OrderController = require('../controllers/order.controller');

// Callback thanh toán Momo cho đơn hàng (không cần auth vì Momo gọi từ bên ngoài)
router.post('/momo-callback', OrderController.handleMomoOrderCallback);
router.get('/momo-callback', OrderController.handleMomoOrderCallback);

// Tất cả routes khác đều yêu cầu xác thực
router.use(auth);

// [POST] /api/orders - Tạo đơn hàng mới
router.post('/', OrderController.createOrder);

// [GET] /api/orders - Lấy danh sách đơn hàng của user
router.get('/', auth, checkPermission('xem đơn hàng của mình'), OrderController.getUserOrders);

// [GET] /api/orders/all - Lấy tất cả đơn hàng (chỉ admin)
router.get('/all', checkRole(['admin']), OrderController.getOrders);

// [GET] /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', OrderController.getOrderDetail);

// [PUT] /api/orders/:id/cancel - Hủy đơn hàng
router.put('/:id/cancel', checkPermission('hủy đơn hàng của mình'), OrderController.cancelOrder);

// [POST] /api/orders/:id/complete-payment - Hoàn thành thanh toán (admin)
router.post('/:id/complete-payment', OrderController.completePayment);

// [POST] /api/orders/:id/refund - Hoàn thành thanh toán (admin)
router.post('/:id/refund', auth, OrderController.refundOrder);

module.exports = router; 