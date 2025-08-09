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

// Tạo hóa đơn cho giao dịch thanh toán
router.post('/payment/:orderId/:txId', auth, invoiceController.createPaymentInvoice);

// Tạo hóa đơn cho giao dịch ví (nạp/rút tiền)
router.post('/wallet/:transactionId', auth, invoiceController.createWalletInvoice);

// Tạo hóa đơn cho withdraw request (giảng viên)
router.post('/create/:withdrawRequestId', auth, async (req, res) => {
  try {
    const { withdrawRequestId } = req.params;
    const teacherId = req.user._id;
    
    // Kiểm tra withdraw request có thuộc về giảng viên này không
    const WithdrawRequest = require('../models/WithdrawRequest');
    const withdrawRequest = await WithdrawRequest.findOne({
      _id: withdrawRequestId,
      teacherId: teacherId
    });
    
    if (!withdrawRequest) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu rút tiền' });
    }
    
    // Kiểm tra xem đã có hóa đơn chưa
    const Invoice = require('../models/Invoice');
    const existingInvoice = await Invoice.findOne({ withdrawRequestId });
    
    if (existingInvoice) {
      return res.json({ 
        success: true, 
        message: 'Hóa đơn đã tồn tại',
        invoice: existingInvoice
      });
    }
    
    // Tạo hóa đơn mới
    const invoiceController = require('../controllers/invoice.controller');
    const invoice = await invoiceController.createInvoice(withdrawRequestId, teacherId);
    
    res.json({ 
      success: true, 
      message: 'Tạo hóa đơn thành công',
      invoice: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo hóa đơn', error: error.message });
  }
});

module.exports = router; 