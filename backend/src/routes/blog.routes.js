const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { auth } = require('../middlewares/auth');

// === CRUD BLOG ===
router.post('/', auth, upload.single('image'), blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.get('/my-posts', auth, blogController.getMyPosts);

// === ADMIN ===
router.get('/pending/all', blogController.getAllPendingBlogs);
router.get('/approved/all', blogController.getAllApprovedBlogs);
router.get('/comments/all', blogController.getAllComments);

// === SAVE ===
router.get('/saved-posts', auth, blogController.getSavedPosts);
router.post('/:id/toggle-save', auth, blogController.toggleSavePost);

// === LIKE (DÙNG TOGGLE DUY NHẤT) ===
router.post('/:id/like', auth, blogController.toggleLikeBlog);

// === COMMENT ===
router.post('/:id/comment', auth, blogController.commentBlog);
router.get('/:id/comments', blogController.getBlogComments);
router.post('/comment/:commentId/reply', auth, blogController.replyComment);
// === COMMENT LIKE ===
router.get('/comment-likes/check/:commentId', blogController.checkCommentLike);
router.post('/comment-likes/toggle/:commentId', blogController.toggleCommentLike);
router.get('/comment-likes/count/:commentId', blogController.countCommentLike);
// === CRUD BLOG (PHẢI Ở CUỐI) ===
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', auth, blogController.deleteBlog);
router.patch('/:id/publish', blogController.publishBlog);
router.patch('/:id/approve-reject', blogController.approveOrRejectBlog);

module.exports = router;
