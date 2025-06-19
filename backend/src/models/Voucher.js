const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  course: { type: String, default: null }, // null = áp dụng toàn bộ
  type: { type: String, enum: ["percentage", "amount"], required: true },
  value: { type: Number, required: true },
  quantity: { type: Number, required: true },
  used: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "expired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model("Voucher", voucherSchema);
