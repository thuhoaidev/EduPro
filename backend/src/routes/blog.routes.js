const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { auth } = require('../middlewares/auth');

// === CRUD BLOG ===
router.post('/', auth, upload.single('image'), blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.patch('/:id/publish', blogController.publishBlog);
router.patch('/:id/approve-reject', blogController.approveOrRejectBlog);

// === ADMIN ===
router.get('/pending/all', blogController.getAllPendingBlogs);
router.get('/approved/all', blogController.getAllApprovedBlogs);
router.get('/comments/all', blogController.getAllComments);

// === SAVE ===
router.get('/saved-posts', auth, blogController.getSavedPosts);
router.post('/:id/save', auth, blogController.savePost);
router.delete('/:id/unsave', auth, blogController.unsavePost);

// === LIKE (DÙNG TOGGLE DUY NHẤT) ===
router.post('/:id/like', auth, blogController.toggleLikeBlog);

// === COMMENT ===
router.post('/:id/comment', auth, blogController.commentBlog);
router.get('/:id/comments', blogController.getBlogComments);
router.post('/comment/:commentId/reply', auth, blogController.replyComment);

module.exports = router;
