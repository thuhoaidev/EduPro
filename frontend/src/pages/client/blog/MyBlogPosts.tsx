import React, { useState, useEffect } from 'react';
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
  Pagination
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  CalendarOutlined,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage, statusFilter]);

  const fetchMyPosts = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    const allPosts = data.data || data;

    // Nếu muốn chỉ hiện bài viết của mình thì lọc ở đây (nếu backend có gán req.user._id vào mỗi blog):
    const myUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
    const filtered = allPosts.filter((post: BlogPost) => post.author._id === myUserId);

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
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/blogs/${postId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to delete post');
          }

          setPosts(posts.filter(post => post._id !== postId));
          setTotalPosts(prev => prev - 1);
          message.success('Xóa bài viết thành công');
        } catch (error) {
          console.error('Error deleting post:', error);
          message.error('Không thể xóa bài viết');
        }
      }
    });
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await fetch(`${API_BASE_URL}/blogs/${postId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} post`);
      }

      // Update post likes count in local state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      message.error('Không thể thực hiện hành động này');
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchText) return true;
    return post.title.toLowerCase().includes(searchText.toLowerCase()) ||
           post.excerpt?.toLowerCase().includes(searchText.toLowerCase());
  });

  const renderPostCard = (post: BlogPost) => (
    <Card
      key={post._id}
      hoverable
      style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}
      styles={{ body: { padding: 0 } }}
    >
      <Row gutter={0}>
        <Col xs={24} sm={8}>
          <div style={{ 
            height: 200, 
            background: post.thumbnail ? `url(${post.thumbnail})` : '#f0f0f0',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            {!post.thumbnail && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#999',
                fontSize: 16
              }}>
                Không có ảnh
              </div>
            )}
            <Tag 
              color={getStatusColor(post.status)}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                margin: 0,
                fontWeight: 500
              }}
            >
              {getStatusText(post.status)}
            </Tag>
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
                  <Tag key={tag} style={{ margin: '2px 4px 2px 0' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                <span><CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span><EyeOutlined /> {post.views || 0}</span>
                <span><HeartOutlined /> {post.likes || 0}</span>
                <span><MessageOutlined /> {post.comments || 0}</span>
              </div>
              
              <Dropdown
                overlay={
                  <div style={{
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 8,
                    minWidth: 160
                  }}>
                    <Button
                      type="text"
                      block
                      style={{ textAlign: 'left', marginBottom: 4 }}
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/blog/post/${post._id}`)}
                    >
                      Xem bài viết
                    </Button>
                    <Button
                      type="text"
                      block
                      style={{ textAlign: 'left', marginBottom: 4 }}
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/blog/edit/${post._id}`)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="text"
                      block
                      style={{ textAlign: 'left', marginBottom: 4 }}
                      icon={<ShareAltOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/blog/post/${post._id}`);
                        message.success('Đã sao chép link bài viết');
                      }}
                    >
                      Chia sẻ
                    </Button>
                    <Button
                      type="text"
                      block
                      danger
                      style={{ textAlign: 'left' }}
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Xóa bài viết
                    </Button>
                  </div>
                }
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
              <Title level={2} style={{ margin: 0 }}>
                Bài viết của tôi
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/blog/write')}
                style={{ 
                  background: '#1a73e8',
                  borderColor: '#1a73e8',
                  borderRadius: 8,
                  fontWeight: 500
                }}
              >
                Viết bài mới
              </Button>
            </div>
            
            <Text type="secondary">
              Quản lý và theo dõi tất cả bài viết của bạn
            </Text>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
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
                  <Text type="secondary">
                    Tổng cộng: {totalPosts} bài viết
                  </Text>
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
                    background: '#1a73e8',
                    borderColor: '#1a73e8',
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
    </Layout>
  );
};

export default MyBlogPosts;