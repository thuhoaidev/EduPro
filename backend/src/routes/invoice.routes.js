const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { auth } = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// Admin lấy tất cả hóa đơn
router.get('/', auth, checkRole(['admin']), invoiceController.getAllInvoices);

// Lấy hóa đơn của giảng viên
router.get('/my/invoices', auth, invoiceController.getMyInvoices);

// Tải file PDF hóa đơn
router.get('/download/:fileName', auth, invoiceController.downloadInvoice);

// Lấy hóa đơn theo ID (admin và giảng viên sở hữu) - phải để cuối cùng
router.get('/:id', auth, invoiceController.getInvoiceById);

// Gửi hóa đơn về email cho giảng viên
router.post('/send-email/:id', auth, invoiceController.sendInvoiceEmail);

module.exports = router; 