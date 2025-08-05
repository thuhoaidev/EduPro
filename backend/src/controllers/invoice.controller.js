const Invoice = require('../models/Invoice');
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');

// Tạo hóa đơn khi admin duyệt rút tiền
exports.createInvoice = async (withdrawRequestId, adminId) => {
  try {
    const withdrawRequest = await WithdrawRequest.findById(withdrawRequestId)
      .populate('teacherId', 'fullname email');
    
    if (!withdrawRequest) {
      throw new Error('Không tìm thấy yêu cầu rút tiền');
    }

    // Tạo hóa đơn mới
    const invoice = new Invoice({
      withdrawRequestId: withdrawRequestId,
      teacherId: withdrawRequest.teacherId._id,
      amount: withdrawRequest.amount,
      bank: withdrawRequest.bank,
      account: withdrawRequest.account,
      holder: withdrawRequest.holder,
      issuedBy: adminId
    });

    await invoice.save();

    // Tạo file PDF hóa đơn
    const fileName = `withdrawal-${withdrawRequestId}.pdf`;
    const filePath = path.join(__dirname, '../../invoices', fileName);
    
    await generateInvoicePDF(invoice, withdrawRequest, filePath);
    
    // Cập nhật đường dẫn file
    invoice.file = fileName;
    await invoice.save();

    return invoice;
  } catch (error) {
    console.error('Lỗi tạo hóa đơn:', error);
    throw error;
  }
};

// Tạo PDF hóa đơn
async function generateInvoicePDF(invoice, withdrawRequest, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('HÓA ĐƠN RÚT TIỀN', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Số hóa đơn: ${invoice.invoiceNumber}`, { align: 'center' });
      
      doc.moveDown(0.5);
      doc.text(`Ngày xuất: ${new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}`, { align: 'center' });

      doc.moveDown(2);

      // Thông tin giảng viên
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('THÔNG TIN GIẢNG VIÊN');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Họ và tên: ${withdrawRequest.teacherId.fullname}`);
      doc.text(`Email: ${withdrawRequest.teacherId.email}`);

      doc.moveDown(1);

      // Thông tin rút tiền
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('THÔNG TIN RÚT TIỀN');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Số tiền: ${Number(withdrawRequest.amount).toLocaleString('vi-VN')} VNĐ`);
      doc.text(`Ngân hàng: ${withdrawRequest.bank}`);
      doc.text(`Số tài khoản: ${withdrawRequest.account}`);
      doc.text(`Chủ tài khoản: ${withdrawRequest.holder}`);

      doc.moveDown(1);

      // Thông tin yêu cầu
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('THÔNG TIN YÊU CẦU');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Mã yêu cầu: ${withdrawRequest._id}`);
      doc.text(`Ngày yêu cầu: ${new Date(withdrawRequest.createdAt).toLocaleDateString('vi-VN')}`);
      doc.text(`Ngày duyệt: ${new Date(withdrawRequest.approvedAt).toLocaleDateString('vi-VN')}`);

      doc.moveDown(2);

      // Chữ ký
      doc.fontSize(12)
         .font('Helvetica')
         .text('Chữ ký người duyệt:', 50, doc.y);
      
      doc.moveDown(3);
      doc.text('_________________', 50, doc.y);
      doc.text('(Admin)', 50, doc.y + 15);

      doc.moveDown(1);
      doc.text('Chữ ký giảng viên:', 350, doc.y - 60);
      doc.moveDown(2);
      doc.text('_________________', 350, doc.y);
      doc.text('(Giảng viên)', 350, doc.y + 15);

      // Footer
      doc.moveDown(2);
      doc.fontSize(10)
         .font('Helvetica')
         .text('Hóa đơn này được tạo tự động bởi hệ thống EduPro', { align: 'center' });

      writeStream.on('finish', () => {
        console.log('Invoice PDF created successfully:', filePath);
        resolve();
      });

      writeStream.on('error', (error) => {
        console.error('Invoice PDF write stream error:', error);
        reject(error);
      });

      doc.on('error', (error) => {
        console.error('Invoice PDF document error:', error);
        reject(error);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Lấy hóa đơn theo ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('teacherId', 'fullname email')
      .populate('withdrawRequestId')
      .populate('issuedBy', 'fullname');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy hóa đơn', error: error.message });
  }
};

// Lấy hóa đơn của giảng viên
exports.getMyInvoices = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const invoices = await Invoice.find({ teacherId })
      .populate('withdrawRequestId')
      .sort({ issuedAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hóa đơn', error: error.message });
  }
};

// Tải file PDF hóa đơn
exports.downloadInvoice = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Kiểm tra xem có phải hóa đơn thanh toán không
    if (fileName.startsWith('payment-')) {
      // Đây là hóa đơn thanh toán, kiểm tra quyền truy cập
      const filePath = path.join(__dirname, '../../invoices', fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File hóa đơn không tồn tại.' });
      }
      
      // Set header để browser có thể hiển thị PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Gửi file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Send invoice file error:', err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Lỗi khi gửi file hóa đơn.' });
          }
        }
      });
      return;
    }
    
    // Tìm hóa đơn theo fileName và user (cho hóa đơn rút tiền)
    const invoice = await Invoice.findOne({ file: fileName, teacherId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn hoặc bạn không có quyền truy cập.' });
    }
    
    const filePath = path.join(__dirname, '../../invoices', fileName);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File hóa đơn không tồn tại.' });
    }
    
    // Set header để browser có thể hiển thị PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Gửi file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Send invoice file error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Lỗi khi gửi file hóa đơn.' });
        }
      }
    });
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải hóa đơn', error: error.message });
  }
};

// Admin lấy tất cả hóa đơn
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('teacherId', 'fullname email')
      .populate('withdrawRequestId')
      .populate('issuedBy', 'fullname')
      .sort({ issuedAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hóa đơn', error: error.message });
  }
}; 

// Gửi hóa đơn về email cho giảng viên
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('teacherId', 'fullname email')
      .populate('withdrawRequestId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
    }
    const email = invoice.teacherId.email;
    const fullname = invoice.teacherId.fullname;
    const fileName = invoice.file;
    const filePath = require('path').join(__dirname, '../../invoices', fileName);
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File hóa đơn không tồn tại.' });
    }
    // Gửi email với file đính kèm
    await sendEmail({
      to: email,
      subject: `Hóa đơn rút tiền #${invoice.invoiceNumber}`,
      html: `<p>Xin chào ${fullname},</p><p>Đính kèm là hóa đơn rút tiền của bạn.</p>`,
      attachments: [
        {
          filename: fileName,
          path: filePath
        }
      ]
    });
    res.json({ success: true, message: 'Đã gửi hóa đơn về email!' });
  } catch (error) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi email hóa đơn', error: error.message });
  }
};

// Tạo hóa đơn cho giao dịch thanh toán
exports.createPaymentInvoice = async (req, res) => {
  try {
    const { orderId, txId } = req.params;
    const userId = req.user._id;
    
    // Tìm đơn hàng
    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.courseId', 'title thumbnail price')
      .populate('items.courseId.instructor', 'fullname');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    // Tạo tên file hóa đơn
    const fileName = `payment-${orderId}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../invoices', fileName);
    
    // Tạo PDF hóa đơn
    await generatePaymentInvoicePDF(order, txId, filePath);
    
    res.json({ 
      success: true, 
      message: 'Tạo hóa đơn thành công',
      data: {
        fileName,
        downloadUrl: `/api/invoices/download/${fileName}`
      }
    });
  } catch (error) {
    console.error('Create payment invoice error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo hóa đơn', error: error.message });
  }
};

// Tạo PDF hóa đơn cho giao dịch thanh toán
async function generatePaymentInvoicePDF(order, txId, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Mã giao dịch: ${txId}`, { align: 'center' });
      
      doc.moveDown(0.5);
      doc.text(`Ngày giao dịch: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`, { align: 'center' });

      doc.moveDown(2);

      // Thông tin khách hàng
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('THÔNG TIN KHÁCH HÀNG');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Họ và tên: ${order.fullName}`);
      doc.text(`Email: ${order.email}`);
      doc.text(`Số điện thoại: ${order.phone}`);

      doc.moveDown(1);

      // Thông tin đơn hàng
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CHI TIẾT ĐƠN HÀNG');
      
      doc.moveDown(0.5);
      
      // Bảng sản phẩm
      let yPosition = doc.y;
      doc.fontSize(10);
      
      // Header bảng
      doc.font('Helvetica-Bold')
         .text('STT', 50, yPosition)
         .text('Khóa học', 100, yPosition)
         .text('Giảng viên', 300, yPosition)
         .text('Giá', 450, yPosition);
      
      yPosition += 20;
      
      // Nội dung bảng
      order.items.forEach((item, index) => {
        doc.font('Helvetica')
           .text(`${index + 1}`, 50, yPosition)
           .text(item.courseId.title.substring(0, 30) + '...', 100, yPosition)
           .text(item.courseId.instructor?.fullname || 'EduPro', 300, yPosition)
           .text(`${item.price.toLocaleString()}₫`, 450, yPosition);
        
        yPosition += 15;
      });
      
      doc.moveDown(1);
      
      // Tổng tiền
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Tổng tiền: ${order.finalAmount.toLocaleString()}₫`, { align: 'right' });
      
      if (order.discountAmount > 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Giảm giá: ${order.discountAmount.toLocaleString()}₫`, { align: 'right' });
      }

      doc.moveDown(1);
      
      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .text('Cảm ơn bạn đã sử dụng dịch vụ của EduPro!', { align: 'center' });

      doc.end();
      
      writeStream.on('finish', () => {
        resolve();
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
} 