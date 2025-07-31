const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Voucher = require('../models/Voucher');
const VoucherUsage = require('../models/VoucherUsage');
const Enrollment = require('../models/Enrollment');
const TeacherWallet = require('../models/TeacherWallet');
const Course = require('../models/Course'); // Nên thêm rõ ràng
const InstructorProfile = require('../models/InstructorProfile');
const Notification = require('../models/Notification');
const UserWallet = require('../models/UserWallet');

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

      // Nếu thanh toán bằng ví, kiểm tra và trừ tiền ví trước khi tạo đơn hàng
      if (paymentMethod === 'wallet') {
        let wallet = await UserWallet.findOne({ userId }).session(session);
        if (!wallet) {
          wallet = new UserWallet({ userId, balance: 0, history: [] });
        }
        if (wallet.balance < finalAmount) {
          await session.abortTransaction();
          return res.status(400).json({ success: false, message: 'Số dư ví không đủ để thanh toán!' });
        }
        wallet.balance -= finalAmount;
        wallet.history.push({
          type: 'payment',
          amount: -finalAmount,
          method: 'wallet',
          status: 'paid',
          note: `Thanh toán đơn hàng khóa học`,
          createdAt: new Date()
        });
        await wallet.save({ session });
      }

      // Nếu thanh toán bằng Momo, tạo đơn hàng với trạng thái pending
      if (paymentMethod === 'momo') {
        // Không cần xử lý gì ở đây, đơn hàng sẽ được cập nhật khi có callback từ Momo
      }

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

      // Tự động chuyển trạng thái sang 'paid' và cộng tiền vào ví giảng viên (chỉ cho ví và bank_transfer)
      if (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') {
        order.status = 'paid';
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        await order.save({ session });
      } else {
        // Với Momo, VNPAY, ZaloPay: giữ trạng thái pending, sẽ cập nhật khi có callback
        order.status = 'pending';
        order.paymentStatus = 'pending';
        await order.save({ session });
      }

      // Cộng tiền vào ví giáo viên cho từng khóa học trong đơn hàng (chỉ khi thanh toán thành công)
      if (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') {
        for (const item of orderItems) {
          const course = await Course.findById(item.courseId).session(session);
          if (!course) continue;
          if (!course.instructor) continue;
          const instructorProfile = await InstructorProfile.findById(course.instructor).session(session);
          if (!instructorProfile || !instructorProfile.user) continue;
          let wallet = await TeacherWallet.findOne({ teacherId: instructorProfile.user }).session(session);
          if (!wallet) {
            wallet = new TeacherWallet({ teacherId: instructorProfile.user, balance: 0, history: [] });
          }
          // Giáo viên nhận 70% giá gốc
          const earning = Math.round(course.price * 0.7 * (item.quantity || 1));
          wallet.balance += earning;
          wallet.history.push({
            type: 'earning',
            amount: earning,
            orderId: order._id,
            note: `Bán khóa học: ${course.title} (70% giá gốc)`
          });
          await wallet.save({ session });
        }
      }

      // Ghi nhận voucher usage (chỉ khi thanh toán thành công)
      if (voucherId && (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer')) {
        await new VoucherUsage({
          userId,
          voucherId,
          orderId: order._id
        }).save({ session });

        // Chỉ tăng usedCount nếu là voucher phổ thông hoặc flash-sale
        const voucher = await Voucher.findById(voucherId).session(session);
        if (voucher && (voucher.type === 'default' || voucher.type === 'flash-sale')) {
          await Voucher.findByIdAndUpdate(voucherId, {
            $inc: { usedCount: 1 }
          }, { session });
        }
      }

      // Xoá item đã mua khỏi giỏ hàng (chỉ khi thanh toán thành công)
      if (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') {
        const cart = await Cart.findOne({ user: userId }).session(session);
        if (cart) {
          const courseIds = items.map(item => item.courseId.toString());
          cart.items = cart.items.filter(item => !courseIds.includes(item.course.toString()));
          await cart.save({ session });
        }
      }

      // Tạo enrollment cho tất cả khóa học trong đơn hàng (chỉ khi thanh toán thành công)
      if (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') {
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
      // Gửi thông báo cho user
      let notification;
      if (paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') {
        // Thanh toán thành công ngay
        notification = await Notification.create({
          title: 'Thanh toán thành công',
          content: `Đơn hàng của bạn đã được thanh toán thành công. Cảm ơn bạn đã mua hàng!`,
          type: 'success',
          receiver: userId,
          icon: 'credit-card',
          meta: { link: `/orders/${order._id}` }
        });
      } else {
        // Đơn hàng đã được tạo, chờ thanh toán
        notification = await Notification.create({
          title: 'Đơn hàng đã được tạo',
          content: `Đơn hàng #${order._id} đã được tạo thành công. Vui lòng hoàn thành thanh toán để truy cập khóa học.`,
          type: 'info',
          receiver: userId,
          icon: 'shopping-cart',
          meta: { link: `/orders/${order._id}` }
        });
      }
      
      const io = req.app.get && req.app.get('io');
      if (io && notification.receiver) {
        io.to(notification.receiver.toString()).emit('new-notification', notification);
      }
      return res.status(201).json({
        success: true,
        message: paymentMethod === 'wallet' || paymentMethod === 'bank_transfer' 
          ? 'Tạo đơn hàng và thanh toán thành công' 
          : 'Tạo đơn hàng thành công',
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

      // Cộng tiền vào ví giáo viên cho từng khóa học trong đơn hàng
      for (const item of order.items) {
        const course = await Course.findById(item.courseId);
        if (!course) {
          console.log('Không tìm thấy course:', item.courseId);
          continue;
        }
        if (!course.instructor) {
          console.log('Course không có instructor:', course._id);
          continue;
        }
        // Lấy InstructorProfile
        const instructorProfile = await InstructorProfile.findById(course.instructor);
        if (!instructorProfile) {
          console.log('Không tìm thấy InstructorProfile:', course.instructor);
          continue;
        }
        if (!instructorProfile.user) {
          console.log('InstructorProfile không có user:', instructorProfile._id);
          continue;
        }
        // Tìm hoặc tạo ví giáo viên
        let wallet = await TeacherWallet.findOne({ teacherId: instructorProfile.user });
        if (!wallet) {
          wallet = new TeacherWallet({ teacherId: instructorProfile.user, balance: 0, history: [] });
        }
        // Giáo viên nhận 40% giá gốc, không bị ảnh hưởng bởi voucher
        const earning = Math.round(course.price * 0.7 * (item.quantity || 1));
        wallet.balance += earning;
        wallet.history.push({
          type: 'earning',
          amount: earning,
          orderId: order._id,
          note: `Bán khóa học: ${course.title} (70% giá gốc)`
        });
        await wallet.save();
        console.log(`Đã cộng ${earning} vào ví giáo viên ${instructorProfile.user} cho khóa học ${course.title}`);
      }

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

  static async getOrders(req, res) {
    try {
      const { page = 1, pageSize = 100 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      // Lấy roleName từ user
      const roleName = req.user?.role_id?.name;

      // Nếu là admin thì lấy tất cả, còn lại thì chỉ lấy đơn hàng của user đó
      let query = {};
      if (roleName !== 'admin') {
        query.userId = req.user._id;
      }

      // Đếm tổng số đơn hàng khớp
      const total = await Order.countDocuments(query);

      // Truy vấn danh sách đơn hàng với phân trang
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'items.courseId',
          select: 'title thumbnail',
        })
        .populate({
          path: 'voucherId',
          select: 'title code',
        });

      res.json({
        orders,
        pagination: {
          current: parseInt(page),
          total,
          pageSize: limit,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: error.message });
    }
  }

  // Hoàn tiền 70% chi phí vào ví user nếu đơn hàng chứa courseId và mua dưới 7 ngày, chưa hoàn tiền trước đó
  static async refundOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params; // orderId
      const { courseId } = req.body;
      const userId = req.user.id;
      if (!id || !courseId) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc courseId' });
      }
      // Tìm đơn hàng
      const order = await Order.findOne({ _id: id, userId }).session(session);
      if (!order) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      }
      // Kiểm tra đơn hàng có chứa khóa học này không
      const item = order.items.find(i => String(i.courseId) === String(courseId));
      if (!item) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Đơn hàng không chứa khóa học này' });
      }
      // Kiểm tra đã hoàn tiền chưa (dựa vào refundedAt hoặc status)
      if (order.status === 'refunded' || order.refundedAt) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Đơn hàng đã hoàn tiền trước đó' });
      }
      // Kiểm tra thời gian mua
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Đã quá thời gian hoàn tiền (7 ngày)' });
      }
      // Tính số tiền hoàn lại (70% giá đã trả cho khóa học này)
      const refundAmount = Math.round(item.price * 0.7 * (item.quantity || 1));
      // Cộng tiền vào ví user
      let wallet = await UserWallet.findOne({ userId }).session(session);
      if (!wallet) {
        wallet = new UserWallet({ userId, balance: 0, history: [] });
      }
      wallet.balance += refundAmount;
      wallet.history.push({
        type: 'deposit',
        amount: refundAmount,
        method: 'refund',
        status: 'approved',
        note: `Hoàn tiền 70% cho khóa học ${courseId} từ đơn hàng ${id}`,
        createdAt: new Date()
      });
      await wallet.save({ session });
      // Đánh dấu đơn hàng đã hoàn tiền (nếu chỉ hoàn cho 1 khóa học, có thể cần flag riêng)
      order.status = 'refunded';
      order.refundedAt = new Date();
      await order.save({ session });

      // Xóa enrollment của user với khóa học này
      const Enrollment = require('../models/Enrollment');
      await Enrollment.deleteOne({ student: userId, course: courseId }).session(session);

      await session.commitTransaction();
      return res.json({ success: true, message: 'Hoàn tiền thành công', refundAmount });
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).json({ success: false, message: 'Lỗi hoàn tiền', error: err.message });
    }
  }

  // Xử lý callback thanh toán Momo cho đơn hàng
  static async handleMomoOrderCallback(req, res) {
    try {
      console.log('Momo order callback received:', {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        body: req.body
      });

      // Momo gửi callback qua query parameters
      const resultCode = req.query.resultCode || req.body.resultCode;
      const message = req.query.message || req.body.message;
      const orderId = req.query.orderId || req.body.orderId;
      const amount = req.query.amount || req.body.amount;
      const transId = req.query.transId || req.body.transId;

      console.log('Momo order callback params:', { 
        resultCode, 
        message, 
        orderId, 
        amount, 
        transId 
      });

      // Kiểm tra nếu không có orderId
      if (!orderId) {
        console.log('No orderId provided in Momo order callback');
        return res.status(400).json({ success: false, message: 'Thiếu orderId' });
      }

      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({ 
        _id: orderId,
        paymentMethod: 'momo'
      });

      if (!order) {
        console.log('Order not found for orderId:', orderId);
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      console.log('Found order:', { orderId: order._id, status: order.status, paymentStatus: order.paymentStatus });

      // Xử lý kết quả thanh toán
      if (resultCode === '0' || resultCode === 0) {
        // Thành công - cập nhật trạng thái đơn hàng
        if (order.status === 'pending' && order.paymentStatus === 'pending') {
          order.status = 'paid';
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
          order.transactionId = transId;
          await order.save();

          console.log('Order payment completed successfully:', { orderId: order._id, transId });

          // Tạo enrollment cho tất cả khóa học trong đơn hàng
          const enrollments = [];
          for (const item of order.items) {
            // Kiểm tra xem user đã enrollment khóa học này chưa
            const existingEnrollment = await Enrollment.findOne({
              student: order.userId,
              course: item.courseId
            });

            if (!existingEnrollment) {
              enrollments.push({
                student: order.userId,
                course: item.courseId,
                enrolledAt: new Date(),
                progress: 0,
                completedLessons: [],
                lastAccessedAt: new Date()
              });
            }
          }

          if (enrollments.length > 0) {
            await Enrollment.insertMany(enrollments);
            console.log('Created enrollments for order:', enrollments.length);
          }

          // Cộng tiền vào ví giáo viên cho từng khóa học trong đơn hàng
          for (const item of order.items) {
            const course = await Course.findById(item.courseId);
            if (!course || !course.instructor) continue;
            
            const instructorProfile = await InstructorProfile.findById(course.instructor);
            if (!instructorProfile || !instructorProfile.user) continue;
            
            let wallet = await TeacherWallet.findOne({ teacherId: instructorProfile.user });
            if (!wallet) {
              wallet = new TeacherWallet({ teacherId: instructorProfile.user, balance: 0, history: [] });
            }
            
            // Giáo viên nhận 70% giá gốc
            const earning = Math.round(course.price * 0.7 * (item.quantity || 1));
            wallet.balance += earning;
            wallet.history.push({
              type: 'earning',
              amount: earning,
              orderId: order._id,
              note: `Bán khóa học: ${course.title} (70% giá gốc)`
            });
            await wallet.save();
          }

          // Ghi nhận voucher usage nếu có
          if (order.voucherId) {
            await VoucherUsage.findOneAndUpdate(
              { userId: order.userId, voucherId: order.voucherId },
              { orderId: order._id },
              { upsert: true }
            );

            // Tăng usedCount cho voucher
            await Voucher.findByIdAndUpdate(order.voucherId, {
              $inc: { usedCount: 1 }
            });
          }

          // Xoá item đã mua khỏi giỏ hàng
          const cart = await Cart.findOne({ user: order.userId });
          if (cart) {
            const courseIds = order.items.map(item => item.courseId.toString());
            cart.items = cart.items.filter(item => !courseIds.includes(item.course.toString()));
            await cart.save();
          }

          // Gửi notification cho user
          try {
            await Notification.create({
              title: 'Thanh toán thành công',
              content: `Đơn hàng #${order._id} đã được thanh toán thành công. Bạn có thể truy cập khóa học ngay bây giờ.`,
              type: 'success',
              receiver: order.userId,
              icon: 'check-circle',
              meta: { orderId: order._id, link: '/profile/orders' }
            });
          } catch (notiErr) {
            console.error('Lỗi tạo notification thanh toán:', notiErr);
          }

          res.json({ 
            success: true, 
            message: 'Thanh toán thành công',
            orderId: order._id,
            status: 'paid'
          });
        } else {
          console.log('Order already processed:', { orderId: order._id, status: order.status });
          res.json({ 
            success: true, 
            message: 'Đơn hàng đã được xử lý trước đó',
            orderId: order._id,
            status: order.status
          });
        }
      } else {
        // Thất bại - cập nhật trạng thái đơn hàng
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        order.cancelledAt = new Date();
        order.cancelReason = message || 'Thanh toán thất bại';
        await order.save();

        console.log('Order payment failed:', { orderId: order._id, resultCode, message });

        // Gửi notification cho user
        try {
          await Notification.create({
            title: 'Thanh toán thất bại',
            content: `Đơn hàng #${order._id} thanh toán thất bại. Vui lòng thử lại.`,
            type: 'error',
            receiver: order.userId,
            icon: 'close-circle',
            meta: { orderId: order._id, link: '/profile/orders' }
          });
        } catch (notiErr) {
          console.error('Lỗi tạo notification thanh toán thất bại:', notiErr);
        }

        res.json({ 
          success: false, 
          message: 'Thanh toán thất bại',
          orderId: order._id,
          status: 'cancelled'
        });
      }
    } catch (err) {
      console.error('handleMomoOrderCallback error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi xử lý callback thanh toán đơn hàng', 
        error: err.message 
      });
    }
  }
}

module.exports = OrderController;
