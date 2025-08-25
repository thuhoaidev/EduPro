const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogSave = require('../models/BlogSave');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const getUserId = require('../utils/getUserId');
const leoProfanity = require('leo-profanity');
leoProfanity.add(['địt', 'cặc', 'lồn', 'đụ', 'đéo', 'dcm', 'dm', 'dmm', 'vãi', 'rape']);
const Notification = require('../models/Notification');

// === BLOG ===
const createBlog = async (req, res) => {
  try {
    let imageUrl = '';
    let coverImageUrl = '';
    
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'blog-images');
      imageUrl = result.secure_url;
    }
    
    if (req.files && req.files.coverImage) {
      const result = await uploadBufferToCloudinary(req.files.coverImage[0].buffer, 'blog-cover-images');
      coverImageUrl = result.secure_url;
    }
    
    const { title, content, category, status } = req.body;
    const author = getUserId(req);
    if (!author) return res.status(400).json({ success: false, message: 'Thiếu tác giả!' });
    
    if (!coverImageUrl) {
      return res.status(400).json({ success: false, message: 'Ảnh bìa là bắt buộc!' });
    }

    const blog = new Blog({
      title,
      content,
      coverImage: coverImageUrl,
      image: imageUrl,
      category,
      status: status || 'pending',
      author,
      approved_by: author,
    });

    await blog.save();
    // Gửi thông báo global khi có bài viết mới
    const notification = await Notification.create({
      title: 'Bài viết mới',
      content: `Bài viết "${blog.title}" đã được đăng tải và chờ duyệt.`,
      type: 'info',
      is_global: true,
      icon: 'file-text',
      meta: { link: `/blogs/${blog._id}` }
    });
    const io = req.app.get && req.app.get('io');
    if (io) {
      io.emit('new-notification', notification); // emit global
    }
    res.status(201).json({ success: true, message: 'Bài viết đã gửi và chờ duyệt.', data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo blog', error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const author = getUserId(req);
    const query = { status: 'approved' };

    const blogs = await Blog.find()
      .populate('author', 'fullname avatar nickname')
      .sort({ createdAt: -1 });
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
        isSaved: blog.saves?.some(id => id.toString() === author?.toString()),
        save_count: blog.saves?.length || 0,
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

    // Gắn isLiked, likes_count, comments_count và gán image nếu thiếu
    const result = blogs.map(blog => {
      if (!blog.image) {
        const match = blog.content.match(/!\[.*?\]\((.*?)\)/);
        if (match && match[1]) {
          blog.image = match[1]; // Gán ảnh đầu tiên trong content markdown
        }
      }

      return {
        ...blog,
        isLiked: likedBlogIds.includes(blog._id.toString()),
        likes_count: blog.likes_count || 0,
        comments_count: blog.comments_count || 0,
      };
    });

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
        likes_count: blog.likes_count,
      });
    } else {
      await BlogLike.create({ blog: blogObjectId, user: userObjectId });
      blog.likes_count += 1;
      await blog.save();
      return res.json({
        success: true,
        liked: true,
        message: 'Đã thả tim.',
        likes_count: blog.likes_count,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
    }

    if (leoProfanity.check(content)) {
      return res.status(400).json({ success: false, message: 'Bình luận chứa ngôn từ không phù hợp!' });
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
    if (leoProfanity.check(content)) {
      return res.status(400).json({ success: false, message: 'Bình luận chứa ngôn từ không phù hợp!' });
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'ID bình luận không hợp lệ.' });
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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID blog không hợp lệ.' });
  }
  try {
    // Lấy comment cha và populate replies nhiều cấp (chỉ lấy comments không bị ẩn)
    let comments = await BlogComment.find({ blog: id, parent: null, status: { $ne: 'hidden' } })
      .populate('author', 'fullname nickname email avatar')
      .populate({ 
        path: 'replies', 
        match: { status: { $ne: 'hidden' } }, // Chỉ lấy replies không bị ẩn
        populate: { path: 'author', select: 'fullname nickname email avatar' } 
      })
      .sort({ createdAt: -1 })
      .lean();
    // Đệ quy populate replies sâu
    const populateReplies = async (commentArr) => {
      for (let c of commentArr) {
        if (c.replies && c.replies.length) {
          c.replies = await BlogComment.populate(c.replies, [
            { path: 'author', select: 'fullname nickname email avatar' },
            { path: 'replies', populate: { path: 'author', select: 'fullname nickname email avatar' } }
          ]);
          await populateReplies(c.replies);
        }
      }
    };
    await populateReplies(comments);
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy bình luận', error: error.message });
  }
};


const getAllComments = async (req, res) => {
  try {
    const comments = await BlogComment.find({}) // Lấy tất cả comments cho admin/moderator
      .populate('author', 'fullname nickname email avatar')
      .populate('blog', 'title')
      .select('content author blog createdAt status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bình luận', error: error.message });
  }
};

// API riêng cho client - chỉ lấy comments không bị ẩn
const getPublicComments = async (req, res) => {
  try {
    const comments = await BlogComment.find({ status: { $ne: 'hidden' } })
      .populate('author', 'fullname nickname email avatar')
      .populate('blog', 'title')
      .select('content author blog createdAt status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bình luận', error: error.message });
  }
};

// === SAVE ===
const toggleSavePost = async (req, res) => {
  try {
    const userId = getUserId(req);
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
    }

    const existed = await BlogSave.findOne({ user: userId, blog: blogId });

    if (existed) {
      // BỎ LƯU
      await BlogSave.deleteOne({ _id: existed._id });
      await Blog.findByIdAndUpdate(blogId, { $pull: { saves: userId } }); // ❗ cập nhật field saves[]
      return res.json({ success: true, saved: false, message: 'Đã bỏ lưu bài viết.' });
    } else {
      // LƯU MỚI
      await BlogSave.create({ user: userId, blog: blogId });
      await Blog.findByIdAndUpdate(blogId, { $addToSet: { saves: userId } }); // ❗ cập nhật field saves[]
      return res.json({ success: true, saved: true, message: 'Đã lưu bài viết.' });
    }
  } catch (error) {
    console.error('❌ Lỗi toggleSavePost:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu/bỏ lưu blog', error: error.message });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'User ID không hợp lệ.' });
    }

    // Lấy danh sách blog đã lưu
    const savedPosts = await BlogSave.find({ user: userId })
      .populate({
        path: 'blog',
        populate: { path: 'author', select: 'fullname avatar nickname' }
      });

    const validPosts = [];
    const blogIds = [];

    for (const post of savedPosts) {
      if (post.blog && mongoose.Types.ObjectId.isValid(post.blog._id)) {
        validPosts.push(post);
        blogIds.push(post.blog._id);
      }
    }

    // Xoá những bản ghi lỗi
    const invalidIds = savedPosts
      .filter(p => !p.blog || !mongoose.Types.ObjectId.isValid(p.blog._id))
      .map(p => p._id);
    if (invalidIds.length > 0) {
      await BlogSave.deleteMany({ _id: { $in: invalidIds } });
    }

    // Lấy danh sách blog đã like
    const likedBlogs = await BlogLike.find({ user: userId, blog: { $in: blogIds } }).select('blog');
    const likedBlogIds = likedBlogs.map(like => like.blog.toString());

    // Xử lý kết quả
    const result = validPosts.map(post => {
      const blog = post.blog.toObject();

      // 🔥 FIX: nếu không có image => lấy ảnh đầu tiên trong markdown content
      if (!blog.image) {
        const match = blog.content?.match(/!\[.*?\]\((.*?)\)/);
        if (match && match[1]) {
          blog.image = match[1];
        }
      }

      blog.isLiked = likedBlogIds.includes(blog._id.toString());
      blog.save_count = blog.saves?.length || 0;
      blog.likes_count = blog.likes_count || 0;
      blog.comments_count = blog.comments_count || 0;

      return { ...post.toObject(), blog };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Lỗi khi lấy bài viết đã lưu:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
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
    // Cho phép thay đổi trạng thái giữa pending, approved, rejected
    if (!['pending', 'rejected', 'approved'].includes(blog.status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái blog không hợp lệ.' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
    }
    const approverId = getUserId(req);
    if (status === 'rejected') {
      // Cập nhật trạng thái thành rejected thay vì xóa
      blog.status = 'rejected';
      blog.approved_by = approverId || null;
      blog.rejected_reason = rejected_reason || '';
      await blog.save();
      return res.json({ success: true, message: 'Đã từ chối blog.', data: blog });
    }
    blog.status = status;
    blog.approved_by = approverId || null;
    blog.rejected_reason = '';
    await blog.save();

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái: ${status}`,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi duyệt blog', error: error.message });
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
      .populate('author', 'fullname nickname email avatar')
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
const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = getUserId(req);
    const { title, content, category, thumbnail, status, excerpt, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    // Chỉ tác giả hoặc admin được quyền cập nhật
    if (
      blog.author.toString() !== userId &&
      !(req.user.roles || []).includes('admin')
    ) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật bài viết này.' });
    }

    // Xử lý coverImage nếu có
    let coverImageUrl = blog.coverImage;
    if (req.files && req.files.coverImage) {
      const result = await uploadBufferToCloudinary(req.files.coverImage[0].buffer, 'blog-cover-images');
      coverImageUrl = result.secure_url;
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.coverImage = coverImageUrl;
    blog.thumbnail = thumbnail || blog.thumbnail;
    blog.excerpt = excerpt || blog.excerpt;
    blog.tags = tags || blog.tags;
    blog.status = status || blog.status;

    await blog.save();

    res.json({ success: true, message: 'Cập nhật bài viết thành công.', data: blog });
  } catch (error) {
    console.error('❌ Lỗi cập nhật blog:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bài viết.', error: error.message });
  }
};

const publishBlog = async (req, res) => res.status(501).json({ success: false, message: 'Chưa triển khai.' });
// === ADMIN GET ALL ===
const getAllPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname avatar nickname email')
      .lean();

    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy blog pending', error: error.message });
  }
};

const getAllApprovedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname avatar nickname email')
      .lean();

    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy blog approved', error: error.message });
  }
};

// === COMMENT LIKE ===
const checkCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = getUserId(req);
    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ liked: false, message: 'ID không hợp lệ' });
    }
    const comment = await BlogComment.findById(commentId);
    if (!comment) return res.status(404).json({ liked: false, message: 'Không tìm thấy bình luận' });
    const liked = (comment.likes || []).some(id => id.toString() === userId.toString());
    res.json({ liked });
  } catch (err) {
    res.status(500).json({ liked: false, message: 'Lỗi kiểm tra like', error: err.message });
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = getUserId(req);
    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ liked: false, message: 'ID không hợp lệ' });
    }
    const comment = await BlogComment.findById(commentId);
    if (!comment) return res.status(404).json({ liked: false, message: 'Không tìm thấy bình luận' });
    let liked = false;
    if (!comment.likes) comment.likes = [];
    if (comment.likes.some(id => id.toString() === userId.toString())) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      liked = false;
    } else {
      comment.likes.push(userId);
      liked = true;
    }
    await comment.save();
    res.json({ liked });
  } catch (err) {
    res.status(500).json({ liked: false, message: 'Lỗi toggle like', error: err.message });
  }
};

const countCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ count: 0, message: 'ID không hợp lệ' });
    }
    const comment = await BlogComment.findById(commentId);
    if (!comment) return res.status(404).json({ count: 0, message: 'Không tìm thấy bình luận' });
    res.json({ count: (comment.likes || []).length });
  } catch (err) {
    res.status(500).json({ count: 0, message: 'Lỗi đếm like', error: err.message });
  }
};
// === EXPORT ===
module.exports = {
  createBlog,
  getAllBlogs,
  toggleLikeBlog,
  commentBlog,
  replyComment,
  getBlogComments,
  getAllComments,
  getPublicComments,
  toggleSavePost,
  getSavedPosts,
  approveOrRejectBlog,
  getAllPendingBlogs,
  getAllApprovedBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getMyPosts,
  publishBlog,
  checkCommentLike,
  toggleCommentLike,
  countCommentLike
};