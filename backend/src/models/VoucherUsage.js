const mongoose = require("mongoose");

const voucherUsageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  voucherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voucher', 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  usedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index để đảm bảo mỗi user chỉ dùng 1 voucher 1 lần trong 1 order
voucherUsageSchema.index({ userId: 1, voucherId: 1, orderId: 1 }, { unique: true });

// Index để tối ưu query theo user và voucher
voucherUsageSchema.index({ userId: 1, voucherId: 1 });

module.exports = mongoose.model("VoucherUsage", voucherUsageSchema); 