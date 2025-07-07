const express = require('express');
const { auth } = require('../middlewares/auth');
const Cart = require('../models/Cart');
const Course = require('../models/Course');
const router = express.Router();
const mongoose = require('mongoose');

// Helper function để tính toán tổng giá trị giỏ hàng
const calculateCartTotal = (items) => {
  return items.reduce((total, item) => total + (item.priceAtAddition || 0), 0);
};

// Helper function tính giá sau discount
const calculateFinalPrice = (price, discount) => {
  return price * (1 - discount / 100);
};

// @desc    Lấy giỏ hàng
// @route   GET /api/carts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.course',
        select: 'title price discount thumbnail instructor slug',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });

    if (!cart) {
      return res.json({ 
        success: true,
        items: [],
        total: 0,
        itemCount: 0
      });
    }

    const total = calculateCartTotal(cart.items);

    res.json({
      success: true,
      items: cart.items.map(item => ({
        _id: item._id,
        course: {
          _id: item.course._id,
          title: item.course.title,
          price: item.course.price,
          discount: item.course.discount,
          finalPrice: item.priceAtAddition,
          thumbnail: item.course.thumbnail,
          slug: item.course.slug,
          instructor: item.course.instructor
        },
        addedAt: item.addedAt
      })),
      total,
      itemCount: cart.items.length
    });
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi lấy giỏ hàng'
    });
  }
});

// @desc    Thêm khóa học vào giỏ hàng
// @route   POST /api/carts
// @access  Private
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // 1. Kiểm tra khóa học
    const course = await Course.findById(courseId).session(session);
    
    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Khóa học không tồn tại'
      });
    }

    // 2. Tính giá cuối cùng với discount
    const finalPrice = calculateFinalPrice(course.price, course.discount || 0);

    // 3. Thêm vào giỏ hàng
    let cart = await Cart.findOne({ user: userId }).session(session);
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ 
          course: courseId,
          priceAtAddition: finalPrice 
        }]
      });
    } else {
      // Kiểm tra nếu đã có trong giỏ hàng
      const itemExists = cart.items.some(item => 
        item.course.toString() === courseId
      );
      
      if (itemExists) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: 'Khóa học đã có trong giỏ hàng'
        });
      }
      
      cart.items.push({ 
        course: courseId,
        priceAtAddition: finalPrice 
      });
    }

    await cart.save({ session });
    await session.commitTransaction();
    
    const populatedCart = await cart.populate({
      path: 'items.course',
      select: 'title price discount thumbnail slug'
    });

    res.status(201).json({
      success: true,
      data: {
        cartId: cart._id,
        item: {
          _id: populatedCart.items[populatedCart.items.length - 1]._id,
          course: {
            _id: course._id,
            title: course.title,
            price: course.price,
            discount: course.discount,
            finalPrice: finalPrice,
            thumbnail: course.thumbnail,
            slug: course.slug
          },
          addedAt: populatedCart.items[populatedCart.items.length - 1].addedAt
        },
        itemCount: populatedCart.items.length
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi thêm vào giỏ hàng'
    });
  } finally {
    session.endSession();
  }
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/carts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const result = await Cart.findOneAndDelete({ user: req.user._id });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy giỏ hàng'
      });
    }

    res.json({
      success: true,
      data: {
        itemCount: 0,
        total: 0
      }
    });

  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi xóa giỏ hàng'
    });
  }
});

// @desc    Xóa nhiều khóa học khỏi giỏ hàng
// @route   DELETE /api/carts/bulk
// @access  Private
router.delete('/bulk', auth, async (req, res) => {
  try {
    const { itemIds } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Danh sách ID sản phẩm không hợp lệ'
      });
    }

    console.log('Bulk deleting items:', itemIds);
    console.log('User ID:', req.user._id);

    // Sử dụng findOneAndUpdate để xóa nhiều items cùng lúc
    const result = await Cart.findOneAndUpdate(
      { 
        user: req.user._id,
        'items._id': { $in: itemIds }
      },
      { 
        $pull: { 
          items: { _id: { $in: itemIds } } 
        } 
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      console.log('Cart not found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy giỏ hàng'
      });
    }

    console.log('Successfully deleted items:', itemIds);
    console.log('Remaining items count:', result.items.length);

    // Populate để lấy thông tin course
    const populatedCart = await result.populate({
      path: 'items.course',
      select: 'title price thumbnail'
    });

    res.json({
      success: true,
      data: {
        deletedCount: itemIds.length,
        itemCount: populatedCart.items.length,
        total: calculateCartTotal(populatedCart.items)
      }
    });

  } catch (err) {
    console.error('Error bulk removing from cart:', err);
    
    // Kiểm tra loại lỗi cụ thể
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Một hoặc nhiều ID sản phẩm không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi xóa khỏi giỏ hàng'
    });
  }
});

// @desc    Xóa khóa học khỏi giỏ hàng
// @route   DELETE /api/carts/:itemId
// @access  Private
router.delete('/:itemId', auth, async (req, res) => {
  try {
    console.log('Deleting cart item:', req.params.itemId);
    console.log('User ID:', req.user._id);

    // Sử dụng findOneAndUpdate thay vì session để tránh race condition
    const result = await Cart.findOneAndUpdate(
      { 
        user: req.user._id,
        'items._id': req.params.itemId 
      },
      { 
        $pull: { 
          items: { _id: req.params.itemId } 
        } 
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      console.log('Cart or item not found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy giỏ hàng hoặc sản phẩm'
      });
    }

    console.log('Successfully deleted item:', req.params.itemId);
    console.log('Remaining items count:', result.items.length);

    // Populate để lấy thông tin course
    const populatedCart = await result.populate({
      path: 'items.course',
      select: 'title price thumbnail'
    });

    res.json({
      success: true,
      data: {
        itemCount: populatedCart.items.length,
        total: calculateCartTotal(populatedCart.items)
      }
    });

  } catch (err) {
    console.error('Error removing from cart:', err);
    
    // Kiểm tra loại lỗi cụ thể
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'ID sản phẩm không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi xóa khỏi giỏ hàng'
    });
  }
});

module.exports = router;