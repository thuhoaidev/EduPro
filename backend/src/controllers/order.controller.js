const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Voucher = require('../models/Voucher');
const VoucherUsage = require('../models/VoucherUsage');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

class OrderController {
  // [POST] /api/orders - Tạo đơn hàng mới
  static async createOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { 
        items, 
        voucherCode, 
        paymentMethod = 'bank_transfer',
        fullName,
        phone,
        email,
        notes 
      } = req.body;
      const userId = req.user.id;

      if (!items || items.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Giỏ hàng trống"
        });
      }

      // Tính toán tổng tiền
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const course = await mongoose.model('Course').findById(item.courseId).session(session);
        if (!course) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Khóa học ${item.courseId} không tồn tại`
          });
        }

        const finalPrice = course.price * (1 - (course.discount || 0) / 100);
        totalAmount += finalPrice * (item.quantity || 1);
        
        orderItems.push({
          courseId: course._id,
          price: finalPrice,
          quantity: item.quantity || 1
        });
      }

      let discountAmount = 0;
      let voucherId = null;

      // Xử lý voucher nếu có
      if (voucherCode) {
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() }).session(session);
        
        if (voucher) {
          // Kiểm tra voucher có hợp lệ không
          const now = new Date();
          const isValid = voucher.startDate <= now && 
                         (!voucher.endDate || voucher.endDate >= now) &&
                         voucher.usedCount < voucher.usageLimit;

          if (isValid && totalAmount >= voucher.minOrderValue) {
            // Kiểm tra user đã dùng voucher này chưa
            const existingUsage = await VoucherUsage.findOne({
              userId: userId,
              voucherId: voucher._id
            }).session(session);

            if (!existingUsage) {
              // Tính discount
              if (voucher.discountType === 'percentage') {
                discountAmount = (totalAmount * voucher.discountValue) / 100;
                if (voucher.maxDiscount > 0) {
                  discountAmount = Math.min(discountAmount, voucher.maxDiscount);
                }
              } else {
                discountAmount = voucher.discountValue;
              }
              
              voucherId = voucher._id;
            }
          }
        }
      }

      const finalAmount = totalAmount - discountAmount;

      // Tạo order
      const order = new Order({
        userId: userId,
        items: orderItems,
        totalAmount: totalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        voucherId: voucherId,
        paymentMethod: paymentMethod,
        fullName: fullName,
        phone: phone,
        email: email,
        notes: notes
      });

      await order.save({ session });

      // Tạo voucher usage record nếu có voucher
      if (voucherId) {
        const voucherUsage = new VoucherUsage({
          userId: userId,
          voucherId: voucherId,
          orderId: order._id
        });
        await voucherUsage.save({ session });

        // Cập nhật số lượt sử dụng của voucher
        await Voucher.findByIdAndUpdate(voucherId, {
          $inc: { usedCount: 1 }
        }, { session });
      }

      // Xóa items khỏi cart
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (cart) {
        const courseIds = items.map(item => item.courseId);
        cart.items = cart.items.filter(item => 
          !courseIds.includes(item.course.toString())
        );
        await cart.save({ session });
      }

      await session.commitTransaction();

      // Populate thông tin chi tiết
      await order.populate([
        {
          path: 'items.courseId',
          select: 'title thumbnail price discount'
        },
        {
          path: 'voucherId',
          select: 'code title discountType discountValue'
        }
      ]);

      res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: {
          order: {
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt
          }
        }
      });

    } catch (error) {
      await session.abortTransaction();
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo đơn hàng",
        error: error.message
      });
    } finally {
      session.endSession();
    }
  }

  // [GET] /api/orders - Lấy danh sách đơn hàng của user
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const filter = { userId };
      if (status) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .populate('items.courseId', 'title thumbnail price')
        .populate('voucherId', 'code title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(filter);

      res.json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        data: {
          orders: orders.map(order => ({
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt
          })),
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            pageSize: limit
          }
        }
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: error.message
      });
    }
  }

  // [GET] /api/orders/:id - Lấy chi tiết đơn hàng
  static async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ _id: id, userId })
        .populate('items.courseId', 'title thumbnail price discount description')
        .populate('voucherId', 'code title discountType discountValue');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Đơn hàng không tồn tại"
        });
      }

      res.json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công",
        data: {
          order: {
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress,
            notes: order.notes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết đơn hàng",
        error: error.message
      });
    }
  }

  // [PUT] /api/orders/:id/cancel - Hủy đơn hàng
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ _id: id, userId });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Đơn hàng không tồn tại"
        });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể hủy đơn hàng đang chờ xử lý"
        });
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      res.json({
        success: true,
        message: "Hủy đơn hàng thành công"
      });

    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi hủy đơn hàng",
        error: error.message
      });
    }
  }

  // [POST] /api/orders/:id/complete-payment - Hoàn thành thanh toán (admin)
  static async completePayment(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Đơn hàng không tồn tại"
        });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng không ở trạng thái chờ xử lý"
        });
      }

      // Cập nhật trạng thái đơn hàng
      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.paidAt = new Date();
      await order.save();

      // Tạo enrollment cho từng khóa học
      const enrollments = order.items.map(item => ({
        userId: order.userId,
        courseId: item.courseId,
        orderId: order._id,
        enrolledAt: new Date()
      }));

      await Enrollment.insertMany(enrollments);

      res.json({
        success: true,
        message: "Hoàn thành thanh toán thành công"
      });

    } catch (error) {
      console.error('Complete payment error:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi hoàn thành thanh toán",
        error: error.message
      });
    }
  }
}

module.exports = OrderController; 