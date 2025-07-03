const Report = require('../models/Report');

// Tạo báo cáo
exports.createReport = async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const newReport = new Report({ userId, title, content });
    await newReport.save();
    res.json({ success: true, message: 'Report submitted', data: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy báo cáo của user
exports.getReportsByUser = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin lấy tất cả
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('userId', 'name email');
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin trả lời báo cáo
exports.replyToReport = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { adminReply, status: 'resolved' },
      { new: true }
    );
    res.json({ success: true, message: 'Reply sent', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
