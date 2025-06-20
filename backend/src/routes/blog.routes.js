const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { auth } = require('../middlewares/auth');

// CRUD
router.post('/', auth, upload.single('image'), blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.patch('/:id/publish', blogController.publishBlog);
router.patch('/:id/approve-reject', blogController.approveOrRejectBlog);

// Like/Unlike
router.post('/:id/like', auth, blogController.likeBlog);
router.post('/:id/unlike', auth, blogController.unlikeBlog);

// Comment/Reply
router.post('/:id/comment', auth, blogController.commentBlog);
router.post('/comment/:commentId/reply', auth, blogController.replyComment);
router.get('/:id/comments', blogController.getBlogComments);

// Lấy tất cả blog status: pending
router.get('/pending/all', blogController.getAllPendingBlogs);
// Lấy tất cả blog status: approved
router.get('/approved/all', blogController.getAllApprovedBlogs);

// New route
router.get('/comments/all', blogController.getAllComments);

module.exports = router; 