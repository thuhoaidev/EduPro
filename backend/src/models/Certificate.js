const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  code: { type: String, required: true, unique: true },
  file: { type: String }, // Đường dẫn file PDF chứng chỉ
  
  // Thêm các trường mới cho chứng chỉ hoàn chỉnh
  certificateNumber: { type: String, required: true }, // Số chứng chỉ (CERT-xxx)
  issuingUnit: { type: String, default: 'Edu Pro' }, // Đơn vị cấp chứng chỉ
  instructorSignature: { type: String }, // Chữ ký của giảng viên
  instructorName: { type: String }, // Tên giảng viên
  motivationalText: { 
    type: String, 
    default: 'Cảm ơn bạn vì tất cả sự chăm chỉ và cống hiến của mình. Hãy tiếp tục học hỏi, vì càng có nhiều kiến thức, bạn càng có cơ hội thành công trong cuộc sống.'
  }, // Lời chúc động viên
  templateUsed: { type: String, default: 'Vàng và Tím Con dấu Chứng chỉ Bằng tốt nghiệp.png' }, // Template sử dụng
});

module.exports = mongoose.model('Certificate', certificateSchema); 