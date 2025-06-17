const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");

// GET all vouchers
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Lấy danh sách mã giảm giá thành công",
      data: vouchers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: err.message
    });
  }
});

// GET single voucher
router.get("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá"
      });
    }
    res.json({
      success: true,
      message: "Lấy mã giảm giá thành công",
      data: voucher
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
