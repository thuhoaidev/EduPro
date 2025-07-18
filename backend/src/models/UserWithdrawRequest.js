const mongoose = require('mongoose');

const UserWithdrawRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bank: String,
  account: String,
  holder: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
  cancelledAt: Date,
  note: String
});

module.exports = mongoose.model('UserWithdrawRequest', UserWithdrawRequestSchema); 