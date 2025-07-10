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

  startDate: { type: Date, required: true }, // Ngày bắt đầu
  endDate: { type: Date }, // Ngày kết thúc
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['default', 'new-user', 'birthday', 'first-order', 'order-value', 'order-count', 'flash-sale'], default: 'default' }, // Loại voucher
  minAccountAge: { type: Number, default: 0 }, // Số ngày tối thiểu kể từ khi tạo tài khoản (dành cho order-count, order-value)
  maxAccountAge: { type: Number, default: 0 }, // Số ngày tối đa kể từ khi tạo tài khoản (dành cho new-user)
  minOrderCount: { type: Number, default: 0 }, // Số đơn hàng tối thiểu
  maxOrderCount: { type: Number, default: 0 }, // Số đơn hàng tối đa
}, {
  suppressReservedKeysWarning: true,
});

module.exports = mongoose.model("Voucher", voucherSchema);
