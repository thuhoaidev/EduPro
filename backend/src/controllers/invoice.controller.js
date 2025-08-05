const Invoice = require('../models/Invoice');
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');
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
    
    // Tìm hóa đơn theo fileName và user
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