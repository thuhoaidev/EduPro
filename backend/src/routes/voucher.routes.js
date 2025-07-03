const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const VoucherUsage = require("../models/VoucherUsage");
const { auth } = require("../middlewares/auth");

// Helper function để kiểm tra voucher có hợp lệ không
const isVoucherValid = (voucher) => {
  const now = new Date();
  
  // Kiểm tra ngày bắt đầu
  if (voucher.startDate && new Date(voucher.startDate) > now) {
    return { valid: false, reason: "Voucher chưa có hiệu lực" };
  }
  
  // Kiểm tra ngày kết thúc
  if (voucher.endDate && new Date(voucher.endDate) < now) {
    return { valid: false, reason: "Voucher đã hết hạn" };
  }
  
  // Kiểm tra số lượt sử dụng
  if (voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, reason: "Voucher đã hết lượt sử dụng" };
  }
  
  return { valid: true };
};

// GET all vouchers (cho admin)
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    // Map to new structure for frontend compatibility
    const mapped = vouchers.map(v => ({
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
      isNew: v.isNew,
      isHot: v.isHot,
      isVipOnly: v.isVipOnly,
      startDate: v.startDate,
      endDate: v.endDate,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt
    }));
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

// GET available vouchers (cho client - chỉ hiển thị voucher còn hạn và còn lượt)
router.get("/available", async (req, res) => {
  try {
    const now = new Date();
    
    // Lấy voucher còn hạn và còn lượt sử dụng
    const vouchers = await Voucher.find({
      $and: [
        { startDate: { $lte: now } }, // Đã bắt đầu
        { 
          $or: [
            { endDate: { $exists: false } }, // Không có ngày kết thúc
            { endDate: { $gt: now } } // Chưa hết hạn
          ]
        },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } } // Còn lượt sử dụng
      ]
    }).sort({ createdAt: -1 });

    // Map và thêm thông tin trạng thái
    const mapped = vouchers.map(v => {
      const validation = isVoucherValid(v);
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
        isNew: v.isNew,
        isHot: v.isHot,
        isVipOnly: v.isVipOnly,
        startDate: v.startDate,
        endDate: v.endDate,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        isValid: validation.valid,
        status: validation.valid ? 'available' : 'unavailable',
        statusMessage: validation.reason || 'Có thể sử dụng'
      };
    });

    res.json({
      success: true,
      message: "Lấy danh sách mã giảm giá khả dụng thành công",
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

// POST validate voucher (kiểm tra voucher có thể sử dụng cho user không)
router.post("/validate", auth, async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá"
      });
    }

    // Tìm voucher theo code
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Mã giảm giá không tồn tại"
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

    // Kiểm tra điều kiện đơn hàng tối thiểu
    if (voucher.minOrderValue > 0 && orderAmount < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`
      });
    }

    // Kiểm tra user đã dùng voucher này chưa (tạm thời bỏ qua orderId)
    const existingUsage = await VoucherUsage.findOne({
      userId: userId,
      voucherId: voucher._id
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã sử dụng voucher này rồi"
      });
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

    res.json({
      success: true,
      message: "Voucher hợp lệ",
      data: {
        voucher: {
          id: voucher._id,
          code: voucher.code,
          title: voucher.title,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          maxDiscount: voucher.maxDiscount,
          minOrderValue: voucher.minOrderValue
        },
        discountAmount: discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra voucher",
      error: err.message
    });
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

    // Cập nhật số lượt sử dụng của voucher
    await Voucher.findByIdAndUpdate(voucherId, {
      $inc: { usedCount: 1 }
    });

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
      isNew: v.isNew,
      isHot: v.isHot,
      isVipOnly: v.isVipOnly,
      startDate: v.startDate,
      endDate: v.endDate,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt
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
