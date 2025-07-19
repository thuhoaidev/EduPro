const mongoose = require('mongoose');

const userWalletDepositSchema = new mongoose.Schema({
  app_trans_id: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserWalletDeposit', userWalletDepositSchema); 