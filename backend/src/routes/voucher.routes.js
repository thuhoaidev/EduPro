const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const VoucherUsage = require("../models/VoucherUsage");
const { auth } = require("../middlewares/auth");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function để kiểm tra voucher có hợp lệ không
const isVoucherValid = (voucher) => {
  const now = dayjs.utc();
  
  // Kiểm tra ngày bắt đầu
  if (voucher.startDate && now.isBefore(dayjs.utc(voucher.startDate))) {
    return { valid: false, reason: "Voucher chưa có hiệu lực" };
  }
  
  // Kiểm tra ngày kết thúc
  if (voucher.endDate && now.isAfter(dayjs.utc(voucher.endDate))) {
    return { valid: false, reason: "Voucher đã hết hạn" };
  }
  
  // Kiểm tra số lượt sử dụng
  if (voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, reason: "Voucher đã hết lượt sử dụng" };
  }
  
  return { valid: true };
};

// Helper function để kiểm tra voucher có hợp lệ cho user không (dạng async)
const isVoucherValidForUser = async (voucher, user, orderAmount = 0) => {
  const now = dayjs.utc();
  // Kiểm tra ngày bắt đầu/kết thúc, số lượt sử dụng
  if (voucher.startDate && now.isBefore(dayjs.utc(voucher.startDate))) {
    return { valid: false, reason: "Voucher chưa có hiệu lực" };
  }
  if (voucher.endDate && now.isAfter(dayjs.utc(voucher.endDate))) {
    return { valid: false, reason: "Voucher đã hết hạn" };
  }
  if (voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, reason: "Voucher đã hết lượt sử dụng" };
  }
  // Kiểm tra loại voucher động
  if (voucher.type === 'new-user') {
    const userCreatedAt = user.createdAt || user.created_at;
    if (!userCreatedAt) return { valid: false, reason: "Không xác định được ngày tạo tài khoản" };
    const days = Math.floor(now.diff(dayjs.utc(userCreatedAt), 'day'));
    console.log('DEBUG new-user:', { userId: user._id, days, maxAccountAge: voucher.maxAccountAge });
    if (voucher.maxAccountAge && days > voucher.maxAccountAge) {
      return { valid: false, reason: `Chỉ áp dụng cho tài khoản mới tạo trong ${voucher.maxAccountAge} ngày` };
    }
  }
  if (voucher.type === 'birthday') {
    console.log('DEBUG birthday:', { userId: user._id, dob: user.dob });
    if (!user.dob) return { valid: false, reason: "Bạn chưa cập nhật ngày sinh" };
    const dob = dayjs.utc(user.dob);
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    if (!(dob.date() === nowVN.date() && dob.month() === nowVN.month())) {
      return { valid: false, reason: "Chỉ áp dụng đúng ngày sinh nhật" };
    }
  }
  if (voucher.type === 'first-order') {
    const Order = require('../models/Order');
    const count = await Order.countDocuments({ userId: user._id, status: 'paid' });
    console.log('DEBUG first-order:', { userId: user._id, paidOrderCount: count });
    if (count > 0) {
      return { valid: false, reason: "Chỉ áp dụng cho đơn hàng đầu tiên" };
    }
  }
  if (voucher.type === 'order-count') {
    const Order = require('../models/Order');
    const count = await Order.countDocuments({ userId: user._id, status: 'paid' });
    console.log('DEBUG order-count:', { userId: user._id, paidOrderCount: count, minOrderCount: voucher.minOrderCount, maxOrderCount: voucher.maxOrderCount });
    if (voucher.minOrderCount && count < voucher.minOrderCount) {
      return { valid: false, reason: `Bạn cần có ít nhất ${voucher.minOrderCount} đơn hàng đã thanh toán` };
    }
    if (voucher.maxOrderCount && count > voucher.maxOrderCount) {
      return { valid: false, reason: `Chỉ áp dụng cho khách có tối đa ${voucher.maxOrderCount} đơn hàng` };
    }
  }
  if (voucher.type === 'order-value') {
    const Order = require('../models/Order');
    const orders = await Order.find({ userId: user._id, status: 'paid' });
    const total = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    console.log('DEBUG order-value:', { userId: user._id, total, minOrderValue: voucher.minOrderValue });
    if (voucher.minOrderValue && total < voucher.minOrderValue) {
      return { valid: false, reason: `Bạn cần có tổng giá trị đơn hàng đã thanh toán tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để nhận voucher này` };
    }
  }
  if (voucher.type === 'flash-sale') {
    // Sử dụng dayjs để lấy giờ Việt Nam chính xác
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const hour = nowVN.hour();
    if (hour < 0 || hour >= 1) {
      console.log('DEBUG flash-sale: ngoài khung giờ 0h-1h VN', { hour });
      return { valid: false, reason: "Chỉ áp dụng từ 0h đến 1h sáng mỗi ngày" };
    }
    console.log('DEBUG flash-sale: trong khung giờ 0h-1h VN', { hour });
    // Đã kiểm tra startDate, endDate, usedCount ở trên, không cần điều kiện user đặc biệt
  }
  return { valid: true };
};

// GET all vouchers (cho admin)
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    // Map to new structure for frontend compatibility
    const now = dayjs.utc();
    const mapped = vouchers.map(v => {
      const start = v.startDate ? dayjs.utc(v.startDate) : null;
      const end = v.endDate ? dayjs.utc(v.endDate) : null;
      return {
        id: v._id,
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        maxDiscount: v.maxDiscount,
        minOrderValue: v.minOrderValue,
        usageLimit: v.usageLimit,
        usedCount: v.usedCount,
        categories: v.categories,
        tags: v.tags,
        startDate: v.startDate,
        endDate: v.endDate,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        type: v.type,
        status:
          (start && now.isBefore(start)) ? 'Chưa bắt đầu'
          : (end && now.isAfter(end)) ? 'Đã hết hạn'
          : (v.usedCount >= v.usageLimit) ? 'Đã hết hạn'
          : 'Đang hoạt động'
      }
    });
    res.json({
      success: true,
      message: "Lấy danh sách mã giảm giá thành công",
      data: mapped
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: err.message
    });
  }
});

// GET available vouchers (cho client - hiển thị voucher phổ thông cho mọi user, voucher điều kiện chỉ cho user đủ điều kiện)
router.get("/available", async (req, res) => {
  try {
    const now = dayjs.utc();
    let user = null;
    let userId = null;
    // Nếu có header Authorization thì lấy user
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
          const User = require('../models/User');
          user = await User.findById(userId);
        } catch (e) {
          // Token không hợp lệ hoặc hết hạn, bỏ qua user
          user = null;
        }
      }
    }
    // Lấy tất cả voucher
    const vouchers = await Voucher.find().sort({ createdAt: -1 });

    const conditionalTypes = ['new-user', 'birthday', 'first-order', 'order-count', 'order-value', 'flash-sale'];
    const result = [];
    for (const v of vouchers) {
      const start = v.startDate ? dayjs.utc(v.startDate) : null;
      const end = v.endDate ? dayjs.utc(v.endDate) : null;
      if (start && now.isBefore(start)) continue;
      if (end && now.isAfter(end)) continue;
      if (v.usedCount >= v.usageLimit) continue;
      if (v.usageLimit <= 1 && user) {
        const used = await VoucherUsage.findOne({ userId: user._id, voucherId: v._id });
        if (used) continue;
      }
      if (conditionalTypes.includes(v.type)) {
        // Voucher điều kiện: chỉ trả về khi có user và user đủ điều kiện
        if (user) {
          const validation = await isVoucherValidForUser(v, user);
          if (validation.valid) {
            result.push({
              id: v._id,
              code: v.code,
              title: v.title,
              description: v.description,
              discountType: v.discountType,
              discountValue: v.discountValue,
              maxDiscount: v.maxDiscount,
              minOrderValue: v.minOrderValue,
              usageLimit: v.usageLimit,
              usedCount: v.usedCount,
              categories: v.categories,
              tags: v.tags,
              startDate: v.startDate,
              endDate: v.endDate,
              createdAt: v.createdAt,
              updatedAt: v.updatedAt,
              status: 'available',
              statusMessage: 'Có thể sử dụng',
              type: v.type
            });
          }
        }
        // Nếu không có user thì KHÔNG push voucher điều kiện vào result
      } else {
        // Voucher default: chỉ hiển thị nếu chưa hết hạn và đã đến thời gian bắt đầu
        result.push({
          id: v._id,
          code: v.code,
          title: v.title,
          description: v.description,
          discountType: v.discountType,
          discountValue: v.discountValue,
          maxDiscount: v.maxDiscount,
          minOrderValue: v.minOrderValue,
          usageLimit: v.usageLimit,
          usedCount: v.usedCount,
          categories: v.categories,
          tags: v.tags,
          startDate: v.startDate,
          endDate: v.endDate,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          status: 'available',
          statusMessage: 'Có thể sử dụng',
          type: v.type
        });
      }
    }
    res.json({
      success: true,
      message: "Lấy danh sách mã giảm giá phù hợp thành công",
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: err.message
    });
  }
});

// POST validate voucher (kiểm tra voucher có thể sử dụng cho user không)
router.post("/validate", auth, async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    const userId = req.user.id;
    if (!code) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
    }
    // Tìm voucher theo code
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại" });
    }
    // Lấy user
    const User = require('../models/User');
    const user = await User.findById(userId);
    // Kiểm tra voucher có hợp lệ cho user không
    const validation = await isVoucherValidForUser(voucher, user, orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.reason });
    }
    // Kiểm tra điều kiện đơn hàng tối thiểu
    if (voucher.minOrderValue > 0 && orderAmount < voucher.minOrderValue) {
      return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này` });
    }
    // Kiểm tra user đã dùng voucher này chưa (tạm thời bỏ qua orderId)
    const existingUsage = await VoucherUsage.findOne({ userId: userId, voucherId: voucher._id });
    if (existingUsage) {
      return res.status(400).json({ success: false, message: "Bạn đã sử dụng voucher này rồi" });
    }
    // Tính toán discount
    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = (orderAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }
    res.json({ success: true, message: "Voucher hợp lệ", data: { voucher: { id: voucher._id, code: voucher.code, title: voucher.title, description: voucher.description, discountType: voucher.discountType, discountValue: voucher.discountValue, maxDiscount: voucher.maxDiscount, minOrderValue: voucher.minOrderValue, type: voucher.type }, discountAmount: discountAmount, finalAmount: orderAmount - discountAmount } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi kiểm tra voucher", error: err.message });
  }
});

// POST apply voucher (áp dụng voucher vào order)
router.post("/apply", auth, async (req, res) => {
  try {
    const { voucherId, orderId, orderAmount } = req.body;
    const userId = req.user.id;

    if (!voucherId || !orderId || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin cần thiết"
      });
    }

    // Tìm voucher
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher không tồn tại"
      });
    }

    // Kiểm tra voucher có hợp lệ không
    const validation = isVoucherValid(voucher);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason
      });
    }

    // Kiểm tra user đã dùng voucher này trong order này chưa
    const existingUsage = await VoucherUsage.findOne({
      userId: userId,
      voucherId: voucherId,
      orderId: orderId
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã sử dụng voucher này trong đơn hàng này rồi"
      });
    }

    // Tạo voucher usage record
    const voucherUsage = new VoucherUsage({
      userId: userId,
      voucherId: voucherId,
      orderId: orderId
    });

    await voucherUsage.save();

    // Cập nhật số lượt sử dụng của voucher nếu usageLimit > 1
    if (voucher.usageLimit > 1) {
      await Voucher.findByIdAndUpdate(voucherId, {
        $inc: { usedCount: 1 }
      });
    }

    res.json({
      success: true,
      message: "Áp dụng voucher thành công"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi áp dụng voucher",
      error: err.message
    });
  }
});

// GET single voucher
router.get("/:id", async (req, res) => {
  try {
    const v = await Voucher.findById(req.params.id);
    if (!v) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá"
      });
    }
    const mapped = {
      id: v._id,
      code: v.code,
      title: v.title,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscount: v.maxDiscount,
      minOrderValue: v.minOrderValue,
      usageLimit: v.usageLimit,
      usedCount: v.usedCount,
      categories: v.categories,
      tags: v.tags,
      startDate: v.startDate,
      endDate: v.endDate,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      type: v.type
    };
    res.json({
      success: true,
      message: "Lấy mã giảm giá thành công",
      data: mapped
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy mã giảm giá",
      error: err.message
    });
  }
});

// POST create voucher
router.post("/", async (req, res) => {
  try {
    const newVoucher = new Voucher(req.body);
    await newVoucher.save();
    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: newVoucher
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Tạo mã giảm giá thất bại",
      error: err.message
    });
  }
});

// PUT update voucher
router.put("/:id", async (req, res) => {
  try {
    const updated = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá để cập nhật"
      });
    }
    res.json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Cập nhật mã giảm giá thất bại",
      error: err.message
    });
  }
});

// DELETE voucher
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Voucher.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá để xóa"
      });
    }
    res.json({
      success: true,
      message: "Xóa mã giảm giá thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Xóa mã giảm giá thất bại",
      error: err.message
    });
  }
});

module.exports = router;
