const express = require('express');
const router = express.Router();
const commentLikeController = require('../controllers/commentLike.controller');
const { auth } = require('../middlewares/auth');

// Toggle like / unlike cho comment
router.post('/toggle/:id', auth, commentLikeController.toggleLike);

// Kiểm tra user đã like comment chưa
router.get('/check/:id', auth, commentLikeController.checkLiked);

// Đếm số lượng like của comment
router.get('/count/:id', commentLikeController.countLikes);

module.exports = router;
