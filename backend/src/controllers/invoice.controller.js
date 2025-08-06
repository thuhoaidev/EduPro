const Invoice = require('../models/Invoice');
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const UserWallet = require('../models/UserWallet'); // Added import for UserWallet

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
      issuedBy: adminId,
      invoiceNumber: `INV-${Date.now()}-${withdrawRequestId}`
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
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 20,
        info: {
          Title: `Hóa đơn rút tiền - ${invoice.invoiceNumber}`,
          Author: 'EduPro',
          Subject: 'Hóa đơn rút tiền giảng viên'
        }
      });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Background màu trắng
      doc.rect(0, 0, 595, 842).fill('#ffffff');

      // Modal container (giống như modal trên web)
      const modalX = 50;
      const modalY = 50;
      const modalWidth = 495;
      const modalHeight = 700;
      
      // Background modal với border radius effect
      doc.fillColor('#ffffff');
      doc.rect(modalX, modalY, modalWidth, modalHeight).fill();
      
      // Border modal
      doc.strokeColor('#e5e7eb');
      doc.lineWidth(1);
      doc.rect(modalX, modalY, modalWidth, modalHeight).stroke();

      // Header modal với close button (X)
      doc.fillColor('#f9fafb');
      doc.rect(modalX, modalY, modalWidth, 60).fill();
      
      // Close button (X)
      doc.fillColor('#6b7280');
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('×', modalX + modalWidth - 30, modalY + 20);

      // Avatar section (giống hệt như trong ảnh)
      const avatarX = modalX + 50;
      const avatarY = modalY + 80;
      
      // Avatar circle với ảnh người thật (placeholder)
      doc.save();
      doc.circle(avatarX + 25, avatarY + 25, 25);
      doc.fill('#e5e7eb'); // Màu xám nhạt cho placeholder
      doc.restore();
      
      // Thêm icon người trong avatar
      doc.fillColor('#9ca3af');
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('👤', avatarX + 15, avatarY + 15);

      // Thông tin giảng viên (giống hệt như trong ảnh)
      doc.fillColor('#1e40af'); // Màu xanh đậm như trong ảnh
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text(withdrawRequest.teacherId.fullname, avatarX + 70, avatarY + 10);
      
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(withdrawRequest.teacherId.email, avatarX + 70, avatarY + 35);

      // Bảng thông tin chi tiết (giống hệt như trong ảnh)
      const tableY = avatarY + 80;
      const rowHeight = 40;
      const labelX = modalX + 50;
      const valueX = modalX + 200;
      
      // Dữ liệu bảng (giống hệt như trong ảnh)
      const data = [
        { label: 'Mã hóa đơn', value: withdrawRequest._id },
        { label: 'Số tiền', value: `${Number(withdrawRequest.amount).toLocaleString('vi-VN')} ₫`, color: '#22c55e' },
        { label: 'Ngân hàng', value: withdrawRequest.bank },
        { label: 'Số tài khoản', value: withdrawRequest.account },
        { label: 'Chủ tài khoản', value: withdrawRequest.holder },
        { label: 'Ngày xuất', value: `${new Date(invoice.issuedAt).toLocaleTimeString('vi-VN')} ${new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}` },
        { label: 'Trạng thái', value: 'Đã duyệt', color: '#22c55e' }
      ];

      data.forEach((row, index) => {
        const y = tableY + index * rowHeight;
        
        // Label (màu xanh như trong ảnh)
        doc.fillColor('#1e40af');
        doc.font('Helvetica-Bold');
        doc.fontSize(12);
        doc.text(row.label, labelX, y + 10);
        
        // Value
        doc.fillColor(row.color || '#1f2937');
        doc.font('Helvetica');
        doc.fontSize(12);
        doc.text(row.value, valueX, y + 10);
      });

      // Footer với buttons (giống như trong ảnh)
      const buttonY = modalY + modalHeight - 80;
      
      // Button "Tải hóa đơn PDF" (màu xanh)
      doc.fillColor('#2563eb');
      doc.rect(modalX + 50, buttonY, 180, 40).fill();
      
      doc.fillColor('white');
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Tải hóa đơn PDF', modalX + 70, buttonY + 12);
      
      // Button "Đóng" (màu trắng với border)
      doc.strokeColor('#d1d5db');
      doc.lineWidth(1);
      doc.rect(modalX + 250, buttonY, 80, 40).stroke();
      
      doc.fillColor('#374151');
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Đóng', modalX + 275, buttonY + 12);

      // Thêm watermark nhẹ
      doc.save();
      doc.translate(300, 400);
      doc.rotate(-45);
      doc.fontSize(40);
      doc.fillColor('#f3f4f6');
      doc.text('EDUPRO', 0, 0);
      doc.restore();

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

// Tạo hóa đơn cho giao dịch ví (nạp/rút tiền)
exports.createWalletInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;
    
    // Tìm giao dịch ví
    const transaction = await UserWallet.findOne({ 
      _id: transactionId, 
      userId: userId 
    }).populate('userId', 'fullname email');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }
    
    // Tạo tên file hóa đơn
    const fileName = `wallet-${transactionId}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../invoices', fileName);
    
    // Tạo PDF hóa đơn
    await generateWalletInvoicePDF(transaction, filePath);
    
    res.json({ 
      success: true, 
      message: 'Tạo hóa đơn thành công',
      data: {
        fileName,
        downloadUrl: `/api/invoices/download/${fileName}`
      }
    });
  } catch (error) {
    console.error('Create wallet invoice error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo hóa đơn', error: error.message });
  }
};

// Tạo PDF hóa đơn cho giao dịch ví
async function generateWalletInvoicePDF(transaction, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('HÓA ĐƠN GIAO DỊCH VÍ', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Mã giao dịch: ${transaction._id}`, { align: 'center' });
      
      doc.moveDown(0.5);
      doc.text(`Ngày giao dịch: ${new Date(transaction.createdAt).toLocaleDateString('vi-VN')}`, { align: 'center' });

      doc.moveDown(2);

      // Thông tin khách hàng
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('THÔNG TIN KHÁCH HÀNG');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Họ và tên: ${transaction.userId?.fullname || 'Khách hàng'}`);
      doc.text(`Email: ${transaction.userId?.email || 'N/A'}`);

      doc.moveDown(1);

      // Thông tin giao dịch
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CHI TIẾT GIAO DỊCH');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Loại giao dịch: ${transaction.type === 'deposit' ? 'Nạp tiền' : transaction.type === 'withdraw' ? 'Rút tiền' : 'Khác'}`);
      doc.text(`Số tiền: ${Number(transaction.amount).toLocaleString('vi-VN')} VNĐ`);
      doc.text(`Phương thức: ${transaction.method || 'N/A'}`);
      doc.text(`Trạng thái: ${transaction.status === 'completed' ? 'Thành công' : transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}`);
      
      if (transaction.note) {
        doc.text(`Ghi chú: ${transaction.note}`);
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