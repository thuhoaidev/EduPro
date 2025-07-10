import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Empty, 
  Spin, 
  Tag, 
  Dropdown, 
  Modal, 
  message,
  Input,
  Select,
  Row,
  Col,
  Pagination,
  Avatar,
  List,
  Divider,
  Badge
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  CalendarOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  FilterOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail?: string;
  status: 'published' | 'draft' | 'pending';
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  category: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  isLiked?: boolean;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const MyBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPosts, setTotalPosts] = useState(0);
  
  // Comment modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage, statusFilter]);

  const getAuthToken = () => localStorage.getItem('token');
  const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/my-posts`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  }
});


      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      const allPosts = data.data.map(post => ({
  ...post,
  likes: post.likes_count || 0
}));


      // Filter posts by current user
      const myUserId = getCurrentUser()._id;
      const filtered = allPosts.filter((post: BlogPost) => {
  if (!post.author) {
    console.warn('Bài viết thiếu thông tin author:', post);
    return false;
  }
  return post.author._id === myUserId;
});



      setPosts(filtered);
      setTotalPosts(filtered.length);
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId: string) => {
  Modal.confirm({
    title: 'Xác nhận xóa bài viết',
    content: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    async onOk() {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs/${postId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });

        if (!response.ok) {
          const errorRes = await response.json();
          throw new Error(errorRes.message || 'Xoá thất bại');
        }

        // Cập nhật danh sách sau khi xoá
        setPosts(prev => prev.filter(post => post._id !== postId));
        setTotalPosts(prev => prev - 1);
        message.success('✅ Xoá bài viết thành công');
      } catch (error: any) {
        console.error('❌ Lỗi xoá:', error);
        message.error(`Không thể xoá bài viết: ${error.message || 'Lỗi không xác định'}`);
      }
    }
  });
};


  const handleLikePost = async (postId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xử lý thả tym');
    }

    const data = await response.json(); // { liked: boolean, likes_count: number, message: string }

    // ✅ Cập nhật lại dữ liệu bài viết
    setPosts(prevPosts => prevPosts.map(post =>
      post._id === postId
        ? {
            ...post,
            isLiked: data.liked,
            likes: data.likes_count
          }
        : post
    ));

    message.success(data.message || (data.liked ? 'Đã thả tym' : 'Đã bỏ tym'));
  } catch (error: any) {
    console.error('❌ Lỗi thả tym:', error);
    message.error(error.message || 'Không thể thả tym');
  }
};



  const fetchComments = async (postId: string) => {
    setCommentLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${postId}/comments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.data || data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      message.error('Không thể tải bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) {
      message.error('Vui lòng nhập bình luận');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${selectedPost._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      fetchComments(selectedPost._id);
      
      // Update comment count in posts list
      setPosts(posts.map(post => 
        post._id === selectedPost._id 
          ? { ...post, comments: post.comments + 1 }
          : post
      ));

      message.success('Đã thêm bình luận');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Không thể thêm bình luận');
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!newReply.trim()) {
      message.error('Vui lòng nhập phản hồi');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blogs/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ content: newReply.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      setNewReply('');
      setReplyingTo(null);
      fetchComments(selectedPost!._id);
      message.success('Đã thêm phản hồi');
    } catch (error) {
      console.error('Error adding reply:', error);
      message.error('Không thể thêm phản hồi');
    }
  };

  const showCommentModal = (post: BlogPost) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
    fetchComments(post._id);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMyPosts();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'orange';
      case 'pending': return 'blue';
      default: return 'default';
    }
  };
const navigate = useNavigate();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchText || 
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderPostCard = (post: BlogPost) => (
    <Card
  key={post._id}
  hoverable
  style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
  styles={{ body: { padding: 0 } }}
>

      <Row gutter={0}>
        <Col xs={24} sm={8}>
  <div style={{ height: 200, overflow: 'hidden' }}>
    {post.image ? (
  <img
    src={post.image}
        alt="Thumbnail"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <div style={{
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <EyeOutlined style={{ fontSize: 24, marginRight: 8 }} />
        Không có ảnh
      </div>
    )}
  </div>
</Col>

        <Col xs={24} sm={16}>
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                {post.title}
              </Title>
              <Paragraph 
                style={{ margin: 0, color: '#666' }}
                ellipsis={{ rows: 2 }}
              >
                {post.excerpt}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                {post.tags?.map(tag => (
                  <Tag key={tag} color="#108ee9" style={{ margin: '2px 4px 2px 0' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                <span><CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span><EyeOutlined /> {post.views || 0}</span>
                <Button
  type="text"
  size="small"
  icon={post.isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
  onClick={() => handleLikePost(post._id)}
>
  {post.likes}
</Button>


                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => showCommentModal(post)}
                  style={{ padding: 0, color: '#666', border: 'none' }}
                >
                  {post.comments || 0}
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
            onClick={() => navigate(`/blog/post/${post._id}`)}
          >
            Xem bài viết
          </Button>
        )
      },
      {
        key: 'edit',
        label: (
          <Button
            type="text"
            block
            style={{ textAlign: 'left' }}
            icon={<EditOutlined />}
          >
            Chỉnh sửa
          </Button>
        )
      },
      {
        key: 'comment',
        label: (
          <Button
            type="text"
            block
            style={{ textAlign: 'left' }}
            icon={<MessageOutlined />}
            onClick={() => showCommentModal(post)}
          >
            Bình luận
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
              navigator.clipboard.writeText(`${window.location.origin}/blog/post/${post._id}`);
              message.success('Đã sao chép link bài viết');
            }}
          >
            Chia sẻ
          </Button>
        )
      },
      {
        key: 'delete',
        danger: true,
        label: (
          <Button
            type="text"
            block
            style={{ textAlign: 'left' }}
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeletePost(post._id)}
          >
            Xóa bài viết
          </Button>
        )
      }
    ]
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
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f7f9fa' }}>
      <Content style={{ padding: '24px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Bài viết của tôi
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onClick={() => navigate('/blog/write')}
              >
                Viết bài mới
              </Button>
            </div>
            
            <Text type="secondary">
              Quản lý và theo dõi tất cả bài viết của bạn
            </Text>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Tìm kiếm bài viết..."
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="published">Đã xuất bản</Option>
                  <Option value="draft">Bản nháp</Option>
                  <Option value="pending">Chờ duyệt</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
                  <Badge count={filteredPosts.length} color="#108ee9">
                    <Text type="secondary">
                      Tổng cộng bài viết
                    </Text>
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Posts List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Đang tải bài viết...</Text>
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              {filteredPosts.map(renderPostCard)}
              
              {totalPosts > pageSize && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Pagination
                    current={currentPage}
                    total={totalPosts}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} bài viết`
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} type="secondary">
                    {searchText || statusFilter !== 'all' ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
                  </Title>
                  <Text type="secondary">
                    {searchText || statusFilter !== 'all' 
                      ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                      : 'Hãy bắt đầu viết bài viết đầu tiên của bạn'
                    }
                  </Text>
                </div>
              }
              style={{ padding: 48 }}
            >
              {!searchText && statusFilter === 'all' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/blog/write')} 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    marginTop: 16
                  }}
                >
                  Viết bài viết đầu tiên
                </Button>
              )}
            </Empty>
          )}
        </div>
      </Content>

      {/* Comment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MessageOutlined />
            <span>Bình luận - {selectedPost?.title}</span>
          </div>
        }
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
          setComments([]);
          setReplyingTo(null);
          setNewComment('');
          setNewReply('');
        }}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
      >
        {/* Add Comment Form */}
        <div style={{ marginBottom: 24 }}>
          <TextArea
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Gửi bình luận
          </Button>
        </div>

        <Divider />

        {/* Comments List */}
        {commentLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Đang tải bình luận...</Text>
            </div>
          </div>
        ) : comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <Avatar 
                      src={comment.author.avatar} 
                      icon={<UserOutlined />}
                      size={32}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong>{comment.author.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </div>
                      <Text>{comment.content}</Text>
                    </div>
                  </div>
                  
                  <div style={{ marginLeft: 44, marginTop: 8 }}>
                    <Button 
                      type="text" 
                      size="small"
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    >
                      Phản hồi
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <div style={{ marginLeft: 44, marginTop: 12 }}>
                      <TextArea
                        rows={2}
                        placeholder="Viết phản hồi..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<SendOutlined />}
                          onClick={() => handleAddReply(comment._id)}
                          disabled={!newReply.trim()}
                        >
                          Gửi
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => {
                            setReplyingTo(null);
                            setNewReply('');
                          }}
                        >
                          Hủy
                        </Button>
                      </Space>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginLeft: 44, marginTop: 12 }}>
                      {comment.replies.map((reply) => (
                        <div key={reply._id} style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 8, 
                          marginBottom: 8,
                          padding: 8,
                          background: '#f8f9fa',
                          borderRadius: 6
                        }}>
                          <Avatar 
                            src={reply.author.avatar} 
                            icon={<UserOutlined />}
                            size={24}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <Text strong style={{ fontSize: 13 }}>{reply.author.name}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(reply.createdAt).toLocaleString('vi-VN')}
                              </Text>
                            </div>
                            <Text style={{ fontSize: 13 }}>{reply.content}</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có bình luận nào"
            style={{ padding: 24 }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MyBlogPosts;