const mongoose = require('mongoose');

// Schema lưu trữ token xác thực email
const emailVerificationSchema = new mongoose.Schema({
  // ID của người dùng cần xác thực
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Token xác thực
  token: {
    type: String,
    required: true,
  },
  // Thời gian hết hạn của token (24 giờ)
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  // Trạng thái sử dụng của token
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Tự động xóa token đã hết hạn
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

module.exports = EmailVerification; 