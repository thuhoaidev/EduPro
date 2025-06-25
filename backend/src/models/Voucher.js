const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },

  discountType: { type: String, enum: ["percentage", "fixed"], required: true }, // 'percentage' | 'fixed'
  discountValue: { type: Number, required: true }, // Giá trị giảm
  maxDiscount: { type: Number, default: 0 }, // Giảm tối đa (nếu là % hoặc muốn giới hạn)

  minOrderValue: { type: Number, default: 0 }, // Điều kiện đơn hàng tối thiểu
  usageLimit: { type: Number, required: true }, // Số lượt được sử dụng tối đa
  usedCount: { type: Number, default: 0 }, // Số lượt đã sử dụng

  categories: [{ type: String, default: [] }], // Danh sách danh mục áp dụng
  tags: [{ type: String, default: [] }], // Tag hiển thị
  isNew: { type: Boolean, default: false }, // Có hiển thị tag "Mới" không
  isHot: { type: Boolean, default: false }, // Có hiển thị icon 🔥 không
  isVipOnly: { type: Boolean, default: false }, // Chỉ dành cho người dùng VIP?

  startDate: { type: Date, required: true }, // Ngày bắt đầu
  endDate: { type: Date }, // Ngày kết thúc
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Voucher", voucherSchema);
