const mongoose = require('mongoose');

const WithdrawRequestSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bank: String,
  account: String,
  holder: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
  note: String
});

module.exports = mongoose.model('WithdrawRequest', WithdrawRequestSchema); 