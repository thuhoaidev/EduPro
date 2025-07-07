const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  priceAtAddition: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }
}, { timestamps: true });

// Đảm bảo mỗi user chỉ có 1 giỏ hàng
cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;