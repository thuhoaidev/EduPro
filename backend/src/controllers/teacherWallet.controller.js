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
    const requests = await WithdrawRequest.find().populate('teacherId', 'fullname email');
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
    const wallet = await TeacherWallet.findOne({ teacherId: request.teacherId });
    if (!wallet || wallet.balance < request.amount) {
      return res.status(400).json({ success: false, message: 'Số dư không đủ' });
    }
    // Trừ tiền và cập nhật lịch sử
    wallet.balance -= request.amount;
    wallet.history.push({
      type: 'withdraw',
      amount: -request.amount,
      note: 'Rút tiền đã được admin duyệt'
    });
    await wallet.save();
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();
    res.json({ success: true, message: 'Đã duyệt rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi duyệt rút tiền', error: err.message });
  }
};

// Giáo viên xem danh sách yêu cầu rút tiền của mình
exports.getMyWithdrawRequests = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const requests = await WithdrawRequest.find({ teacherId }).sort({ createdAt: -1 });
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
    // Hoàn lại tiền vào ví và xóa lịch sử rút tiền chờ duyệt
    const wallet = await TeacherWallet.findOne({ teacherId });
    if (wallet) {
      wallet.balance += request.amount;
      // Xóa lịch sử rút tiền chờ duyệt (note: 'Yêu cầu rút tiền - chờ duyệt' và amount = -request.amount)
      wallet.history = wallet.history.filter(h => !(h.type === 'withdraw' && h.amount === -request.amount && h.note === 'Yêu cầu rút tiền - chờ duyệt'));
      await wallet.save();
    }
    await request.deleteOne();
    res.json({ success: true, message: 'Đã hủy yêu cầu rút tiền' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi hủy yêu cầu rút tiền', error: err.message });
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
    // Hoàn lại tiền vào ví và xóa lịch sử rút tiền chờ duyệt
    const wallet = await TeacherWallet.findOne({ teacherId: request.teacherId });
    if (wallet) {
      wallet.balance += request.amount;
      wallet.history = wallet.history.filter(h => !(h.type === 'withdraw' && h.amount === -request.amount && h.note === 'Yêu cầu rút tiền - chờ duyệt'));
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