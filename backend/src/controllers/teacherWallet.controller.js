const TeacherWallet = require('../models/TeacherWallet');
const WithdrawRequest = require('../models/WithdrawRequest');

// Giáo viên lấy số dư và lịch sử ví
exports.getWallet = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const wallet = await TeacherWallet.findOne({ teacherId });
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy ví', error: err.message });
  }
};

// Admin xem danh sách yêu cầu rút tiền
exports.getWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find().populate('teacherId', 'fullname email avatar phone');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu rút tiền', error: err.message });
  }
};

// Giáo viên gửi yêu cầu rút tiền
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, bank, account, holder } = req.body;
    const teacherId = req.user._id;
    const wallet = await TeacherWallet.findOne({ teacherId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Số dư không đủ' });
    }
    // Trừ tiền ngay và ghi lịch sử với trạng thái chờ duyệt
    wallet.balance -= amount;
    wallet.history.push({
      type: 'withdraw',
      amount: -amount,
      note: 'Yêu cầu rút tiền - chờ duyệt'
    });
    await wallet.save();
    const request = new WithdrawRequest({
      teacherId, amount, bank, account, holder
    });
    await request.save();
    res.json({ success: true, message: 'Đã gửi yêu cầu rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi gửi yêu cầu rút tiền', error: err.message });
  }
};

// Admin duyệt yêu cầu rút tiền
exports.approveWithdraw = async (req, res) => {
  try {
    const { id } = req.params; // id của request
    const request = await WithdrawRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
    }
    
    // Không cần kiểm tra số dư nữa vì đã trừ khi yêu cầu
    // Chỉ cập nhật trạng thái và lịch sử
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();
    
    // Cập nhật lịch sử ví - thay đổi note từ "chờ duyệt" thành "đã duyệt"
    const wallet = await TeacherWallet.findOne({ teacherId: request.teacherId });
    if (wallet) {
      // Tìm và cập nhật lịch sử rút tiền chờ duyệt
      const pendingHistory = wallet.history.find(h => 
        h.type === 'withdraw' && 
        h.amount === -request.amount && 
        h.note === 'Yêu cầu rút tiền - chờ duyệt'
      );
      
      if (pendingHistory) {
        pendingHistory.note = 'Rút tiền đã được admin duyệt';
      }
      
      await wallet.save();
    }

    // Tạo hóa đơn khi duyệt rút tiền
    try {
      const invoiceController = require('./invoice.controller');
      const invoice = await invoiceController.createInvoice(id, req.user._id);
      
      // Gửi notification cho giảng viên
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Rút tiền thành công',
          content: `Yêu cầu rút tiền ${Number(request.amount).toLocaleString()} VNĐ đã được duyệt. Hóa đơn đã được tạo.`,
          type: 'success',
          receiver: request.teacherId,
          icon: 'check-circle',
          meta: { 
            amount: Number(request.amount), 
            invoiceId: invoice._id,
            link: '/earnings' 
          }
        });
      } catch (notiErr) {
        console.error('Lỗi tạo notification rút tiền:', notiErr);
      }

      res.json({ 
        success: true, 
        message: 'Đã duyệt rút tiền và tạo hóa đơn', 
        request,
        invoice: {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          file: invoice.file
        }
      });
    } catch (invoiceError) {
      console.error('Lỗi tạo hóa đơn:', invoiceError);
      // Vẫn trả về thành công nếu duyệt được nhưng lỗi tạo hóa đơn
      res.json({ 
        success: true, 
        message: 'Đã duyệt rút tiền nhưng lỗi tạo hóa đơn', 
        request,
        invoiceError: invoiceError.message
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi duyệt rút tiền', error: err.message });
  }
};

// Giáo viên xem danh sách yêu cầu rút tiền của mình
exports.getMyWithdrawRequests = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const requests = await WithdrawRequest.find({ teacherId })
      .sort({ createdAt: -1 })
      .populate('teacherId', 'fullname email avatar');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu rút tiền', error: err.message });
  }
};

// Giáo viên hủy yêu cầu rút tiền của mình
exports.cancelWithdrawRequest = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { id } = req.params;
    const request = await WithdrawRequest.findOne({ _id: id, teacherId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu rút tiền' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý, không thể hủy' });
    }
    // Hoàn lại tiền vào ví và cập nhật lịch sử
    const wallet = await TeacherWallet.findOne({ teacherId });
    if (wallet) {
      wallet.balance += request.amount;
      // Tìm lịch sử rút tiền chờ duyệt và cập nhật note, type
      const pendingHistory = wallet.history.find(h => 
        h.type === 'withdraw' && 
        h.amount === -request.amount && 
        h.note === 'Yêu cầu rút tiền - chờ duyệt'
      );
      if (pendingHistory) {
        pendingHistory.note = 'Bạn đã hủy yêu cầu rút tiền';
        pendingHistory.type = 'refund';
      } else {
        // Nếu không tìm thấy thì thêm lịch sử mới
        wallet.history.push({
          type: 'refund',
          amount: request.amount,
          note: 'Bạn đã hủy yêu cầu rút tiền',
        });
      }
      await wallet.save();
    }
    // Không xóa request, chỉ cập nhật trạng thái
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.note = 'Bạn đã hủy yêu cầu rút tiền';
    await request.save();
    res.json({ success: true, message: 'Đã hủy yêu cầu rút tiền', request });
  } catch (err) {
    console.error('Lỗi hủy yêu cầu rút tiền:', err);
    res.status(500).json({ success: false, message: 'Lỗi hủy yêu cầu rút tiền', error: err.message, stack: err.stack });
  }
};

// Admin từ chối yêu cầu rút tiền
exports.rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await WithdrawRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
    }
    // Hoàn lại tiền vào ví và cập nhật lịch sử
    const wallet = await TeacherWallet.findOne({ teacherId: request.teacherId });
    if (wallet) {
      wallet.balance += request.amount;
      // Tìm lịch sử rút tiền chờ duyệt và cập nhật note, type
      const pendingHistory = wallet.history.find(h => 
        h.type === 'withdraw' && 
        h.amount === -request.amount && 
        h.note === 'Yêu cầu rút tiền - chờ duyệt'
      );
      if (pendingHistory) {
        pendingHistory.note = 'Yêu cầu rút tiền đã bị admin từ chối';
        pendingHistory.type = 'refund';
      } else {
        // Nếu không tìm thấy thì thêm lịch sử mới
        wallet.history.push({
          type: 'refund',
          amount: request.amount,
          note: 'Yêu cầu rút tiền đã bị admin từ chối',
        });
      }
      await wallet.save();
    }
    request.status = 'rejected';
    request.note = reason;
    await request.save();
    res.json({ success: true, message: 'Đã từ chối yêu cầu rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi từ chối yêu cầu rút tiền', error: err.message });
  }
}; 