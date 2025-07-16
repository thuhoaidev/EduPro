import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  User,
  Calendar,
  Eye,
  ArrowLeft,
  Reply,
  Bookmark,
  BookmarkCheck,
  Share2,
  ThumbsUp,
  MoreHorizontal,
  Search,
  Filter,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';
import { Pagination } from 'antd';
import CommentItem from '../../components/CommentItem';
const API_BASE = 'http://localhost:5000/api';

const axiosClient = {
  get: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'GET failed');
    }

    return json;
  },

 post: async (url: string, data: any) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });

  let json = {};
  try {
    json = await res.json(); // ⬅ vẫn parse body JSON kể cả khi status !== 200
  } catch (_) {}

  if (!res.ok) {
    // ✅ Trả về object vẫn chứa message thay vì throw luôn
    return json; // ví dụ: { success: false, message: 'Bạn đã lưu bài viết này rồi.' }
  }

  return json;
},

};

const parseMarkdownToText = (markdown: string): string => {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // Bỏ ảnh markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Bỏ link
    .replace(/[#*_`~]/g, '') // Bỏ các ký tự markdown
    .replace(/\n+/g, ' ') // Bỏ newline
    .trim();
};

const BlogPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedBlogs, setSavedBlogs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [commentLikesCount, setCommentLikesCount] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const commentEndRef = useRef<HTMLDivElement>(null);
 const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target.alt === 'avatar') {
    target.src = '/images/default-avatar.png';
  } else {
    target.src = '/images/no-image.png';
  }
};



  const scrollToBottom = () => {
    setTimeout(() => {
      commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadBlogs = async () => {
  try {
    setLoading(true);
    const res = await axiosClient.get('/blogs');
    const data = Array.isArray(res) ? res : res.data || [];
    setBlogs(data);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const saved = new Set<string>();
    data.forEach((blog: any) => {
      if (blog?.saves?.includes(user._id)) {
        saved.add(blog._id);
      }
    });
    setSavedBlogs(saved);
  } catch (err) {
    console.error('Không thể tải bài viết');
  } finally {
    setLoading(false);
  }
};

const loadDetail = async (id: string) => {
  try {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const blog = await axiosClient.get(`/blogs/${id}`);
    const cmts = await axiosClient.get(`/blogs/${id}/comments`);

    setSelectedBlog(blog.data);

    if (blog.data?.saves?.includes(user._id)) {
      setSavedBlogs(prev => new Set(prev).add(blog.data._id));
    }

    const mappedComments = (cmts?.data || []).map((cmt: any) => ({
      ...cmt,
      author: {
        ...cmt.author,
        name: cmt.author?.name || cmt.author?.fullname || 'Ẩn danh'
      },
      replies: (cmt.replies || []).map((r: any) => ({
        ...r,
        author: {
          ...r.author,
          name: r.author?.name || r.author?.fullname || 'Ẩn danh'
        }
      }))
    }));

    setComments(mappedComments);

    // ✅ Xử lý like cho cả comment và reply
    const all = flattenComments(mappedComments);
    for (const cmt of all) {
      const check = await axiosClient.get(`/comment-likes/check/${cmt._id}`);
      const count = await axiosClient.get(`/comment-likes/count/${cmt._id}`);

      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (check.liked) newSet.add(cmt._id);
        else newSet.delete(cmt._id);
        return newSet;
      });

      setCommentLikesCount(prev => ({
        ...prev,
        [cmt._id]: count.count || 0,
      }));
    }
  } catch {
    console.error('Lỗi khi tải chi tiết bài viết');
  } finally {
    setLoading(false);
  }
};



const handleLike = async () => {
  if (!selectedBlog || !selectedBlog._id) return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axiosClient.post(`/blogs/${selectedBlog._id}/like`, {
      userId: user._id,
    });

    if (typeof res.liked === 'boolean') {
      const updated = {
        ...selectedBlog,
        likes: res.likes_count,
        likes_count: res.likes_count, // ✅ Cập nhật likes_count để hiển thị đúng
        isLiked: res.liked,
      };
      setSelectedBlog(updated);

      // 🔁 Đồng bộ lại trong danh sách blogs (nếu có)
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) =>
          b._id === updated._id
            ? {
                ...b,
                likes: res.likes_count,
                likes_count: res.likes_count, // ✅ Bổ sung để cập nhật số hiển thị
                isLiked: res.liked,
              }
            : b
        )
      );
    }
  } catch (err: any) {
    console.error('❌ Không thể xử lý thích bài viết:', err.message || err);
  }
};

const flattenComments = (comments: any[]): any[] => {
  let result: any[] = [];

  const traverse = (items: any[]) => {
    for (const item of items) {
      result.push(item);
      if (item.replies && item.replies.length > 0) {
        traverse(item.replies);
      }
    }
  };

  traverse(comments);
  return result;
};

const handleToggleCommentLike = async (commentId: string) => {
  try {
    const res = await axiosClient.post(`/comment-likes/toggle/${commentId}`, {});
    const isLiked = res.liked;

    // 🔁 Reload lại count thực tế từ server
    const countRes = await axiosClient.get(`/comment-likes/count/${commentId}`);

    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.add(commentId);
      else newSet.delete(commentId);
      return newSet;
    });

    setCommentLikesCount(prev => ({
      ...prev,
      [commentId]: countRes.count || 0, // dùng giá trị thực tế
    }));

    toast.success(isLiked ? '❤️ Đã thích bình luận!' : '❌ Đã bỏ thích bình luận!');
  } catch (err) {
    console.error('❌ Không thể like comment:', err);
    toast.error('⚠️ Có lỗi khi thích/bỏ thích bình luận!');
  }
};
const reloadComments = async (blogId: string) => {
  const cmts = await axiosClient.get(`/blogs/${blogId}/comments`);
  const mapped = (cmts?.data || []).map((cmt: any) => ({
    ...cmt,
    author: {
      ...cmt.author,
      name: cmt.author?.name || cmt.author?.fullname || 'Ẩn danh'
    },
    replies: (cmt.replies || []).map((r: any) => ({
      ...r,
      author: {
        ...r.author,
        name: r.author?.name || r.author?.fullname || 'Ẩn danh'
      }
    }))
  }));

  setComments(mapped);

  // ✅ Gộp comment + reply rồi xử lý like
  const all = flattenComments(mapped);
  for (const cmt of all) {
    try {
      const check = await axiosClient.get(`/comment-likes/check/${cmt._id}`);
      const count = await axiosClient.get(`/comment-likes/count/${cmt._id}`);

      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (check.liked) newSet.add(cmt._id);
        else newSet.delete(cmt._id);
        return newSet;
      });

      setCommentLikesCount(prev => ({
        ...prev,
        [cmt._id]: count.count || 0,
      }));
    } catch (err) {
      console.error(`❌ Lỗi khi reload like comment ${cmt._id}:`, err);
    }
  }
};


const handleSave = async (blogId: string) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axiosClient.post(`/blogs/${blogId}/toggle-save`, {
      userId: user._id,
    });

    if (res.success) {
      const isSaved = res.saved;

      // Cập nhật UI trạng thái "Đã lưu"
      setSavedBlogs((prev) => {
        const newSet = new Set(prev);
        if (isSaved) newSet.add(blogId);
        else newSet.delete(blogId);
        return newSet;
      });

      // ✅ Cập nhật selectedBlog nếu đang mở
      if (selectedBlog && selectedBlog._id === blogId) {
        setSelectedBlog({
          ...selectedBlog,
          saves: isSaved
            ? [...(selectedBlog.saves || []), user._id]
            : (selectedBlog.saves || []).filter((id: string) => id !== user._id),
        });
      }

      // 🔁 Đồng bộ lại danh sách blogs
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) =>
          b._id === blogId
            ? {
                ...b,
                saves: isSaved
                  ? [...(b.saves || []), user._id]
                  : (b.saves || []).filter((id: string) => id !== user._id),
              }
            : b
        )
      );

      toast.success(res.message || (isSaved ? 'Đã lưu!' : 'Đã bỏ lưu!'));
    } else {
      toast.error(res.message || 'Lỗi khi lưu/bỏ lưu');
    }
  } catch (err: any) {
    console.error('Lỗi khi lưu/bỏ lưu:', err);
    toast.error('❌ Không thể lưu/bỏ lưu bài viết.');
  }
};

const handleComment = async () => {
  if (!newComment.trim() || !selectedBlog?._id) return;

  try {
    await axiosClient.post(`/blogs/${selectedBlog._id}/comment`, {
      content: newComment,
    });

    setNewComment('');
    await reloadComments(selectedBlog._id); // tải lại danh sách bình luận thật
    scrollToBottom();
  } catch (error) {
    console.error('❌ Error when commenting:', error);
  }
};



 const handleReply = async () => {
  if (!replyContent.trim() || !replyingTo || !selectedBlog?._id) return;

  try {
    await axiosClient.post(`/blogs/comment/${replyingTo}/reply`, {
      content: replyContent,
    });

    setReplyContent('');
    setReplyingTo(null);
    await reloadComments(selectedBlog._id); // tải lại bình luận thật
    scrollToBottom();
  } catch {
    console.error('Không thể trả lời');
  }
};

  useEffect(() => {
    loadBlogs();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'trending') return matchesSearch && blog.likes > 10;
    if (filterType === 'recent') return matchesSearch && new Date(blog.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (filterType === 'saved') return matchesSearch && savedBlogs.has(blog._id);
    
    return matchesSearch;
  });

  // Pagination logic
  const totalBlogs = filteredBlogs.length;
  const pagedBlogs = filteredBlogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải nội dung...</p>
        </div>
      </div>
    );
const extractFirstImageFromContent = (content: string): string | null => {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!selectedBlog ? (
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 drop-shadow-lg mb-4 tracking-tight">
              Blog Community
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
              Khám phá những câu chuyện thú vị, chia sẻ kiến thức và kết nối cộng đồng
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white/80 rounded-3xl p-8 shadow-2xl border border-gray-100 backdrop-blur-md">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm bg-white/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Tất cả', icon: Filter },
                { key: 'trending', label: 'Thịnh hành', icon: TrendingUp },
                { key: 'recent', label: 'Mới nhất', icon: Clock },
                { key: 'saved', label: 'Đã lưu', icon: Bookmark }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-base transition-all shadow-sm border-0
                    ${filterType === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
            {pagedBlogs.map((blog, idx) => (
              <div
                key={blog._id}
                className="group bg-white/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-2"
                onClick={() => loadDetail(blog._id)}
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <div className="p-7">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={blog.author?.avatar && blog.author.avatar.trim() !== '' ? blog.author.avatar : '/images/default-avatar.png'}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow"
                        onError={handleImageError}
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{blog.author?.fullname || 'Ẩn danh'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(blog._id);
                      }}
                      className="p-2 rounded-full hover:bg-blue-50 transition-colors border border-blue-100 shadow-sm"
                    >
                      {savedBlogs.has(blog._id) ? (
                        <BookmarkCheck className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Bookmark className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <h2 className="font-bold text-2xl mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                  {/* Blog Image */}
                  {(() => {
                    const fallbackImage =
                      blog.image?.trim() !== ''
                        ? blog.image
                        : extractFirstImageFromContent(blog.content) || '/images/no-image.png';
                    return (
                      <img
                        src={fallbackImage}
                        alt={blog.title}
                        className="w-full h-52 object-cover rounded-2xl mb-4 shadow-sm"
                        onError={handleImageError}
                      />
                    );
                  })()}
                  <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-base">
                    {parseMarkdownToText(blog.content)}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-1 text-red-500 font-semibold">
                        <Heart className="w-5 h-5" />
                        {blog.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-blue-500 font-semibold">
                        <MessageCircle className="w-5 h-5" />
                        {blog.comments_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-5 h-5" />
                        {blog.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <BookmarkCheck className="w-5 h-5" />
                        {blog.saves?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-gray-500 font-medium">Đọc thêm</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalBlogs > blogsPerPage && (
            <div className="flex justify-center mt-12">
              <div className="inline-block px-8 py-5 bg-white/80 rounded-2xl shadow-xl border border-blue-200">
                <Pagination
                  current={currentPage}
                  pageSize={blogsPerPage}
                  total={totalBlogs}
                  onChange={page => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            </div>
          )}

          {filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-28 h-28 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500 text-lg">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-full mx-auto px-0 md:px-12 py-12">
          {/* Back Button */}
          <button
            onClick={() => setSelectedBlog(null)}
            className="mb-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all font-semibold text-base backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Quay lại trang Blog
          </button>
          <div className="h-8" />

          {/* Blog Cover Image (nếu có) */}
          {selectedBlog.image && selectedBlog.image.trim() !== '' && (
            <div className="mb-10">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full max-h-[380px] object-cover rounded-3xl shadow-xl border-4 border-white/80 bg-gradient-to-br from-blue-50 to-purple-50"
                style={{ objectPosition: 'center' }}
              />
            </div>
          )}

          {/* Article Header */}
          <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10 backdrop-blur-md p-0">
            <div className="p-0 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 gap-6 md:gap-0">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-blue-400 to-purple-400 shadow-xl">
                      <img
                        src={selectedBlog.author?.avatar || '/images/default-avatar.png'}
                        alt="avatar"
                        className="w-full h-full rounded-full border-4 border-white object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                      {selectedBlog.author?.fullname || 'Ẩn danh'}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-2 text-base font-medium">
                      <Calendar className="w-5 h-5" />
                      {formatDate(selectedBlog.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Bỏ nút dấu 3 chấm ở góc trên bên phải */}
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 mb-10 leading-tight tracking-tight drop-shadow-lg">
                {selectedBlog.title}
              </h1>

              <div className="prose max-w-none mb-12">
                <div
                  className="blog-content text-gray-700 leading-relaxed text-xl md:text-2xl"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(selectedBlog.content || ''),
                  }}
                />
              </div>
              <style>
                {`
                  .blog-content img {
                    width: 100%;
                    max-height: 420px;
                    object-fit: contain;
                    border-radius: 24px;
                    display: block;
                    margin: 2rem 0;
                    background: #f0f0f0;
                    box-shadow: 0 8px 32px 0 rgba(80,80,180,0.10);
                  }
                  .blog-content blockquote {
                    border-left: 6px solid #a78bfa;
                    background: #f8f5ff;
                    color: #6d28d9;
                    font-style: italic;
                    padding: 1rem 1.5rem;
                    border-radius: 1rem;
                  }
                  .blog-content pre {
                    background: #f3f4f6;
                    border-radius: 1rem;
                    padding: 1.2rem;
                    font-size: 1rem;
                  }
                  .blog-content h1, .blog-content h2, .blog-content h3 {
                    font-weight: bold;
                    color: #7c3aed;
                  }
                `}
              </style>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-10 border-t border-gray-100 mt-10">
                {/* Left actions: Like & Save */}
                <div className="flex items-center gap-8">
                  {/* ❤️ Like button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-xl transition-all
                      ${selectedBlog.isLiked
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 border border-red-200 shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
                  >
                    <Heart
                      className={`w-7 h-7 ${selectedBlog.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                    />
                    <span>{selectedBlog.likes_count || selectedBlog.likes || 0}</span>
                  </button>

                  {/* 💾 Save button */}
                  <button
                    onClick={() => handleSave(selectedBlog._id)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-xl transition-all
                      ${savedBlogs.has(selectedBlog._id)
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
                  >
                    {savedBlogs.has(selectedBlog._id) ? (
                      <>
                        <BookmarkCheck className="w-7 h-7" />
                        Đã lưu
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-7 h-7" />
                        Lưu
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Comment count & Share */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-blue-600 text-xl font-bold">
                    <MessageCircle className="w-7 h-7" />
                    <span>{comments.length} bình luận</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-md">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Bình luận</h2>
            {/* Add Comment */}
            <div className="mb-10">
              <textarea
                className="w-full p-5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg shadow-sm"
                rows={4}
                placeholder="Chia sẻ suy nghĩ của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleComment}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:scale-105 hover:shadow-xl transition-all font-semibold text-lg"
                >
                  <Send className="w-5 h-5" />
                  Gửi bình luận
                </button>
              </div>
            </div>
            {/* Comments List */}
            <div className="space-y-8">
              {comments.map((cmt) => (
  <CommentItem
    key={cmt._id}
    cmt={cmt}
    onReply={setReplyingTo}
    onLike={handleToggleCommentLike}
    likedComments={likedComments}
    commentLikesCount={commentLikesCount}
    handleReplySubmit={async (parentId: string, content: string) => {
      try {
        await axiosClient.post(`/blogs/comment/${parentId}/reply`, { content });
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newReply = {
          _id: Date.now().toString(),
          content,
          author: { name: user.fullname || 'Bạn' },
          createdAt: new Date().toISOString(),
          replies: [],
          likeCount: 0,
        };

        const insertReply = (comments: any[]): any[] =>
          comments.map(c =>
            c._id === parentId
              ? { ...c, replies: [...(c.replies || []), newReply] }
              : { ...c, replies: insertReply(c.replies || []) }
          );

        setComments(prev => insertReply(prev));
      } catch (e) {
        console.error('❌ Lỗi khi phản hồi bình luận', e);
      }
    }}
  />
))}

              <div ref={commentEndRef}></div>
            </div>
            {comments.length === 0 && (
              <div className="text-center py-16">
                <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Chưa có bình luận nào</h3>
                <p className="text-gray-500 text-lg">Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;