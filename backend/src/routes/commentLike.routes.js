const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const commentLikeController = require('../controllers/commentLike.controller');

router.post('/toggle/:commentId', auth, commentLikeController.toggleLikeComment);
router.get('/count/:commentId', commentLikeController.getCommentLikeCount);
router.get('/has-liked/:commentId', auth, commentLikeController.hasLikedComment);

module.exports = router;
