const mongoose = require('mongoose');

const WalletHistorySchema = new mongoose.Schema({
  type: { type: String, enum: ['earning', 'withdraw', 'refund'], required: true },
  amount: { type: Number, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  note: String,
  createdAt: { type: Date, default: Date.now }
});

const TeacherWalletSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  history: [WalletHistorySchema]
});

module.exports = mongoose.model('TeacherWallet', TeacherWalletSchema); 