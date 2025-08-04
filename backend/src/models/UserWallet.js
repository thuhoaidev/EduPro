const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  history: [
    {
      type: { type: String, enum: ['deposit', 'withdraw', 'payment'], required: true },
      amount: Number,
      method: String,
      status: String,
      txId: String, // Thêm trường txId để lưu mã giao dịch
      note: String, // Thêm trường note để lưu chú thích giao dịch
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('UserWallet', userWalletSchema); 