const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Voucher = require('../models/Voucher');
const VoucherUsage = require('../models/VoucherUsage');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course'); // Nên thêm rõ ràng

class OrderController {
  // Tạo đơn hàng
  static async createOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        items,
        voucherCode,
        paymentMethod = 'bank_transfer',
        shippingInfo,
        notes
      } = req.body;

      const { fullName, phone, email } = shippingInfo || {};
      const userId = req.user.id;

      if (!items || items.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const course = await Course.findById(item.courseId).session(session);
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

      // Xử lý mã giảm giá
      if (voucherCode) {
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() }).session(session);
        if (voucher) {
          const now = new Date();
          const isValid =
            voucher.startDate <= now &&
            (!voucher.endDate || voucher.endDate >= now) &&
            voucher.usedCount < voucher.usageLimit;

          if (isValid && totalAmount >= voucher.minOrderValue) {
            const used = await VoucherUsage.findOne({
              userId,
              voucherId: voucher._id
            }).session(session);

            if (!used) {
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

      // Tạo đơn hàng
      const order = new Order({
        userId,
        items: orderItems,
        totalAmount,
        discountAmount,
        finalAmount,
        voucherId,
        paymentMethod,
        fullName,
        phone,
        email,
        notes
      });

      await order.save({ session });

      // Ghi nhận voucher usage
      if (voucherId) {
        await new VoucherUsage({
          userId,
          voucherId,
          orderId: order._id
        }).save({ session });

        await Voucher.findByIdAndUpdate(voucherId, {
          $inc: { usedCount: 1 }
        }, { session });
      }

      // Xoá item đã mua khỏi giỏ hàng
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (cart) {
        const courseIds = items.map(item => item.courseId.toString());
        cart.items = cart.items.filter(item => !courseIds.includes(item.course.toString()));
        await cart.save({ session });
      }

      // Tạo enrollment cho tất cả khóa học trong đơn hàng
      const enrollments = [];
      for (const item of orderItems) {
        // Kiểm tra xem user đã enrollment khóa học này chưa
        const existingEnrollment = await Enrollment.findOne({
          student: userId,
          course: item.courseId
        }).session(session);

        if (!existingEnrollment) {
          enrollments.push({
            student: userId,
            course: item.courseId,
            enrolledAt: new Date()
          });
        }
      }

      if (enrollments.length > 0) {
        await Enrollment.insertMany(enrollments, { session });
      }

      await session.commitTransaction();
      await order.populate([
        {
          path: 'items.courseId',
          select: 'title thumbnail price'
        },
        {
          path: 'voucherId',
          select: 'code title discountType discountValue'
        }
      ]);

      return res.status(201).json({
        success: true,
        message: 'Tạo đơn hàng thành công',
        data: {
          order: {
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            paymentMethod: order.paymentMethod,
            fullName: order.fullName,
            phone: order.phone,
            email: order.email,
            createdAt: order.createdAt
          }
        }
      });
    } catch (err) {
      await session.abortTransaction();
      console.error('Create order error:', err);
      res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng', error: err.message });
    } finally {
      session.endSession();
    }
  }

  // Lấy danh sách đơn hàng của user
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      console.log('🔍 getUserOrders - User ID:', userId);
      console.log('🔍 getUserOrders - User object:', req.user);
      
      const { page = 1, limit = 10, status } = req.query;

      const filter = { userId };
      if (status) filter.status = status;

      console.log('🔍 getUserOrders - Filter:', filter);

      const orders = await Order.find(filter)
        .populate('items.courseId', 'title thumbnail price')
        .populate('voucherId', 'code title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      console.log('🔍 getUserOrders - Found orders count:', orders.length);

      const total = await Order.countDocuments(filter);

      return res.json({
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: {
          orders: orders.map(order => ({
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            paymentMethod: order.paymentMethod,
            fullName: order.fullName,
            phone: order.phone,
            email: order.email,
            createdAt: order.createdAt
          })),
          pagination: {
            current: Number(page),
            total: Math.ceil(total / limit),
            pageSize: Number(limit)
          }
        }
      });
    } catch (err) {
      console.error('Get user orders error:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đơn hàng', error: err.message });
    }
  }

  // Lấy chi tiết đơn hàng
  static async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ _id: id, userId })
        .populate('items.courseId', 'title thumbnail price discount description')
        .populate('voucherId', 'code title discountType discountValue');

      if (!order) {
        return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      }

      return res.json({
        success: true,
        message: 'Lấy chi tiết đơn hàng thành công',
        data: {
          order: {
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            voucher: order.voucherId,
            paymentMethod: order.paymentMethod,
            notes: order.notes,
            fullName: order.fullName,
            phone: order.phone,
            email: order.email,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          }
        }
      });
    } catch (err) {
      console.error('Get order detail error:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết đơn hàng', error: err.message });
    }
  }

  // Hủy đơn hàng
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ _id: id, userId });
      if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      return res.json({ success: true, message: 'Hủy đơn hàng thành công' });
    } catch (err) {
      console.error('Cancel order error:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi hủy đơn hàng', error: err.message });
    }
  }

  // Admin: Hoàn tất thanh toán
  static async completePayment(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Đơn hàng không ở trạng thái chờ xử lý' });
      }

      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.paidAt = new Date();
      await order.save();

      const enrollments = order.items.map(item => ({
        userId: order.userId,
        courseId: item.courseId,
        orderId: order._id,
        enrolledAt: new Date()
      }));

      await Enrollment.insertMany(enrollments);

      return res.json({ success: true, message: 'Hoàn thành thanh toán thành công' });
    } catch (err) {
      console.error('Complete payment error:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi hoàn thành thanh toán', error: err.message });
    }
  }
}

module.exports = OrderController;
