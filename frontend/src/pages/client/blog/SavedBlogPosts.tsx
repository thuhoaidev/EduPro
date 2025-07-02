import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { 
  Avatar, 
  Button, 
  Card, 
  Col, 
  Dropdown, 
  Empty, 
  Input, 
  Layout, 
  Modal, 
  Pagination, 
  Row, 
  Select, 
  Space, 
  Spin, 
  Tag, 
  Tooltip, 
  Typography,
  message,
  List
} from 'antd';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface SavedPost {
  id: string;
  postId: string;
  savedAt: string;
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    thumbnail?: string;
    author: {
      id: string;
      fullname: string;
      avatar?: string;
      nickname?: string;
    };
    createdAt: string;
    views: number;
    likes: number;
    comments: number;
    tags: string[];
    category: string;
    readingTime: number;
    isLiked?: boolean;
  };
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    fullname: string;
    avatar?: string;
  };
  createdAt: string;
  replies?: Comment[];
  repliesCount?: number;
}

// API Configuration
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Utility functions
const getAuthToken = () => localStorage.getItem('token');
const getCurrentUserId = () => localStorage.getItem('userId') || '60d5ecp74b24c72f5c8e4e3a';

// API Service - Optimized with correct endpoints
const apiService = {
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  }),

  // Fetch saved posts
  fetchSavedPosts: async () => {
  const response = await fetch(`${apiUrl}/blogs/saved-posts`, {
    method: 'GET',
    headers: apiService.getHeaders()
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res.data; // <-- chỉ lấy mảng data
},


  // Like post
  likePost: async (postId: string) => {
    const response = await fetch(`${apiUrl}/blogs/${postId}/like`, {
      method: 'POST',
      headers: apiService.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Unlike post
  unlikePost: async (postId: string) => {
    const response = await fetch(`${apiUrl}/blogs/${postId}/unlike`, {
      method: 'DELETE',
      headers: apiService.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Fetch comments
  fetchComments: async (postId: string, page: number = 1, limit: number = 10) => {
    const response = await fetch(
      `${apiUrl}/blogs/${postId}/comments?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: apiService.getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Add comment
  addComment: async (postId: string, content: string) => {
    const response = await fetch(`${apiUrl}/blogs/${postId}/comment`, {
      method: 'POST',
      headers: apiService.getHeaders(),
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Reply to comment
  replyToComment: async (commentId: string, content: string) => {
    const response = await fetch(`${apiUrl}/blogs/comment/${commentId}/reply`, {
      method: 'POST',
      headers: apiService.getHeaders(),
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Unsave post
  unsavePost: async (savedPostId: string) => {
    const response = await fetch(`${apiUrl}/blogs/saved-posts/${savedPostId}`, {
      method: 'DELETE',
      headers: apiService.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get user info
  getCurrentUser: async () => {
    const response = await fetch(`${apiUrl}/users/me`, {
      method: 'GET',
      headers: apiService.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

const SavedBlogPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('saved_newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Comment modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string>('');
  const [replyContent, setReplyContent] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const navigate = useNavigate();
 
  useEffect(() => {
  const fetchData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user?.data || null);

      const posts = await apiService.fetchSavedPosts();
      if (Array.isArray(posts)) {
        setSavedPosts(posts);

        // Gợi ý lọc tất cả danh mục từ các post
        const uniqueCategories = Array.from(
          new Set(posts.map(p => p.post.category))
        );
        setCategories(uniqueCategories);
      } else {
        setSavedPosts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải bài viết đã lưu:', error);
      message.error('Không thể tải bài viết đã lưu');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetchSavedPosts(),
      fetchCurrentUser()
    ]).catch(error => {
      console.error('Error loading initial data:', error);
    });
  }, []);

  // Update categories when posts change
  useEffect(() => {
    const uniqueCategories = [...new Set(savedPosts.map(item => item.post.category))];
    setCategories(uniqueCategories);
  }, [savedPosts]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser({
        id: getCurrentUserId(),
        fullname: 'Người dùng',
        avatar: `https://ui-avatars.com/api/?name=User&background=4f8cff&color=fff&size=32`
      });
    }
  };

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchSavedPosts();
      setSavedPosts(data.savedPosts || data);
      
      message.success(`Đã tải ${data.savedPosts?.length || data.length} bài viết đã lưu`);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      
      // Fallback to mock data for development
      const mockSavedPosts: SavedPost[] = [
        {
          id: '1',
          postId: '68547db672358427a53d9ece',
          savedAt: '2024-01-20T10:30:00Z',
          post: {
            id: '68547db672358427a53d9ece',
            title: 'Cách tối ưu hóa React Performance với useMemo và useCallback',
            content: 'Nội dung chi tiết về React Performance...',
            excerpt: 'React Performance là một chủ đề quan trọng khi phát triển ứng dụng web. Trong bài viết này, chúng ta sẽ tìm hiểu cách sử dụng useMemo và useCallback để tối ưu hóa hiệu suất...',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
            author: {
              id: 'author1',
              fullname: 'Nguyễn Văn A',
              avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=4f8cff&color=fff&size=32',
              nickname: 'nguyenvana'
            },
            createdAt: '2024-01-15T08:00:00Z',
            views: 2340,
            likes: 156,
            comments: 42,
            tags: ['React', 'Performance', 'JavaScript'],
            category: 'Lập trình',
            readingTime: 8,
            isLiked: false
          }
        }
      ];

      setSavedPosts(mockSavedPosts);
      message.warning('Không thể kết nối API, đang sử dụng dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  };

  // Like/Unlike functions with optimistic updates
  const handleLikePost = useCallback(async (postId: string) => {
    // Optimistic update
    setSavedPosts(prev => prev.map(item => 
      item.post.id === postId 
        ? {
            ...item,
            post: {
              ...item.post,
              isLiked: true,
              likes: item.post.likes + 1
            }
          }
        : item
    ));

    try {
      await apiService.likePost(postId);
      message.success('Đã thích bài viết');
    } catch (error) {
      console.error('Error liking post:', error);
      
      // Revert optimistic update
      setSavedPosts(prev => prev.map(item => 
        item.post.id === postId 
          ? {
              ...item,
              post: {
                ...item.post,
                isLiked: false,
                likes: Math.max(0, item.post.likes - 1)
              }
            }
          : item
      ));
      
      message.error('Không thể thích bài viết. Vui lòng thử lại.');
    }
  }, []);

  const handleUnlikePost = useCallback(async (postId: string) => {
    // Optimistic update
    setSavedPosts(prev => prev.map(item => 
      item.post.id === postId 
        ? {
            ...item,
            post: {
              ...item.post,
              isLiked: false,
              likes: Math.max(0, item.post.likes - 1)
            }
          }
        : item
    ));

    try {
      await apiService.unlikePost(postId);
      message.success('Đã bỏ thích bài viết');
    } catch (error) {
      console.error('Error unliking post:', error);
      
      // Revert optimistic update
      setSavedPosts(prev => prev.map(item => 
        item.post.id === postId 
          ? {
              ...item,
              post: {
                ...item.post,
                isLiked: true,
                likes: item.post.likes + 1
              }
            }
          : item
      ));
      
      message.error('Không thể bỏ thích bài viết. Vui lòng thử lại.');
    }
  }, []);

  // Comment functions
  const fetchComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const data = await apiService.fetchComments(postId);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      
      // Mock comments for development
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'Bài viết rất hay và bổ ích!',
          author: {
            id: 'user1',
            fullname: 'Lê Minh C',
            avatar: 'https://ui-avatars.com/api/?name=Le+Minh+C&background=52c41a&color=fff&size=32'
          },
          createdAt: '2024-01-21T09:15:00Z',
          repliesCount: 1,
          replies: [
            {
              id: '2',
              content: 'Cảm ơn bạn đã đọc và góp ý!',
              author: {
                id: 'author1',
                fullname: 'Nguyễn Văn A',
                avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=4f8cff&color=fff&size=32'
              },
              createdAt: '2024-01-21T10:30:00Z'
            }
          ]
        }
      ];
      
      setComments(mockComments);
      message.warning('Không thể tải bình luận từ server, đang hiển thị dữ liệu mẫu');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }
    
    setSubmittingComment(true);
    try {
      const commentData = await apiService.addComment(currentPostId, newComment);
      
      // Add new comment to the list
      const newCommentObj: Comment = {
        id: commentData.id || Date.now().toString(),
        content: newComment,
        author: currentUser || {
          id: getCurrentUserId(),
          fullname: 'Bạn',
          avatar: 'https://ui-avatars.com/api/?name=Ban&background=4f8cff&color=fff&size=32'
        },
        createdAt: new Date().toISOString(),
        repliesCount: 0
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      
      // Update comment count in posts
      setSavedPosts(prev => prev.map(item => 
        item.post.id === currentPostId 
          ? { ...item, post: { ...item.post, comments: item.post.comments + 1 }}
          : item
      ));
      
      message.success('Đã thêm bình luận thành công');
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Không thể thêm bình luận. Vui lòng thử lại.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      message.warning('Vui lòng nhập nội dung trả lời');
      return;
    }
    
    try {
      const replyData = await apiService.replyToComment(commentId, replyContent);
      
      // Add reply to the comment
      const newReply: Comment = {
        id: replyData.id || Date.now().toString(),
        content: replyContent,
        author: currentUser || {
          id: getCurrentUserId(),
          fullname: 'Bạn',
          avatar: 'https://ui-avatars.com/api/?name=Ban&background=4f8cff&color=fff&size=32'
        },
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              replies: [...(comment.replies || []), newReply],
              repliesCount: (comment.repliesCount || 0) + 1
            }
          : comment
      ));
      
      setReplyTo('');
      setReplyContent('');
      
      // Update total comment count
      setSavedPosts(prev => prev.map(item => 
        item.post.id === currentPostId 
          ? { ...item, post: { ...item.post, comments: item.post.comments + 1 }}
          : item
      ));
      
      message.success('Đã trả lời bình luận');
    } catch (error) {
      console.error('Error submitting reply:', error);
      message.error('Không thể trả lời bình luận. Vui lòng thử lại.');
    }
  };

  const openCommentModal = (postId: string) => {
    setCurrentPostId(postId);
    setCommentModalVisible(true);
    fetchComments(postId);
  };

  const handleUnsavePost = (savedPostId: string, postTitle: string) => {
    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu bài viết "${postTitle}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiService.unsavePost(savedPostId);
          setSavedPosts(prev => prev.filter(item => item.id !== savedPostId));
          message.success('Đã bỏ lưu bài viết');
        } catch (error) {
          console.error('Error removing saved post:', error);
          message.error('Không thể bỏ lưu bài viết. Vui lòng thử lại.');
        }
      }
    });
  };

  // Filtering and sorting
  const filteredAndSortedPosts = () => {
    const filtered = savedPosts.filter(item => {
      const matchesSearch = item.post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.excerpt.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.author.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || item.post.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'saved_newest':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'saved_oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'post_newest':
          return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
        case 'most_liked':
          return b.post.likes - a.post.likes;
        case 'most_viewed':
          return b.post.views - a.post.views;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const processedPosts = filteredAndSortedPosts();
  const paginatedPosts = processedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const renderSavedPostCard = (savedPost: SavedPost) => {
    const { post } = savedPost;
    
    return (
      <Card
        key={savedPost.id}
        hoverable
        style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Row gutter={0}>
          <Col xs={24} sm={8}>
            <div style={{ 
              height: 200, 
              background: post.thumbnail ? `url(${post.thumbnail})` : 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/blog/post/${post.id}`)}
            >
              {!post.thumbnail && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#999',
                  fontSize: 16,
                  textAlign: 'center'
                }}>
                  <BookOutlined style={{ fontSize: 24, marginBottom: 8 }} /><br />
                  Không có ảnh
                </div>
              )}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0,0,0,0.8)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backdropFilter: 'blur(4px)'
              }}>
                <ClockCircleOutlined />
                {post.readingTime} phút đọc
              </div>
            </div>
          </Col>
          <Col xs={24} sm={16}>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Title 
                  level={4} 
                  style={{ 
                    margin: 0, 
                    marginBottom: 8, 
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onClick={() => navigate(`/blog/post/${post.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a73e8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                >
                  {post.title}
                </Title>
                <Paragraph 
                  style={{ margin: 0, color: '#666', marginBottom: 12, lineHeight: 1.6 }}
                  ellipsis={{ rows: 2 }}
                >
                  {post.excerpt}
                </Paragraph>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <Avatar 
                    size={28}
                    src={post.author.avatar}
                    icon={<UserOutlined />}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${post.author.id}`)}
                  />
                  <div style={{ marginLeft: 10, flex: 1 }}>
                    <Text 
                      style={{ 
                        fontSize: 14, 
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'block'
                      }}
                      onClick={() => navigate(`/profile/${post.author.id}`)}
                    >
                      {post.author.fullname}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>
                      {post.category} • {formatDate(post.createdAt)}
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Space wrap>
                  {post.tags.slice(0, 3).map(tag => (
                    <Tag 
                      key={tag} 
                      style={{ 
                        margin: '2px 4px 2px 0',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSearchText(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                  {post.tags.length > 3 && (
                    <Tag style={{ margin: '2px 4px 2px 0', borderRadius: 4 }}>
                      +{post.tags.length - 3}
                    </Tag>
                  )}
                </Space>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                  <Tooltip title={`Đã lưu vào ${formatDate(savedPost.savedAt)}`}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOutlined />
                      {formatDate(savedPost.savedAt)}
                    </span>
                  </Tooltip>
                  
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <EyeOutlined />
                    {post.views.toLocaleString()}
                  </span>
                  
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageOutlined />
                    {post.comments}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={post.isLiked ? <HeartFilled style={{ color: '#ff4757' }} /> : <HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      post.isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id);
                    }}
                  >
                    {post.likes}
                  </Button>

                  <Button
                    type="text"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openCommentModal(post.id);
                    }}
                  >
                    Bình luận
                  </Button>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'view',
                          label: 'Xem bài viết',
                          icon: <EyeOutlined />,
                          onClick: () => navigate(`/blog/post/${post.id}`)
                        },
                        {
                          key: 'share',
                          label: 'Chia sẻ',
                          icon: <ShareAltOutlined />,
                          onClick: () => {
                            navigator.clipboard.writeText(`${window.location.origin}/blog/post/${post.id}`);
                            message.success('Đã copy link bài viết');
                          }
                        },
                        {
                          key: 'unsave',
                          label: 'Bỏ lưu',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handleUnsavePost(savedPost.id, post.title)
                        }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div style={{ 
      marginBottom: isReply ? 12 : 16,
      marginLeft: isReply ? 40 : 0,
      padding: isReply ? 12 : 16,
      background: isReply ? '#f8f9fa' : '#fff',
      border: isReply ? '1px solid #e9ecef' : 'none',
      borderRadius: isReply ? 8 : 0,
      borderBottom: !isReply ? '1px solid #f0f0f0' : 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar 
          size={32}
          src={comment.author.avatar}
          icon={<UserOutlined />}
          style={{ cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate(`/profile/${comment.author.id}`)}
        />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <Text 
              strong 
              style={{ 
                fontSize: 14,
                cursor: 'pointer',
                marginRight: 8
              }}
              onClick={() => navigate(`/profile/${comment.author.id}`)}
            >
              {comment.author.fullname}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {formatDate(comment.createdAt)}
            </Text>
          </div>
          
          <Paragraph style={{ margin: 0, marginBottom: 8, lineHeight: 1.5 }}>
            {comment.content}
          </Paragraph>
          
          {!isReply && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button
                type="text"
                size="small"
                onClick={() => setReplyTo(replyTo === comment.id ? '' : comment.id)}
                style={{ padding: 0, height: 'auto', fontSize: 12, color: '#666' }}
              >
                Trả lời
              </Button>
              
              {comment.repliesCount && comment.repliesCount > 0 && (
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {comment.repliesCount} trả lời
                </Text>
              )}
            </div>
          )}
          
          {replyTo === comment.id && (
            <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
              <TextArea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết trả lời..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button 
                  size="small" 
                  onClick={() => {
                    setReplyTo('');
                    setReplyContent('');
                  }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  Gửi
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div style={{ padding: '24px 0', minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Bài viết đã lưu
          </Title>
          <Text style={{ color: '#666', fontSize: 16 }}>
            Quản lý và xem lại các bài viết bạn đã lưu
          </Text>
        </div>

        {/* Filters and Search */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm bài viết..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={(value) => setSearchText(value)}
                enterButton={<SearchOutlined />}
                allowClear
                size="large"
              />
            </Col>
            
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="Danh mục"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: '100%' }}
                size="large"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="Sắp xếp"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="saved_newest">Lưu gần nhất</Option>
                <Option value="saved_oldest">Lưu cũ nhất</Option>
                <Option value="post_newest">Bài viết mới nhất</Option>
                <Option value="most_liked">Nhiều like nhất</Option>
                <Option value="most_viewed">Nhiều view nhất</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={fetchSavedPosts}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Text style={{ color: '#666' }}>
                  {processedPosts.length} bài viết
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>
              Đang tải bài viết đã lưu...
            </div>
          </div>
        ) : (
          <>
            {/* Posts List */}
            {paginatedPosts.length > 0 ? (
              <>
                <div>
                  {paginatedPosts.map(renderSavedPostCard)}
                </div>

                {/* Pagination */}
                {processedPosts.length > pageSize && (
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Pagination
                      current={currentPage}
                      total={processedPosts.length}
                      pageSize={pageSize}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} của ${total} bài viết`
                      }
                      style={{ 
                        display: 'inline-block',
                        padding: '16px 24px',
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Title level={4} style={{ color: '#999' }}>
                      {searchText || categoryFilter !== 'all' 
                        ? 'Không tìm thấy bài viết nào' 
                        : 'Chưa có bài viết đã lưu'}
                    </Title>
                    <Text style={{ color: '#999' }}>
                      {searchText || categoryFilter !== 'all'
                        ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                        : 'Bắt đầu lưu những bài viết yêu thích để xem lại sau'}
                    </Text>
                  </div>
                }
                style={{ 
                  padding: '60px 20px',
                  background: '#fff',
                  borderRadius: 12,
                  margin: '20px 0'
                }}
              >
                {(!searchText && categoryFilter === 'all') && (
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => navigate('/blog')}
                    style={{ marginTop: 16 }}
                  >
                    Khám phá bài viết
                  </Button>
                )}
              </Empty>
            )}
          </>
        )}

        {/* Comment Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageOutlined />
              <span>Bình luận</span>
            </div>
          }
          open={commentModalVisible}
          onCancel={() => {
            setCommentModalVisible(false);
            setComments([]);
            setNewComment('');
            setReplyTo('');
            setReplyContent('');
          }}
          footer={null}
          width={700}
          style={{ top: 20 }}
          styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
        >
          {/* Add Comment Section */}
          <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <Avatar 
                size={36}
                src={currentUser?.avatar}
                icon={<UserOutlined />}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 14 }}>
                  {currentUser?.fullname || 'Bạn'}
                </Text>
              </div>
            </div>
            
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ marginBottom: 12 }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitComment}
                loading={submittingComment}
                disabled={!newComment.trim()}
              >
                Đăng bình luận
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>
                Đang tải bình luận...
              </div>
            </div>
          ) : (
            <div>
              {comments.length > 0 ? (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item style={{ padding: 0, border: 'none' }}>
                      <CommentItem comment={comment} />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có bình luận nào"
                  style={{ padding: 40 }}
                >
                  <Text style={{ color: '#999' }}>
                    Hãy là người đầu tiên bình luận về bài viết này
                  </Text>
                </Empty>
              )}
            </div>
          )}
        </Modal>
      </Content>
    </div>
  );
};

export default SavedBlogPosts;