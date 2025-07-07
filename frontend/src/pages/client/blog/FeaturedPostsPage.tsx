import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Clock, Share2, ChevronDown, Send, ThumbsUp } from 'lucide-react';

const FeaturedBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReply, setActiveReply] = useState(null);
  const [comments, setComments] = useState([]);

  // Mock data - replace with real API calls
  const mockBlogs = [
    {
      id: '68547db672358427a53d9ece',
      title: 'Học React Hook từ Zero đến Hero',
      content: 'React Hook là một game changer trong thế giới React. Bài viết này sẽ giúp bạn master React Hook từ những kiến thức cơ bản nhất...',
      author: {
        name: 'Sơn Đặng',
        avatar: 'https://ui-avatars.com/api/?name=Son+Dang&background=f59e0b&color=fff&size=64',
        role: 'Founder F8'
      },
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      tags: ['React', 'JavaScript', 'Frontend'],
      views: 15420,
      likes: 892,
      comments: 156,
      isLiked: false,
      createdAt: '2024-07-01T10:00:00Z',
      readTime: '8 phút đọc'
    },
    {
      id: '68547db672358427a53d9ecf',
      title: 'JavaScript ES6+ - Những tính năng must-know',
      content: 'ES6+ đã mang đến rất nhiều tính năng mới giúp JavaScript trở nên modern và powerful hơn. Cùng tìm hiểu những tính năng không thể bỏ qua...',
      author: {
        name: 'Hậu Nguyễn',
        avatar: 'https://ui-avatars.com/api/?name=Hau+Nguyen&background=3b82f6&color=fff&size=64',
        role: 'Senior Developer'
      },
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop',
      tags: ['JavaScript', 'ES6', 'Programming'],
      views: 12350,
      likes: 654,
      comments: 89,
      isLiked: true,
      createdAt: '2024-06-28T15:30:00Z',
      readTime: '12 phút đọc'
    },
    {
      id: '68547db672358427a53d9ed0',
      title: 'Build Portfolio Website chuẩn chỉnh',
      content: 'Portfolio là business card của mọi developer. Bài viết này sẽ hướng dẫn bạn tạo một portfolio website ấn tượng và chuyên nghiệp...',
      author: {
        name: 'Evondev',
        avatar: 'https://ui-avatars.com/api/?name=Evon+Dev&background=10b981&color=fff&size=64',
        role: 'Full-stack Developer'
      },
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      tags: ['Portfolio', 'Web Design', 'Career'],
      views: 8750,
      likes: 423,
      comments: 67,
      isLiked: false,
      createdAt: '2024-06-25T09:15:00Z',
      readTime: '15 phút đọc'
    }
  ];

  const mockComments = [
    {
      id: '685489be771a51438ef10750',
      content: 'Bài viết rất hay và chi tiết. Cảm ơn anh đã chia sẻ!',
      author: {
        name: 'Minh Hoàng',
        avatar: 'https://ui-avatars.com/api/?name=Minh+Hoang&background=8b5cf6&color=fff&size=48'
      },
      createdAt: '2024-07-02T14:20:00Z',
      likes: 12,
      replies: [
        {
          id: 'reply1',
          content: 'Cảm ơn bạn! Rất vui khi bài viết hữu ích với bạn 😊',
          author: {
            name: 'Sơn Đặng',
            avatar: 'https://ui-avatars.com/api/?name=Son+Dang&background=f59e0b&color=fff&size=48'
          },
          createdAt: '2024-07-02T15:00:00Z',
          likes: 5
        }
      ]
    },
    {
      id: '685489be771a51438ef10751',
      content: 'Có thể làm thêm video hướng dẫn được không ạ?',
      author: {
        name: 'Thu Hà',
        avatar: 'https://ui-avatars.com/api/?name=Thu+Ha&background=ef4444&color=fff&size=48'
      },
      createdAt: '2024-07-02T16:45:00Z',
      likes: 8,
      replies: []
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlogs(mockBlogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = async (blogId) => {
    try {
      const blog = blogs.find(b => b.id === blogId);
      const endpoint = blog.isLiked 
        ? `http://localhost:5000/api/blogs/${blogId}/unlike`
        : `http://localhost:5000/api/blogs/${blogId}/like`;
      
      // Simulate API call
      setBlogs(blogs.map(b => 
        b.id === blogId 
          ? { ...b, isLiked: !b.isLiked, likes: b.isLiked ? b.likes - 1 : b.likes + 1 }
          : b
      ));
      
      // Real API call would be:
      // await fetch(endpoint, { method: 'POST' });
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleComment = async (blogId) => {
    if (!commentText.trim()) return;
    
    try {
      const newComment = {
        id: Date.now().toString(),
        content: commentText,
        author: {
          name: 'Bạn',
          avatar: 'https://ui-avatars.com/api/?name=You&background=64748b&color=fff&size=48'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };
      
      setComments([...comments, newComment]);
      setCommentText('');
      
      // Real API call would be:
      // await fetch(`http://localhost:5000/api/blogs/${blogId}/comment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: commentText })
      // });
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    try {
      const newReply = {
        id: Date.now().toString(),
        content: replyText,
        author: {
          name: 'Bạn',
          avatar: 'https://ui-avatars.com/api/?name=You&background=64748b&color=fff&size=48'
        },
        createdAt: new Date().toISOString(),
        likes: 0
      };
      
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      ));
      setReplyText('');
      setActiveReply(null);
      
      // Real API call would be:
      // await fetch(`http://localhost:5000/api/blogs/comment/${commentId}/reply`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: replyText })
      // });
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bài Viết Nổi Bật
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Những bài viết được cộng đồng F8 yêu thích nhất
            </p>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Nổi bật
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{blog.author.name}</p>
                    <p className="text-sm text-gray-500">{blog.author.role}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.content}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(blog.views)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{blog.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                        blog.isLiked 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${blog.isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">{formatNumber(blog.likes)}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedBlog(blog);
                        setComments(blog.id === '68547db672358427a53d9ece' ? mockComments : []);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">Bình luận</span>
                    </button>
                  </div>
                  
                  <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Bình luận</h3>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">{selectedBlog.title}</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <p className="font-semibold text-gray-800 mb-1">{comment.author.name}</p>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>
                        <button className="hover:text-blue-600">
                          <ThumbsUp className="w-4 h-4 inline mr-1" />
                          {comment.likes}
                        </button>
                        <button
                          onClick={() => setActiveReply(comment.id)}
                          className="hover:text-blue-600"
                        >
                          Trả lời
                        </button>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="ml-8 mt-4 flex items-start space-x-3">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-2xl p-3">
                              <p className="font-semibold text-gray-800 mb-1 text-sm">{reply.author.name}</p>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{formatDate(reply.createdAt)}</span>
                              <button className="hover:text-blue-600">
                                <ThumbsUp className="w-3 h-3 inline mr-1" />
                                {reply.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply Form */}
                      {activeReply === comment.id && (
                        <div className="ml-8 mt-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src="https://ui-avatars.com/api/?name=You&background=64748b&color=fff&size=32"
                              alt="You"
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 flex space-x-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Viết trả lời..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <button
                                onClick={() => handleReply(comment.id)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex items-start space-x-3">
                <img
                  src="https://ui-avatars.com/api/?name=You&background=64748b&color=fff&size=40"
                  alt="You"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => handleComment(selectedBlog.id)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedBlogPage;