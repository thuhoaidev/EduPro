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

  const commentEndRef = useRef<HTMLDivElement>(null);

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
// Thêm phần check nếu blog đã lưu thì cập nhật `savedBlogs`
if (blog.data?.saves?.includes(user._id)) {
  setSavedBlogs(prev => new Set(prev).add(blog.data._id));
}

      setComments((cmts?.data || []).map((cmt: any) => ({
  ...cmt,
})));

const fetchLikesForComments = async () => {
  for (const cmt of cmts?.data || []) {
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
      console.error(`❌ Lỗi khi load like comment ${cmt._id}:`, err);
    }
  }
};
fetchLikesForComments();


    } catch {
      console.error('Lỗi khi tải chi tiết bài viết');
    } finally {
      setLoading(false);
    }
  };

const handleLike = async () => {
  if (!selectedBlog || !selectedBlog._id) {
    console.error('❌ selectedBlog hoặc _id không hợp lệ');
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axiosClient.post(`/blogs/${selectedBlog._id}/like`, {
      userId: user._id,
    });

    console.log('🟠 Like Response:', res);

    if (typeof res.liked === 'boolean') {
      setSelectedBlog((prev: any) => ({
        ...prev,
        likes: res.likes_count,
        isLiked: res.liked,
      }));
    } else {
      console.warn('⚠️ Không rõ phản hồi like:', res);
    }
  } catch (err: any) {
    console.error('❌ Không thể xử lý thích bài viết:', err.message || err);
  }
};

const handleToggleCommentLike = async (commentId: string) => {
  try {
    const res = await axiosClient.post(`/comment-likes/toggle/${commentId}`, {});
    const isLiked = res.liked;

    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.add(commentId);
      else newSet.delete(commentId);
      return newSet;
    });

    setCommentLikesCount(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (isLiked ? 1 : -1),
    }));

    // ✅ Thêm toast thông báo
    toast.success(isLiked ? '❤️ Đã thích bình luận!' : '❌ Đã bỏ thích bình luận!');
  } catch (err) {
    console.error('❌ Không thể like comment:', err);
    toast.error('⚠️ Có lỗi khi thích/bỏ thích bình luận!');
  }
};
const handleSave = async (blogId: string) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axiosClient.post(`/blogs/${blogId}/toggle-save`, {
      userId: user._id,
    });

    // ✅ Hiển thị toast dù success true hay false
    if (res.success) {
      if (res.saved) {
        toast.success(res.message || '✅ Đã lưu bài viết!');
        setSavedBlogs(prev => new Set(prev).add(blogId));
      } else {
        toast.success(res.message || '❌ Đã bỏ lưu bài viết!');
        setSavedBlogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(blogId);
          return newSet;
        });
      }
    } else {
      toast.error(res.message || '⚠️ Không thể xử lý lưu/bỏ lưu.');
    }
  } catch (err: any) {
    console.error('Lỗi khi lưu/bỏ lưu:', err);
    toast.error('❌ Không thể lưu/bỏ lưu bài viết.');
  }
};

  const handleComment = async () => {
  if (!newComment.trim()) return;

  if (!selectedBlog || !selectedBlog._id) {
    console.error('❌ selectedBlog hoặc _id không hợp lệ');
    return;
  }

  try {
    await axiosClient.post(`/blogs/${selectedBlog._id}/comment`, {
      content: newComment,
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    setComments([
      ...comments,
      {
        _id: Date.now().toString(),
        content: newComment,
        author: { name: user.fullname || 'Bạn' },
        createdAt: new Date().toISOString(),
        replies: [],
      },
    ]);
    setNewComment('');
    scrollToBottom();
  } catch (error) {
    console.error('❌ Error when commenting:', error);
  }
};


  const handleReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    try {
      await axiosClient.post(`/blogs/comment/${replyingTo}/reply`, {
        content: replyContent,
      });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newReply = {
        _id: Date.now().toString(),
        content: replyContent,
        author: { name: user.fullname || 'Bạn' },
        createdAt: new Date().toISOString(),
      };
      setComments((prev) =>
        prev.map((c) =>
          c._id === replyingTo ? { ...c, replies: [...(c.replies || []), newReply] } : c
        )
      );
      setReplyContent('');
      setReplyingTo(null);
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải nội dung...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!selectedBlog ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Blog Community
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Khám phá những câu chuyện thú vị, chia sẻ kiến thức và kết nối cộng đồng
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => loadDetail(blog._id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{blog.author?.fullname}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(blog._id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {savedBlogs.has(blog._id) ? (
                          <BookmarkCheck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-gray-400" />
                        )}
                      </button>


                  </div>
                  
                  <h2 className="font-bold text-xl mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                  {/* Blog Image */}
                    {blog.image && blog.image.trim() !== '' ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 text-sm">
                        Không có ảnh
                      </div>
                    )}
                  <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {blog.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <Heart className="w-4 h-4" />
                      {blog.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-blue-500 font-medium">
                      <MessageCircle className="w-4 h-4" />
                      {blog.comments_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      {blog.views || 0}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <BookmarkCheck className="w-4 h-4" />
                      {blog.saves?.length || 0}
                    </span>

                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-500">Đọc thêm</span>
                  </div>
                </div>

                </div>
              </div>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedBlog(null)}
            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-blue-600 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          {/* Article Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedBlog.author?.fullname}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedBlog.createdAt)}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
                {selectedBlog.title}
              </h1>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedBlog.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      selectedBlog.isLiked
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedBlog.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                    <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{selectedBlog.likes_count || selectedBlog.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{comments.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-green-500" />
                      <span>{selectedBlog?.saves?.length || 0}</span>
                    </div>
                  </div>

                  </button>
                  
                  <button
                  onClick={() => handleSave(selectedBlog._id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    savedBlogs.has(selectedBlog._id)
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {savedBlogs.has(selectedBlog._id) ? (
                    <>
                      <BookmarkCheck className="w-5 h-5" />
                      Đã lưu
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      Lưu
                    </>
                  )}
                </button>


                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{comments.length} bình luận</span>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bình luận</h2>
            
            {/* Add Comment */}
            <div className="mb-8">
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Chia sẻ suy nghĩ của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleComment}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  Gửi bình luận
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
      {comments.map((cmt) => (
  <div key={cmt._id} className="bg-gray-50 rounded-xl p-6">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-800">{cmt.author?.name}</span>
          <span className="text-sm text-gray-500">{formatDate(cmt.createdAt)}</span>
        </div>
        <p className="text-gray-700 mb-3 leading-relaxed">{cmt.content}</p>

        {/* ✅ Like & Reply Buttons */}
        <div className="flex items-center gap-4">
          {/* ❤️ Nút thả tim */}
          <button
            onClick={() => handleToggleCommentLike(cmt._id)}
            className={`flex items-center gap-1 ${
              likedComments.has(cmt._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors`}
          >
            <Heart className={`w-4 h-4 ${likedComments.has(cmt._id) ? 'fill-red-500' : ''}`} />
            <span className="text-sm">{commentLikesCount[cmt._id] || 0}</span>
          </button>

          {/* 💬 Nút trả lời */}
          <button
            onClick={() => setReplyingTo(cmt._id)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Reply className="w-4 h-4" />
            <span className="text-sm">Trả lời ({cmt.replies?.length || 0})</span>
          </button>
        </div>


                      {replyingTo === cmt._id && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                          <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Nhập phản hồi..."
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleReply}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Gửi
                            </button>
                          </div>
                        </div>
                      )}

                      {cmt.replies?.length > 0 && (
                        <div className="mt-4 ml-6 space-y-4">
                          {cmt.replies.map((reply: any) => (
                            <div key={reply._id} className="bg-white rounded-xl p-4 border border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-800">{reply.author?.name}</span>
                                    <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={commentEndRef}></div>
            </div>

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có bình luận nào</h3>
                <p className="text-gray-500">Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;