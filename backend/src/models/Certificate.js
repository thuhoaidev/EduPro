const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  code: { type: String, required: true, unique: true },
  file: { type: String }, // Đường dẫn file PDF chứng chỉ
  // Optionally: file, template, etc.
});

module.exports = mongoose.model('Certificate', certificateSchema); 