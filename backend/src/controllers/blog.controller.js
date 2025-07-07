const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogSave = require('../models/BlogSave');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

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
  return req.user?.id || req.user?._id;
}

// === BLOG ===
const createBlog = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'blog-images');
      imageUrl = result.secure_url;
    }
    const { title, content, category, status } = req.body;
    const author = getUserId(req);
    if (!author) return res.status(400).json({ success: false, message: 'Thiếu tác giả!' });

    const blog = new Blog({
      title,
      content,
      image: imageUrl,
      category,
      status: status || 'pending',
      author,
      approved_by: author
    });

    await blog.save();
    res.status(201).json({ success: true, message: 'Bài viết đã gửi và chờ duyệt.', data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo blog', error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const author = getUserId(req);
    const query = { status: 'approved' };

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'fullname');

    // === Lấy danh sách blogId mà user đã like
    let likedBlogIds = [];
    if (author) {
      const liked = await BlogLike.find({ user: author }).select('blog');
      likedBlogIds = liked.map(item => item.blog.toString());
    }

    const blogsWithExtras = blogs.map(blog => {
      const blogObj = blog.toObject();
      return {
        ...blogObj,
        isLiked: likedBlogIds.includes(blog._id.toString()),
        save_count: blog.saves?.length || 0
      };
    });

    res.json({ success: true, data: blogsWithExtras });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách blog', error: error.message });
  }
};

// [GET] /api/blogs/my-posts
const getMyPosts = async (req, res) => {
  try {
    const userId = getUserId(req);

    const blogs = await Blog.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname avatar nickname')
      .lean();

    // Danh sách bài đã like
    const liked = await BlogLike.find({ user: userId }).select('blog');
    const likedBlogIds = liked.map(item => item.blog.toString());

    // Gắn isLiked và likes_count
    const result = blogs.map(blog => ({
      ...blog,
      isLiked: likedBlogIds.includes(blog._id.toString()),
      likes_count: blog.likes_count || 0,
      comments_count: blog.comments_count || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy blog cá nhân' });
  }
};


// === LIKE ===
const toggleLikeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userIdRaw = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(blogId) || !mongoose.Types.ObjectId.isValid(userIdRaw)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const userObjectId = new mongoose.Types.ObjectId(userIdRaw);

    const blog = await Blog.findById(blogObjectId);
    if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

    const existed = await BlogLike.findOne({ blog: blogObjectId, user: userObjectId });

    if (existed) {
      await BlogLike.deleteOne({ _id: existed._id });
      blog.likes_count = Math.max(0, blog.likes_count - 1);
      await blog.save();
      return res.json({
        success: true,
        liked: false,
        message: 'Đã bỏ thả tim.',
        likes_count: blog.likes_count
      });
    } else {
      await BlogLike.create({ blog: blogObjectId, user: userObjectId });
      blog.likes_count += 1;
      await blog.save();
      return res.json({
        success: true,
        liked: true,
        message: 'Đã thả tim.',
        likes_count: blog.likes_count
      });
    }

  } catch (error) {
    console.error('❌ Lỗi toggle like:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý like', error: error.message });
  }
};

// === COMMENT ===
const commentBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (containsSensitiveWords(content)) {
      return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
    }
    const userId = getUserId(req);
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });

    const comment = await BlogComment.create({ blog: id, author: userId, content, parent: null });
    blog.comments_count += 1;
    await blog.save();
    res.json({ success: true, message: 'Đã bình luận.', data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi bình luận', error: error.message });
  }
};

const replyComment = async (req, res) => {
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
    const reply = await BlogComment.create({ blog: blog._id, author: userId, content, parent: commentId });
    blog.comments_count += 1;
    await blog.save();
    res.json({ success: true, message: 'Đã trả lời bình luận.', data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi trả lời bình luận', error: error.message });
  }
};

const getBlogComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await BlogComment.find({ blog: id, parent: null })
      .populate('author', 'fullname nickname email')
      .populate({ path: 'replies', populate: { path: 'author', select: 'fullname nickname email' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy bình luận', error: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await BlogComment.find({})
      .populate('author', 'fullname nickname email')
      .populate('blog', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bình luận', error: error.message });
  }
};

// === SAVE ===
const savePost = async (req, res) => {
  try {
    const userId = getUserId(req);
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });

    const existed = await BlogSave.findOne({ user: userId, blog: blogId });
    if (existed) return res.status(400).json({ success: false, message: 'Bạn đã lưu bài viết này rồi.' });

    await BlogSave.create({ user: userId, blog: blogId });
    res.json({ success: true, message: 'Đã lưu bài viết.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lưu blog', error: error.message });
  }
};

const unsavePost = async (req, res) => {
  try {
    const userId = getUserId(req);
    const blogId = req.params.id;
    const existed = await BlogSave.findOne({ user: userId, blog: blogId });
    if (!existed) return res.status(400).json({ success: false, message: 'Bài viết chưa được lưu.' });

    await BlogSave.deleteOne({ _id: existed._id });
    res.json({ success: true, message: 'Đã bỏ lưu bài viết.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi bỏ lưu blog', error: error.message });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = getUserId(req);

    const saved = await BlogSave.find({ user: userId }).populate({
      path: 'blog',
      populate: { path: 'author', select: 'fullname avatar nickname' }
    });

    // Lấy danh sách blogId đã được like
    const liked = await BlogLike.find({ user: userId }).select('blog');
    const likedBlogIds = liked.map(item => item.blog.toString());

    // Gắn thêm isLiked vào mỗi blog đã lưu
    const savedWithLike = saved.map(item => {
      const blog = item.blog.toObject();
      return {
        ...item.toObject(),
        blog: {
          ...blog,
          isLiked: likedBlogIds.includes(blog._id.toString())
        }
      };
    });

    res.json({ success: true, savedPosts: savedWithLike });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy blog đã lưu', error: error.message });
  }
};
// === ADMIN ===
const approveOrRejectBlog = async (req, res) => {
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
    blog.rejected_reason = status === 'rejected' ? rejected_reason : '';
    await blog.save();

    res.json({ success: true, message: `Đã cập nhật trạng thái: ${status}`, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi duyệt blog', error: error.message });
  }
};

const getAllPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' }).populate('author', 'fullname');
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy blog pending', error: error.message });
  }
};

const getAllApprovedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'approved' });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy blog approved', error: error.message });
  }
};

// === PLACEHOLDER ===
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID blog không hợp lệ.' });
    }

    const blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'fullname nickname email')
      .populate('category')
      .lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy blog.' });
    }

    // Gắn thêm isLiked
    if (userId) {
      const existed = await BlogLike.findOne({ blog: id, user: userId });
      blog.isLiked = !!existed;
    } else {
      blog.isLiked = false;
    }

    blog.save_count = blog.saves?.length || 0;

    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    // Kiểm tra quyền: chỉ tác giả hoặc admin mới được xóa
    if (
      blog.author.toString() !== userId &&
      !(req.user.roles || []).includes('admin')
    ) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này.' });
    }

    // Xóa blog
    await Blog.findByIdAndDelete(blogId);

    // Xóa các liên kết phụ
    await BlogComment.deleteMany({ blog: blogId });
    await BlogLike.deleteMany({ blog: blogId });
    await BlogSave.deleteMany({ blog: blogId });

    res.json({ success: true, message: 'Đã xóa bài viết thành công.' });
  } catch (error) {
    console.error('❌ Lỗi khi xóa bài viết:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa bài viết', error: error.message });
  }
};
const updateBlog = async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' });
const publishBlog = async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' });

// === EXPORT ===
module.exports = {
  createBlog,
  getAllBlogs,
  toggleLikeBlog,
  commentBlog,
  replyComment,
  getBlogComments,
  getAllComments,
  savePost,
  unsavePost,
  getSavedPosts,
  approveOrRejectBlog,
  getAllPendingBlogs,
  getAllApprovedBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getMyPosts,
  publishBlog
};


