const BlogSave = require('../models/BlogSave');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');

const SENSITIVE_WORDS = [
  'sex', 'địt', 'fuck', 'rape', 'vãi', 'dcm', 'cặc', 'lồn', 'dm', 'dmm',
  'đụ', 'đéo', 'shit', 'bitch', 'asshole', 'pussy', 'faggot', 'nigger',
  'nigga', 'motherfucker', 'cunt'
];

function containsSensitiveWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lower.includes(word));
}

function getUserId(req) {
  return req.user?._id || req.user?.id || req.user?.user?._id || req.user?.user?.id;
}

module.exports = {
  // Tạo blog
  createBlog: async (req, res) => {
    try {
      let imageUrl = '';
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'blog-images');
        imageUrl = result.secure_url;
      }
      const { title, content, category, status } = req.body;
      const author = getUserId(req);
      if (!author) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin tác giả!' });
      }

      const blog = new Blog({
        title,
        content,
        image: imageUrl,
        category,
        status: status || 'pending',
        author,
        approved_by: author,
      });

      await blog.save();
      res.status(201).json({
        success: true,
        message: 'Bài viết đã gửi và chờ duyệt.',
        data: blog
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi tạo blog', error: error.message });
    }
  },

  // Lấy danh sách blog đã duyệt
  getAllBlogs: async (req, res) => {
    try {
      const author = getUserId(req);
      const query = author ? { author, status: 'approved' } : { status: 'approved' };
      const blogs = await Blog.find(query);
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách blog', error: error.message });
    }
  },

  // Like blog
  likeBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const userId = getUserId(req);
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

      const existed = await BlogLike.findOne({ blog: blogId, user: userId });
      if (existed) return res.status(400).json({ success: false, message: 'Bạn đã thả tim.' });

      await BlogLike.create({ blog: blogId, user: userId });
      blog.likes_count += 1;
      await blog.save();
      res.json({ success: true, message: 'Đã thả tim.', likes_count: blog.likes_count });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi thả tim', error: error.message });
    }
  },

  // Unlike blog
  unlikeBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const userId = getUserId(req);
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

      const existed = await BlogLike.findOne({ blog: blogId, user: userId });
      if (!existed) return res.status(400).json({ success: false, message: 'Bạn chưa thả tim blog này.' });

      await BlogLike.deleteOne({ _id: existed._id });
      blog.likes_count = Math.max(0, blog.likes_count - 1);
      await blog.save();
      res.json({ success: true, message: 'Đã bỏ thả tim.', likes_count: blog.likes_count });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi bỏ thả tim', error: error.message });
    }
  },

  // Bình luận blog
  commentBlog: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (containsSensitiveWords(content)) {
        return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
      }
      const userId = getUserId(req);
      const blog = await Blog.findById(id);
      if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

      const comment = await BlogComment.create({
        blog: id,
        author: userId,
        content,
        parent: null
      });
      blog.comments_count += 1;
      await blog.save();
      res.json({ success: true, message: 'Đã bình luận.', data: comment });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi bình luận', error: error.message });
    }
  },

  // Trả lời bình luận
  replyComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      if (containsSensitiveWords(content)) {
        return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
      }
      const userId = getUserId(req);
      const parentComment = await BlogComment.findById(commentId);
      if (!parentComment) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận gốc.' });

      const blog = await Blog.findById(parentComment.blog);
      if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

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

  // Lấy tất cả bình luận blog
  getBlogComments: async (req, res) => {
    try {
      const { id } = req.params;
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

  // Lấy blog đã lưu
  getSavedPosts: async (req, res) => {
    try {
      const userId = getUserId(req);
      const saved = await BlogSave.find({ user: userId }).populate({
        path: 'blog',
        populate: [{ path: 'author', select: 'fullname' }, { path: 'category' }]
      });
      const blogs = saved.map(item => item.blog);
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy blog đã lưu', error: error.message });
    }
  },

  // Lưu bài viết
  savePost: async (req, res) => {
    try {
      const userId = getUserId(req);
      const blogId = req.params.id;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
      }

      const existed = await BlogSave.findOne({ user: userId, blog: blogId });
      if (existed) {
        return res.status(400).json({ success: false, message: 'Bạn đã lưu bài viết này rồi.' });
      }

      await BlogSave.create({ user: userId, blog: blogId });
      res.json({ success: true, message: 'Đã lưu bài viết.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi lưu blog', error: error.message });
    }
  },

  // Bỏ lưu bài viết
  unsavePost: async (req, res) => {
    try {
      const userId = getUserId(req);
      const blogId = req.params.id;

      const existed = await BlogSave.findOne({ user: userId, blog: blogId });
      if (!existed) {
        return res.status(400).json({ success: false, message: 'Bài viết chưa được lưu.' });
      }

      await BlogSave.deleteOne({ _id: existed._id });
      res.json({ success: true, message: 'Đã bỏ lưu bài viết.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi bỏ lưu blog', error: error.message });
    }
  },

  // Các hàm chưa triển khai
  getBlogById: async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' }),
  updateBlog: async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' }),
  deleteBlog: async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' }),
  publishBlog: async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' }),

  // Duyệt blog
  approveOrRejectBlog: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejected_reason } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
      }

      const blog = await Blog.findById(id);
      if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
      if (blog.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Chỉ duyệt blog pending.' });
      }

      const approverId = getUserId(req);
      blog.status = status;
      blog.approved_by = approverId || null;
      if (status === 'rejected') {
        if (!rejected_reason || rejected_reason.trim() === '') {
          return res.status(400).json({ success: false, message: 'Cần lý do từ chối.' });
        }
        blog.rejected_reason = rejected_reason;
      } else {
        blog.rejected_reason = '';
      }

      await blog.save();
      res.json({ success: true, message: `Đã cập nhật trạng thái: ${status}`, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi duyệt blog', error: error.message });
    }
  },

  // Lấy tất cả bình luận
  getAllComments: async (req, res) => {
    try {
      const comments = await BlogComment.find({})
        .populate('author', 'fullname nickname email')
        .populate('blog', 'title')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bình luận', error: error.message });
    }
  },

  getAllPendingBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'pending' }).populate('author', 'fullname');
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy blog pending', error: error.message });
    }
  },

  getAllApprovedBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'approved' });
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy blog approved', error: error.message });
    }
  },
};
