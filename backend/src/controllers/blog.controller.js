const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogSave = require('../models/BlogSave');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const getUserId = require('../utils/getUserId'); 

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
        isSaved: blog.saves?.some(id => id.toString() === author?.toString()),
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
        comments_count: blog.comments_count || 0
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
    }

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
    // ✅ THÊM LOG Ở ĐÂY
  console.log('🧪 userId:', userId);
  console.log('🧪 req.user:', req.user);
  console.log('🧪 req.headers.authorization:', req.headers?.authorization);
console.log('🧪 [getSavedPosts] userId:', userId); // thêm log này
    if (!mongoose.Types.ObjectId.isValid(userId)) {
  return res.status(400).json({ success: false, message: 'User ID không hợp lệ.' }); // ✅ sửa message này
}


    const savedPosts = await BlogSave.find({ user: userId })
      .populate({
        path: 'blog',
        populate: { path: 'author', select: 'fullname avatar' }
      });

    const validPosts = [];
    const invalidIds = [];

    for (const post of savedPosts) {
      if (post.blog && mongoose.Types.ObjectId.isValid(post.blog._id)) {
        validPosts.push(post);
      } else {
        console.warn('🧹 Bài viết lỗi, cần xóa khỏi BlogSave:', post._id);
        invalidIds.push(post._id);
      }
    }

    // 🧹 Xoá bản ghi BlogSave không hợp lệ
    if (invalidIds.length > 0) {
      await BlogSave.deleteMany({ _id: { $in: invalidIds } });
    }

    return res.json({ success: true, data: validPosts });
  } catch (error) {
    console.error('❌ Lỗi khi lấy bài viết đã lưu:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
    }
    const approverId = getUserId(req);
    blog.status = status;
    blog.approved_by = approverId || null;
    blog.rejected_reason = status === 'rejected' ? rejected_reason : '';
    await blog.save();

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái: ${status}`,
      data: blog
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

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
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

// === EXPORT ===
module.exports = {
  createBlog,
  getAllBlogs,
  toggleLikeBlog,
  commentBlog,
  replyComment,
  getBlogComments,
  getAllComments,
  toggleSavePost,
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