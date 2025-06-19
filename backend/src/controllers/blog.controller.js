const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');

// Danh sách từ nhạy cảm (có thể mở rộng)
const SENSITIVE_WORDS = [
  'sex', 'địt', 'fuck', 'rape', 'vãi', 'dcm', 'cặc', 'lồn', 'dm', 'dmm', 'đụ', 'đéo', 'shit', 'bitch', 'asshole', 'pussy', 'faggot', 'nigger', 'nigga', 'motherfucker', 'cunt'
];

function containsSensitiveWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lower.includes(word));
}

module.exports = {
  // Blog CRUD
  createBlog: async (req, res) => {
    try {
      console.log('req.user:', req.user); // debug
      let imageUrl = '';
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'blog-images');
        imageUrl = result.secure_url;
      }
      const { title, content, category, status } = req.body;
      // Lấy author và approved_by từ user hiện tại
      let author = null;
      let approved_by = null;
      if (req.user) {
        author = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
        approved_by = author;
      }
      if (!author) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin tác giả (token không hợp lệ hoặc backend chưa gán đúng user)!' });
      }
      const blog = new Blog({
        title,
        content,
        image: imageUrl,
        category,
        status: status || 'pending',
        author,
        approved_by: approved_by || null,
      });
      await blog.save();
      res.status(201).json({
        success: true,
        message: 'Bài viết đã gửi đi và đang chờ xét duyệt.',
        data: blog
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi tạo blog', error: error.message });
    }
  },
  getAllBlogs: async (req, res) => {
    try {
      let blogs;
      if (req.user) {
        const author = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
        blogs = await Blog.find({ author, status: 'approved' });
      } else {
        blogs = await Blog.find({ status: 'approved' });
      }
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách blog', error: error.message });
    }
  },
  getBlogById: async (req, res) => {
    res.status(501).json({ success: false, message: 'Chức năng chưa được triển khai.' });
  },
  updateBlog: async (req, res) => {
    res.status(501).json({ success: false, message: 'Chức năng chưa được triển khai.' });
  },
  deleteBlog: async (req, res) => {
    res.status(501).json({ success: false, message: 'Chức năng chưa được triển khai.' });
  },
  publishBlog: async (req, res) => {
    res.status(501).json({ success: false, message: 'Chức năng chưa được triển khai.' });
  },
  approveBlog: async (req, res) => {
    res.status(501).json({ success: false, message: 'Chức năng chưa được triển khai.' });
  },

  // Like/Unlike
  likeBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const userId = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
      }
      // Kiểm tra đã like chưa
      const existed = await BlogLike.findOne({ blog: blogId, user: userId });
      if (existed) {
        return res.status(400).json({ success: false, message: 'Bạn đã thả tim blog này.' });
      }
      await BlogLike.create({ blog: blogId, user: userId });
      blog.likes_count += 1;
      await blog.save();
      res.json({ success: true, message: 'Đã thả tim blog.', likes_count: blog.likes_count });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi thả tim blog', error: error.message });
    }
  },
  unlikeBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const userId = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
      }
      // Kiểm tra đã like chưa
      const existed = await BlogLike.findOne({ blog: blogId, user: userId });
      if (!existed) {
        return res.status(400).json({ success: false, message: 'Bạn chưa thả tim blog này.' });
      }
      await BlogLike.deleteOne({ _id: existed._id });
      blog.likes_count = Math.max(0, blog.likes_count - 1);
      await blog.save();
      res.json({ success: true, message: 'Đã bỏ thả tim blog.', likes_count: blog.likes_count });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi bỏ thả tim blog', error: error.message });
    }
  },

  // Comment/Reply
  commentBlog: async (req, res) => {
    try {
      const { id } = req.params; // blogId
      const { content } = req.body;
      if (containsSensitiveWords(content)) {
        return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
      }
      const userId = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
      }
      const comment = await BlogComment.create({
        blog: id,
        author: userId,
        content,
        parent: null
      });
      blog.comments_count += 1;
      await blog.save();
      res.json({ success: true, message: 'Đã bình luận blog.', data: comment });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi bình luận', error: error.message });
    }
  },
  replyComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      if (containsSensitiveWords(content)) {
        return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
      }
      const userId = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
      const parentComment = await BlogComment.findById(commentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận gốc.' });
      }
      const blog = await Blog.findById(parentComment.blog);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
      }
      const reply = await BlogComment.create({
        blog: blog._id,
        author: userId,
        content,
        parent: commentId
      });
      blog.comments_count += 1;
      await blog.save();
      res.json({ success: true, message: 'Đã trả lời bình luận.', data: reply });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi trả lời bình luận', error: error.message });
    }
  },
  getBlogComments: async (req, res) => {
    try {
      const { id } = req.params; // blogId
      const comments = await BlogComment.find({ blog: id, parent: null })
        .populate('author', 'fullname nickname email')
        .populate({
          path: 'replies',
          populate: { path: 'author', select: 'fullname nickname email' }
        })
        .sort({ createdAt: -1 });
      res.json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy bình luận', error: error.message });
    }
  },

  // Lấy tất cả blog status: pending
  getAllPendingBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'pending' });
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách blog pending', error: error.message });
    }
  },

  // Lấy tất cả blog status: approved
  getAllApprovedBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'approved' });
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách blog approved', error: error.message });
    }
  },

  // Duyệt trạng thái blog (approved hoặc rejected)
  approveOrRejectBlog: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejected_reason } = req.body; // nhận thêm rejected_reason
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ (chỉ approved hoặc rejected)' });
      }
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy blog' });
      }
      if (blog.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Chỉ có thể duyệt blog ở trạng thái pending' });
      }
      let approved_by = null;
      if (req.user) {
        approved_by = req.user._id || req.user.id || (req.user.user && (req.user.user._id || req.user.user.id));
      }
      blog.status = status;
      blog.approved_by = approved_by || null;
      if (status === 'rejected') {
        if (!rejected_reason || rejected_reason.trim() === '') {
          return res.status(400).json({ success: false, message: 'Cần nhập lý do từ chối khi duyệt sang rejected' });
        }
        blog.rejected_reason = rejected_reason;
      } else {
        blog.rejected_reason = '';
      }
      await blog.save();
      res.json({ success: true, message: `Blog đã được cập nhật trạng thái: ${status}`, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi duyệt blog', error: error.message });
    }
  },
}; 