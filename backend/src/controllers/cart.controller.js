const Cart = require('../models/Cart');
const Course = require('../models/Course');
const { NotFoundError, BadRequestError } = require('../errors');
const Notification = require('../models/Notification');

class CartController {
  // [GET] /api/cart - Lấy giỏ hàng của user hiện tại
  static async getCart(req, res) {
    const userId = req.user.id; // Lấy từ middleware auth

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.course',
        select: 'title price discountPrice thumbnail instructor'
      })
      .populate('coupon', 'code discountPercentage');

    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }

    res.json(this.formatCartResponse(cart));
  }

  // [POST] /api/cart/add - Thêm khóa học vào giỏ hàng
  static async addToCart(req, res) {
    const userId = req.user.id;
    const { courseId } = req.body;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Khóa học không tồn tại');

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Kiểm tra khóa học đã có trong giỏ hàng chưa
    const existingItem = cart.items.find(item => item.course.equals(courseId));
    if (existingItem) {
      throw new BadRequestError('Khóa học đã có trong giỏ hàng');
    }

    // Thêm vào giỏ hàng
    cart.items.push({
      course: courseId,
      priceAtAddition: course.discountPrice || course.price
    });

    await cart.save();
    console.log('BẮT ĐẦU tạo notification cho user:', userId);
    // Gửi thông báo cho user
    const notification = await Notification.create({
      title: 'Đã thêm vào giỏ hàng',
      content: `Bạn vừa thêm khóa học "${course.title}" vào giỏ hàng!`,
      type: 'info',
      receiver: userId,
      icon: 'shopping-cart',
      meta: { link: `/cart` }
    });
    console.log('ĐÃ TẠO notification:', notification);
    const io = req.app.get && req.app.get('io');
    if (io && notification.receiver) {
      io.to(notification.receiver.toString()).emit('new-notification', notification);
      console.log('Emit notification realtime tới user:', notification.receiver.toString(), notification);
    }
    res.status(201).json(this.formatCartResponse(cart));
  }

  // [DELETE] /api/cart/remove/:itemId - Xóa item khỏi giỏ hàng
  static async removeFromCart(req, res) {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate('items.course');

    if (!cart) throw new NotFoundError('Giỏ hàng không tồn tại');

    res.json(this.formatCartResponse(cart));
  }

  // Định dạng response thống nhất
  static formatCartResponse(cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.priceAtAddition, 0);
    let discount = 0;

    if (cart.coupon) {
      discount = subtotal * (cart.coupon.discountPercentage / 100);
    }

    return {
      items: cart.items.map(item => ({
        id: item._id,
        course: {
          id: item.course._id,
          title: item.course.title,
          price: item.priceAtAddition,
          thumbnail: item.course.thumbnail
        }
      })),
      summary: {
        subtotal,
        discount,
        total: subtotal - discount,
        itemCount: cart.items.length
      }
    };
  }
}

module.exports = CartController;