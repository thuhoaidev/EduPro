import React, { useState, useEffect } from 'react';
import {
  BookOutlined, DeleteOutlined, EyeOutlined, MoreOutlined,
  UserOutlined, HeartOutlined, HeartFilled, MessageOutlined,
  ShareAltOutlined, ClockCircleOutlined, ReloadOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Button, Card, Col, Dropdown, Empty, Input, Layout,
  Modal, Pagination, Row, Select, Space, Spin, Tag, Tooltip,
  Typography, message,List, Form
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { apiService } from '../../../services/apiService';
import leoProfanity from 'leo-profanity';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SavedPost {
  _id: string;
  savedAt: string;
  blog: {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    author: {
      _id: string;
      fullname: string;
      avatar?: string;
      nickname?: string;
    };
    createdAt: string;
    views: number;
    likes_count: number;
    comments_count: number;
    tags?: string[];
    category: string;
    readingTime?: number;
    isLiked?: boolean;
    save_count?: number;
  };
}

interface CommentItem {
  _id: string;
  author: {
    fullname: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  replies?: CommentItem[];
}


const SavedBlogPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('saved_newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [categories, setCategories] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeCommentBlogId, setActiveCommentBlogId] = useState<string | null>(null);
  const [replyWarning, setReplyWarning] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  // Realtime update every 30 seconds
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      fetchSavedPosts(true); // silent update
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  useEffect(() => {
    leoProfanity.add([
      'đm', 'dm', 'cc', 'vcl', 'clm', 'cl', 'dcm', 'địt', 'dit', 'lồn', 'lon', 'cặc', 'cu', 'buồi', 'buoi', 'đụ', 'đéo', 'má', 'me', 'mẹ', 'bố', 'bo', 'chim', 'cai', 'cai...', 'thang', 'thang...', 'con', 'con...', 'chó', 'cho', 'cho chet', 'do ngu', 'mặt dày', 'mat day', 'chó chết', 'cho chet', 'ngu', 'fuck', 'shit'
    ]);
  }, []);

const fetchSavedPosts = async (silent = false) => {
  if (!silent) setLoading(true);
  try {
    const saved = await apiService.fetchSavedPosts();
    const validPosts = (saved as SavedPost[]).filter((p: SavedPost) => p.blog && p.blog._id);
    // ✅ Nếu blog.thumbnail không có, cố gắng lấy ảnh đầu tiên từ content Markdown
    validPosts.forEach((item: SavedPost) => {
      if (!item.blog.thumbnail && item.blog.content) {
        const match = item.blog.content.match(/!\[.*?\]\((.*?)\)/);
        if (match && match[1]) {
          item.blog.thumbnail = match[1];
        }
      }
    });

    setSavedPosts(validPosts);
    setLastUpdate(new Date());

    const uniqueCategories = [...new Set(validPosts.map((item: SavedPost) => item.blog?.category))];
    setCategories(uniqueCategories.filter((cat): cat is string => Boolean(cat)));

    // 🚀 Load comment song song
    const commentResponses = await Promise.all(
      validPosts.map((post: SavedPost) => apiService.fetchComments(post.blog._id))
    );
    const newComments: Record<string, CommentItem[]> = {};
    validPosts.forEach((post: SavedPost, i: number) => {
      newComments[post.blog._id] = commentResponses[i].data;
    });
    setComments(newComments);
  } catch (error) {
    console.error('❌ Lỗi fetchSavedPosts:', error);
    if (!silent) message.error('Không thể tải bài viết đã lưu');
  } finally {
    if (!silent) setLoading(false);
  }
};

const handleReplyComment = async (blogId: string, parentCommentId: string) => {
  const content = replyInput[parentCommentId]?.trim();
  if (!content) {
    setReplyWarning('Vui lòng nhập phản hồi');
    return;
  }
  if (leoProfanity.check(content)) {
    setReplyWarning('⚠️ Bình luận của bạn chứa ngôn từ không phù hợp!');
    return;
  }

  try {
    const reply = await apiService.replyToComment(parentCommentId, content);
    if (!reply || reply.success === false) {
      if (reply?.message && reply.message.includes('ngôn từ không phù hợp')) {
        message.error('Phản hồi của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
      } else {
        message.error(reply?.message || 'Không thể gửi phản hồi');
      }
      return;
    }
    setComments(prev => ({
      ...prev,
      [blogId]: prev[blogId].map(comment =>
        comment._id === parentCommentId
          ? {
              ...comment,
              replies: [reply.data, ...(comment.replies || [])]
            }
          : comment
      )
    }));
    setReplyInput(prev => ({ ...prev, [parentCommentId]: '' }));
    setReplyingTo(null);
    message.success('Đã gửi phản hồi');
  } catch (err: any) {
    if (err?.response?.data?.message && err.response.data.message.includes('ngôn từ không phù hợp')) {
      message.error('Phản hồi của bạn chứa ngôn từ không phù hợp. Vui lòng điều chỉnh lại nội dung!');
    } else {
      console.error('❌ Lỗi gửi phản hồi:', err);
      message.error('Không thể gửi phản hồi');
    }
  }
};

 const handleLikeToggle = async (blogId: string) => {
  const currentPost = savedPosts.find(item => item.blog._id === blogId);
  if (!currentPost) return;

  const isCurrentlyLiked = currentPost.blog.isLiked;

  // ✅ Cập nhật giao diện trước (optimistic update)
  setSavedPosts(prev =>
    prev.map(item =>
      item.blog._id === blogId
        ? {
            ...item,
            blog: {
              ...item.blog,
              isLiked: !isCurrentlyLiked,
              likes_count: isCurrentlyLiked
                ? item.blog.likes_count - 1
                : item.blog.likes_count + 1
            }
          }
        : item
    )
  );

  // 🧠 Sau đó gọi API để xác nhận với server
  try {
    await apiService.likePost(blogId); // đã là toggle ở backend
    console.log(isCurrentlyLiked ? 'Đã unlike' : 'Đã like', blogId);
  } catch (error) {
    // ⛔ Nếu lỗi, rollback lại trạng thái trước đó
    setSavedPosts(prev =>
      prev.map(item =>
        item.blog._id === blogId
          ? {
              ...item,
              blog: {
                ...item.blog,
                isLiked: isCurrentlyLiked,
                likes_count: isCurrentlyLiked
                  ? item.blog.likes_count + 1
                  : item.blog.likes_count - 1
              }
            }
          : item
      )
    );
    console.error('❌ Lỗi cập nhật like:', error);
    message.error('Không thể cập nhật trạng thái like');
  }
};

const handleAddComment = async (blogId: string) => {
  const content = commentInput[blogId]?.trim();
  if (!content) return;

  Modal.confirm({
    title: 'Xác nhận gửi bình luận',
    content: `Bạn có chắc chắn muốn gửi bình luận: "${content}"?`,
    okText: 'Gửi',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const newComment = await apiService.addComment(blogId, content); // ✅ sửa ở đây
        setComments(prev => ({
          ...prev,
          [blogId]: [newComment, ...(prev[blogId] || [])]
        }));
        setCommentInput(prev => ({ ...prev, [blogId]: '' }));
        message.success('Đã gửi bình luận');
      } catch (err) {
        console.error('❌ Bình luận lỗi:', err);
        message.error('Không thể gửi bình luận');
      }
    }
  });
};



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m trước`;
    return `${Math.floor(diffInSeconds / 3600)}h trước`;
  };

  const processedPosts = savedPosts
    .filter(item => {
      const blog = item.blog;
      const matchesSearch =
        blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.author.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
        (blog.tags || []).some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'saved_newest': return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'saved_oldest': return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'post_newest': return new Date(b.blog.createdAt).getTime() - new Date(a.blog.createdAt).getTime();
        case 'most_liked': return b.blog.likes_count - a.blog.likes_count;
        case 'most_viewed': return b.blog.views - a.blog.views;
        default: return 0;
      }
    });

  const paginatedPosts = processedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderComments = (blogId: string) => (
  <div style={{ marginTop: 16 }}>
    <List
      header={`${comments[blogId]?.length || 0} bình luận`}
      dataSource={comments[blogId] || []}
      renderItem={(item) => (
        <Comment
          author={item.author.fullname}
          avatar={<Avatar 
            src={item.author.avatar && item.author.avatar !== 'default-avatar.jpg' && item.author.avatar !== '' && (item.author.avatar.includes('googleusercontent.com') || item.author.avatar.startsWith('http')) ? item.author.avatar : undefined} 
            icon={<UserOutlined />} 
          />}
          content={
            <>
              <div>{item.content}</div>
              <Button type="link" size="small" onClick={() => setReplyingTo(item._id)}>Phản hồi</Button>
              {replyingTo === item._id && (
                <div style={{ marginTop: 8 }}>
                  <Input.TextArea
                    placeholder="Nhập phản hồi..."
                    rows={2}
                    value={replyInput[item._id] || ''}
                    onChange={(e) => {
                      setReplyInput((prev) => ({ ...prev, [item._id]: e.target.value }));
                      if (leoProfanity.check(e.target.value)) setReplyWarning('⚠️ Bình luận của bạn chứa ngôn từ không phù hợp!');
                      else setReplyWarning('');
                    }}
                  />
                  {replyWarning && <div style={{ color: 'red', marginBottom: 8 }}>{replyWarning}</div>}
                  <div style={{ marginTop: 8 }}>
                    <Button type="primary" onClick={() => handleReplyComment(blogId, item._id)} disabled={!replyInput[item._id]?.trim() || !!replyWarning}>
                      Gửi phản hồi
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={() => setReplyingTo(null)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
              {(item.replies || []).map((reply) => (
                <Comment
                  key={reply._id}
                  author={reply.author.fullname}
                  avatar={<Avatar 
                    src={reply.author.avatar && reply.author.avatar !== 'default-avatar.jpg' && reply.author.avatar !== '' && (reply.author.avatar.includes('googleusercontent.com') || reply.author.avatar.startsWith('http')) ? reply.author.avatar : undefined} 
                    icon={<UserOutlined />} 
                  />}
                  content={reply.content}
                  datetime={formatDate(reply.createdAt)}
                  style={{ marginTop: 16, marginLeft: 40 }}
                />
              ))}
            </>
          }
          datetime={formatDate(item.createdAt)}
        />
      )}
    />
    <Form.Item>
      <Input.TextArea
        placeholder="Viết bình luận..."
        rows={2}
        value={commentInput[blogId] || ''}
        onChange={(e) =>
          setCommentInput((prev) => ({ ...prev, [blogId]: e.target.value }))
        }
      />
    </Form.Item>
    <Button type="primary" onClick={() => handleAddComment(blogId)}>
      Gửi bình luận
    </Button>
  </div>
);

  const renderSavedPostCard = (savedPost: SavedPost) => {
    const { blog } = savedPost;
    return (
      <Card
        key={savedPost._id}
        hoverable
        style={{ marginBottom: 24, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={0}>
          <Col xs={24} sm={8}>
            <div
              style={{
                height: 200,
                overflow: 'hidden',
                borderTopLeftRadius: 14,
                borderBottomLeftRadius: 14,
                background: blog.thumbnail ? `url(${blog.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: blog.thumbnail ? 'cover' : undefined,
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/blog/post/${blog._id}`)}
            >
              {!blog.thumbnail && (
                <div style={{ textAlign: 'center' }}>
                  <BookOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                  <div>Không có ảnh</div>
                </div>
              )}
              {blog.thumbnail && <img src={blog.thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }} />}
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                padding: '4px 8px', borderRadius: 6, fontSize: 12
              }}>
                <ClockCircleOutlined /> {blog.readingTime || 3} phút
              </div>
            </div>
          </Col>
          <Col xs={24} sm={16}>
            <div style={{ padding: 24 }}>
              <Title level={4} onClick={() => navigate(`/blog/post/${blog._id}`)} style={{ cursor: 'pointer', margin: 0, marginBottom: 8 }}>
                {blog.title}
              </Title>
              <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', margin: 0, marginBottom: 12 }}>
                {blog.excerpt || ''}
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                {blog.author ? (
                  <>
                    <Avatar 
                      src={blog.author.avatar && blog.author.avatar !== 'default-avatar.jpg' && blog.author.avatar !== '' && (blog.author.avatar.includes('googleusercontent.com') || blog.author.avatar.startsWith('http')) ? blog.author.avatar : undefined} 
                      icon={<UserOutlined />} 
                    />
                    <div style={{ marginLeft: 10 }}>
                      <Text strong>{blog.author.fullname}</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {blog.category} • {formatDate(blog.createdAt)}
                      </Text>
                    </div>
                  </>
                ) : (
                  <div style={{ marginLeft: 10 }}>
                    <Text type="secondary">Tác giả không tồn tại</Text><br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {blog.category} • {formatDate(blog.createdAt)}
                    </Text>
                  </div>
                )}
              </div>
              <Space wrap style={{ marginBottom: 16 }}>
                {(blog.tags || []).map(tag => (
                  <Tag key={tag} color="#108ee9" style={{ margin: '2px 4px 2px 0' }} onClick={() => setSearchText(tag)}>{tag}</Tag>
                ))}
              </Space>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                  <Tooltip title={`Đã lưu vào ${formatDate(savedPost.savedAt)}`}>
                    <span><BookOutlined /> {formatDate(savedPost.savedAt)}</span>
                  </Tooltip>
                  <span><EyeOutlined /> {blog.views}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={blog.isLiked ? <HeartFilled style={{ color: '#ff4757' }} /> : <HeartOutlined />}
                    onClick={() => handleLikeToggle(blog._id)}
                  >
                    {blog.likes_count}
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => setActiveCommentBlogId(activeCommentBlogId === blog._id ? null : blog._id)}
                    style={{ padding: 0, color: '#666', border: 'none' }}
                  >
                    {blog.comments_count}
                  </Button>
                </div>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'view',
                        label: (
                          <Button
                            type="text"
                            block
                            style={{ textAlign: 'left' }}
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/blog/post/${blog._id}`)}
                          >
                            Xem bài viết
                          </Button>
                        )
                      },
                      {
                        key: 'share',
                        label: (
                          <Button
                            type="text"
                            block
                            style={{ textAlign: 'left' }}
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/blog/post/${blog._id}`);
                              message.success('Đã sao chép link bài viết');
                            }}
                          >
                            Chia sẻ
                          </Button>
                        )
                      },
                      {
                        key: 'unsave',
                        label: (
                          <Button
                            type="text"
                            block
                            style={{ textAlign: 'left' }}
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleUnsavePost(blog._id, blog.title)}
                          >
                            Bỏ lưu
                          </Button>
                        ),
                        danger: true
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
          </Col>
        </Row>
        {activeCommentBlogId === blog._id && (
          <div style={{ marginTop: 24 }}>{renderComments(blog._id)}</div>
        )}
      </Card>
    );
  };
const handleUnsavePost = async (blogId: string, blogTitle: string) => {
  Modal.confirm({
    title: 'Xác nhận bỏ lưu bài viết',
    content: `Bạn có chắc chắn muốn bỏ lưu bài viết "${blogTitle}"?`,
    okText: 'Bỏ lưu',
    cancelText: 'Hủy',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await apiService.toggleSavePost(blogId);
        setSavedPosts(prev => prev.filter(item => item.blog._id !== blogId));
        message.success(`🗑️ Đã bỏ lưu bài viết "${blogTitle}"`);
      } catch (err) {
        console.error('❌ Bỏ lưu lỗi:', err);
        message.error('Không thể bỏ lưu bài viết');
      }
    }
  });
};




  return (
    <div style={{ padding: '24px 0', minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Bài viết đã lưu</Title>
          <Text type="secondary">Quản lý và xem lại các bài viết bạn đã lưu</Text>
        </div>

        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm bài viết..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear size="large"
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: '100%' }} size="large">
                <Option value="all">Tất cả</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select value={sortBy} onChange={setSortBy} style={{ width: '100%' }} size="large">
                <Option value="saved_newest">Lưu gần nhất</Option>
                <Option value="saved_oldest">Lưu cũ nhất</Option>
                <Option value="post_newest">Bài viết mới nhất</Option>
                <Option value="most_liked">Nhiều like nhất</Option>
                <Option value="most_viewed">Nhiều view nhất</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Text type="secondary">{processedPosts.length} bài viết</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải bài viết...</div>
          </div>
        ) : paginatedPosts.length > 0 ? (
          <>
            {paginatedPosts.map(renderSavedPostCard)}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={currentPage}
                total={processedPosts.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bài viết`}
              />
            </div>
          </>
        ) : (
          <Empty description="Chưa có bài viết đã lưu" style={{ padding: 60, background: '#fff', borderRadius: 12 }}>
            <Button type="primary" onClick={() => navigate('/blog')}>Khám phá bài viết</Button>
          </Empty>
        )}
      </Content>
    </div>
  );
};

export default SavedBlogPosts;
