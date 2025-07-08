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