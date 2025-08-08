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
// Nếu dùng TypeScript và gặp lỗi thiếu types cho leo-profanity, thêm khai báo sau vào đầu file hoặc tạo file leo-profanity.d.ts
// @ts-ignore
import leoProfanity from 'leo-profanity';
import { useNavigate } from 'react-router-dom';
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
  const [commentWarning, setCommentWarning] = useState('');
  const [replyWarning, setReplyWarning] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const commentEndRef = useRef<HTMLDivElement>(null);
 const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target.alt === 'avatar') {
    target.src = '/images/default-avatar.png';
  } else {
    target.src = '/images/no-image.png';
  }
};

  const navigate = useNavigate();

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
    console.log('API /blogs/:id/comments response:', cmts);

    setSelectedBlog(blog.data);

    if (blog.data?.saves?.includes(user._id)) {
      setSavedBlogs(prev => new Set(prev).add(blog.data._id));
    }

    const mappedComments = (cmts?.data || []).map((cmt: any) => ({
      ...cmt,
      author: {
        ...cmt.author,
        avatar: cmt.author?.avatar || cmt.author?.profilePic || '',
        name: cmt.author?.name || cmt.author?.fullname || 'Ẩn danh'
      },
      replies: (cmt.replies || []).map((r: any) => ({
        ...r,
        author: {
          ...r.author,
          avatar: r.author?.avatar || r.author?.profilePic || '',
          name: r.author?.name || r.author?.fullname || 'Ẩn danh'
        }
      }))
    }));

    setComments(mappedComments);

    // ✅ Xử lý like cho cả comment và reply
    const all = flattenComments(mappedComments);
    for (const cmt of all) {
      const check = await axiosClient.get(`/blogs/comment-likes/check/${cmt._id}`);
      const count = await axiosClient.get(`/blogs/comment-likes/count/${cmt._id}`);

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



const handleLike = async (blogId: string) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axiosClient.post(`/blogs/${blogId}/like`, {
      userId: user._id,
    });

    if (typeof res.liked === 'boolean') {
      // Nếu đang ở chi tiết bài viết
      if (selectedBlog && selectedBlog._id === blogId) {
        const updated = {
          ...selectedBlog,
          likes: res.likes_count,
          likes_count: res.likes_count,
          isLiked: res.liked,
        };
        setSelectedBlog(updated);
      }
      // Cập nhật ngay trong danh sách blogs
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) =>
          b._id === blogId
            ? {
                ...b,
                likes: res.likes_count,
                likes_count: res.likes_count,
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
    const res = await axiosClient.post(`/blogs/comment-likes/toggle/${commentId}`, {});
    console.log('API /comment-likes/toggle response:', res);
    const isLiked = res.liked;

    // 🔁 Reload lại count thực tế từ server
    const countRes = await axiosClient.get(`/blogs/comment-likes/count/${commentId}`);
    console.log('API /comment-likes/count response:', countRes);

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
      const check = await axiosClient.get(`/blogs/comment-likes/check/${cmt._id}`);
      const count = await axiosClient.get(`/blogs/comment-likes/count/${cmt._id}`);

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
  if (!newComment.trim()) return;
  if (!selectedBlog || !selectedBlog._id) return;

  try {
    const res = await axiosClient.post(`/blogs/${selectedBlog._id}/comment`, {
      content: newComment,
    });

    if (res.success === false) {
      if (res.message && res.message.includes('ngôn từ không phù hợp')) {
        toast.error('Bình luận của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
      } else {
        toast.error(res.message || 'Không thể gửi bình luận');
      }
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fakeId = Date.now().toString();
    setComments([
      ...comments,
      {
        _id: fakeId,
        content: newComment,
        author: { name: user.fullname || 'Bạn' },
        createdAt: new Date().toISOString(),
        replies: [],
      },
    ]);
    setNewlyAddedId(fakeId);
    setNewComment('');
    await reloadComments(selectedBlog._id); // tải lại danh sách bình luận thật
    scrollToBottom();
  } catch (error) {
    toast.error('Không thể gửi bình luận');
  }
};

  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('onChange comment:', value, 'profanity:', leoProfanity.check(value));
    setNewComment(value);
    if (leoProfanity.check(value)) {
      setCommentWarning('⚠️ Bình luận của bạn chứa ngôn từ không phù hợp!');
    } else {
      setCommentWarning('');
    }
  };

  // Đệ quy thêm reply vào đúng vị trí trong cây bình luận
  function addReplyRecursive(comments: any[], parentId: string, replyObj: any) {
    return comments.map(cmt => {
      if (cmt._id === parentId) {
        return { ...cmt, replies: [...(cmt.replies || []), replyObj] };
      } else if (cmt.replies && cmt.replies.length > 0) {
        return { ...cmt, replies: addReplyRecursive(cmt.replies, parentId, replyObj) };
      } else {
        return cmt;
      }
    });
  }

  const handleReply = async () => {
  if (!replyContent.trim() || !replyingTo) return;
  try {
    const res = await axiosClient.post(`/blogs/comment/${replyingTo}/reply`, {
      content: replyContent,
    });
    if (res.success === false) {
      if (res.message && res.message.includes('ngôn từ không phù hợp')) {
        toast.error('Phản hồi của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
      } else {
        toast.error(res.message || 'Không thể gửi phản hồi');
      }
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fakeId = Date.now().toString();
    const replyObj = {
      _id: fakeId,
      content: replyContent,
      author: { name: user.fullname || 'Bạn', avatar: user.avatar || '' },
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setComments(prev => addReplyRecursive(prev, replyingTo, replyObj));
    setNewlyAddedId(fakeId);
    setReplyContent('');
    setReplyingTo(null);
    scrollToBottom();
  } catch {
    toast.error('Không thể gửi phản hồi');
  }
};

  const handleReplyInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('onChange reply:', value, 'profanity:', leoProfanity.check(value));
    setReplyContent(value);
    if (leoProfanity.check(value)) {
      setReplyWarning('⚠️ Phản hồi của bạn chứa ngôn từ không phù hợp!');
    } else {
      setReplyWarning('');
    }
    console.log('replyWarning:', replyWarning); // Debug giá trị replyWarning
  };

  useEffect(() => {
    loadBlogs();
    // Lấy danh mục chủ đề
    axiosClient.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // Thêm các từ tục tĩu tiếng Việt vào từ điển
    leoProfanity.add([
      'đm', 'dm', 'cc', 'vcl', 'clm', 'cl', 'dcm', 'địt', 'dit', 'lồn', 'lon', 'cặc', 'cu', 'buồi', 'buoi', 'đụ', 'đéo', 'má', 'me', 'mẹ', 'bố', 'bo', 'chim', 'cai', 'cai...', 'thang', 'thang...', 'con', 'con...', 'chó', 'cho', 'cho chet', 'do ngu', 'mặt dày', 'mat day', 'chó chết', 'cho chet', 'ngu', 'fuck', 'shit'
      // ... thêm các từ khác bạn muốn chặn
    ]);
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filteredBlogs = blogs
    .filter(blog => blog.status === 'approved')
    .filter(blog => {
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
    <div className="min-h-screen bg-[#fafbfc]">
      {!selectedBlog ? (
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">Bài viết nổi bật</h1>
              <p className="text-gray-500 text-lg max-w-2xl">Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm bg-white"
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

            {/* Blog List (F8 style) */}
            <div className="flex flex-col gap-8">
              {pagedBlogs.map((blog, idx) => (
                <div
                  key={blog._id}
                  className="group flex flex-col md:flex-row bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => loadDetail(blog._id)}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  {/* Left: Info */}
                  <div className="flex-1 p-7 flex flex-col justify-between relative">
                    {/* Nút lưu ở góc trên phải */}
                    <button
                      onClick={e => { e.stopPropagation(); handleSave(blog._id); }}
                      className="absolute top-5 right-5 p-2 rounded-full bg-white border border-blue-100 shadow hover:bg-blue-50 transition-colors z-10"
                    >
                      {savedBlogs.has(blog._id) ? (
                        <BookmarkCheck className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Bookmark className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={blog.author?.avatar && blog.author.avatar.trim() !== '' ? blog.author.avatar : '/images/default-avatar.png'}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow"
                          onError={handleImageError}
                        />
                        <span className="font-semibold text-gray-800 text-base">{blog.author?.fullname || 'Ẩn danh'}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(blog.createdAt)}
                        </span>
                        {/* Tag */}
                        {blog.tags && blog.tags.length > 0 && (
                          <span className="ml-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{blog.tags[0]}</span>
                        )}
                      </div>
                      <h2 className="font-bold text-2xl mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed text-base">
                        {parseMarkdownToText(blog.content)}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <span className={`flex items-center gap-1 font-semibold select-none cursor-pointer ${blog.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        onClick={e => { e.stopPropagation(); handleLike(blog._id); }}
                      >
                        <Heart className={`w-5 h-5 ${blog.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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
                  </div>
                  {/* Right: Image */}
                  <div className="md:w-64 flex-shrink-0 flex items-center justify-center bg-gray-50">
                    {(() => {
                      const fallbackImage =
                        blog.coverImage?.trim() !== ''
                          ? blog.coverImage
                          : blog.image?.trim() !== ''
                          ? blog.image
                          : extractFirstImageFromContent(blog.content) || '/images/no-image.png';
                      return (
                        <img
                          src={fallbackImage}
                          alt={blog.title}
                          className="w-full h-48 object-cover rounded-2xl m-4 shadow-sm border border-gray-100"
                          onError={handleImageError}
                        />
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalBlogs > blogsPerPage && (
              <div className="flex justify-center mt-12">
                <div className="inline-block px-8 py-5 bg-white rounded-2xl shadow-xl border border-blue-200">
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
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
            {/* Chủ đề */}
            <div className="bg-gradient-to-tr from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-blue-100 p-8 mb-4 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="w-7 h-7 text-purple-500" />
                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">XEM CÁC BÀI VIẾT THEO CHỦ ĐỀ</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4 ml-1">Khám phá các chủ đề lập trình nổi bật, chọn chủ đề bạn quan tâm!</p>
              <div className="flex flex-wrap gap-3 w-full">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <button
                      key={cat._id || cat.id}
                      className="px-5 py-2 rounded-full bg-white border border-blue-200 shadow hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:border-purple-400 text-blue-700 font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {cat.name}
                    </button>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Đang tải...</span>
                )}
              </div>
            </div>

            {/* Quảng cáo khóa học */}
            <div
              className="bg-gradient-to-tr from-blue-100 via-white to-purple-100 rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-start mb-2 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => navigate('/courses')}
            >
              <h2 className="text-2xl font-extrabold text-purple-800 mb-2">🚀 ReactJS Pro - Khóa học chuyên sâu</h2>
              <p className="text-gray-700 text-base mb-3">Nâng tầm sự nghiệp lập trình với khóa học ReactJS Pro: thực chiến dự án, mentor đồng hành, cập nhật công nghệ mới nhất!</p>
              <ul className="text-base text-gray-700 mb-5 list-disc pl-5">
                <li>Xây dựng 5+ dự án thực tế</li>
                <li>Kiến thức chuyên sâu, cập nhật liên tục</li>
                <li>Mentor hỗ trợ 1-1, giải đáp 24/7</li>
                <li>Chứng chỉ hoàn thành, cơ hội việc làm</li>
              </ul>
              <button className="px-7 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow hover:scale-105 transition-all text-lg mt-2">Xem tất cả khóa học →</button>
            </div>

            {/* Quảng cáo giảng viên */}
            <div
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7 flex flex-col items-start cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => navigate('/instructors')}
            >
              <div className="flex items-center gap-4 mb-4">
                <img src="/images/default-avatar.png" alt="Giảng viên nổi bật" className="w-14 h-14 rounded-full border-2 border-blue-200 object-cover" />
                <div>
                  <div className="font-bold text-lg text-blue-700">Giảng viên nổi bật</div>
                  <div className="text-sm text-gray-500">Hơn 10+ chuyên gia ReactJS, NodeJS, UI/UX...</div>
                </div>
              </div>
              <p className="text-gray-600 text-base mb-4">Khám phá đội ngũ giảng viên giàu kinh nghiệm, tận tâm hỗ trợ học viên chinh phục mọi mục tiêu lập trình!</p>
              <button className="px-7 py-3 bg-orange-500 text-white rounded-xl font-bold shadow hover:scale-105 transition-all text-lg mt-2">Xem danh sách giảng viên →</button>
            </div>
          </aside>
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
          {selectedBlog.coverImage && selectedBlog.coverImage.trim() !== '' && (
            <div className="mb-10">
              <img
                src={selectedBlog.coverImage}
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
                    onClick={() => handleLike(selectedBlog._id)}
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
                onChange={handleCommentInput}
              />
              {commentWarning && (
                <div className="text-red-500 text-sm mt-1">{commentWarning}</div>
              )}
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
                <CommentTree
                  key={cmt._id}
                  comment={cmt}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReplyInput={handleReplyInput}
                  handleReply={handleReply}
                  handleToggleCommentLike={handleToggleCommentLike}
                  likedComments={likedComments}
                  commentLikesCount={commentLikesCount}
                  handleImageError={handleImageError}
                  formatDate={formatDate}
                  expandedReplies={expandedReplies}
                  setExpandedReplies={setExpandedReplies}
                  newlyAddedId={newlyAddedId}
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

function isValidObjectId(id: string) {
  return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id);
}

// Thêm component đệ quy cho comment tree
const CommentTree = ({ comment, replyingTo, setReplyingTo, replyContent, setReplyContent, handleReplyInput, handleReply, handleToggleCommentLike, likedComments, commentLikesCount, handleImageError, formatDate, level = 0, expandedReplies, setExpandedReplies, newlyAddedId }) => {
  const isDeep = level >= 3;
  const isExpanded = expandedReplies[comment._id] || false;
  const repliesToShow = isDeep && !isExpanded ? (comment.replies || []).slice(0, 1) : comment.replies || [];
  const hasMoreReplies = isDeep && (comment.replies?.length || 0) > 1 && !isExpanded;
  const isNew = newlyAddedId === comment._id;
  // Luôn fallback avatar nếu thiếu
  const avatarSrc = comment.author?.avatar && comment.author.avatar.trim() !== '' ? comment.author.avatar : '/images/default-avatar.png';
  // Chỉ cho phép trả lời ở các cấp chưa phải cuối (level < 2)
  const canReply = level < 2 && isValidObjectId(comment._id);
  return (
    <div style={{ marginLeft: level > 0 ? 32 : 0, marginTop: level > 0 ? 12 : 0 }}>
      <div className={`bg-gray-50 rounded-2xl p-5 mb-2 transition-all duration-700 ${isNew ? 'animate-fadein' : ''}`}
        style={{ animation: isNew ? 'fadein 0.7s' : undefined }}>
        <div className="flex items-start gap-4">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-blue-100 shadow"
            onError={handleImageError}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-gray-800 text-lg">{comment.author?.name || comment.author?.fullname || 'Ẩn danh'}</span>
              <span className="text-base text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700 mb-2 leading-relaxed text-base">{comment.content}</p>
            <div className="flex items-center gap-6">
              {isValidObjectId(comment._id) && (
                <button
                  onClick={() => handleToggleCommentLike(comment._id)}
                  className={`flex items-center gap-1 text-lg font-semibold ${likedComments.has(comment._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                >
                  <Heart className={`w-5 h-5 ${likedComments.has(comment._id) ? 'fill-red-500' : ''}`} />
                  <span>{commentLikesCount[comment._id] || 0}</span>
                </button>
              )}
              {canReply && (
                <button
                  onClick={() => {
                    setReplyingTo(comment._id);
                    setReplyContent('');
                  }}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-lg font-semibold"
                >
                  <Reply className="w-5 h-5" />
                  <span>Trả lời ({comment.replies?.length || 0})</span>
                </button>
              )}
            </div>
            {replyingTo === comment._id && canReply && (
              <div className="mt-4">
                <textarea
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                  rows={3}
                  value={replyContent}
                  onChange={handleReplyInput}
                  placeholder="Nhập phản hồi..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 transition-colors text-base"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReply}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 hover:shadow-lg transition-all text-base font-semibold"
                    disabled={!replyContent.trim()}
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Đệ quy render replies */}
        {repliesToShow.length > 0 && (
          <div className="mt-3 ml-8">
            {repliesToShow.map((reply) => (
              <CommentTree
                key={reply._id}
                comment={reply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleReplyInput={handleReplyInput}
                handleReply={handleReply}
                handleToggleCommentLike={handleToggleCommentLike}
                likedComments={likedComments}
                commentLikesCount={commentLikesCount}
                handleImageError={handleImageError}
                formatDate={formatDate}
                level={level + 1}
                expandedReplies={expandedReplies}
                setExpandedReplies={setExpandedReplies}
                newlyAddedId={newlyAddedId}
              />
            ))}
            {hasMoreReplies && (
              <button
                className="text-blue-600 text-sm mt-2 hover:underline"
                onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment._id]: true }))}
              >
                Xem thêm {comment.replies.length - 1} trả lời
              </button>
            )}
            {isDeep && isExpanded && (
              <button
                className="text-gray-500 text-xs mt-2 hover:underline"
                onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment._id]: false }))}
              >
                Thu gọn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;