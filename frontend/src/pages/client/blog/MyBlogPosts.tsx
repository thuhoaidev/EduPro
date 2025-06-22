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
  Avatar, 
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
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
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
  id: string;
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
}

const MyBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();

  // Mock data - thay thế bằng API thực tế
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Hướng dẫn học React từ cơ bản đến nâng cao',
      content: 'Nội dung chi tiết về React...',
      excerpt: 'React là một thư viện JavaScript mạnh mẽ để xây dựng giao diện người dùng. Trong bài viết này, chúng ta sẽ tìm hiểu từ những khái niệm cơ bản nhất...',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
      status: 'published',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      views: 1250,
      likes: 89,
      comments: 23,
      tags: ['React', 'JavaScript', 'Frontend'],
      category: 'Lập trình'
    },
    {
      id: '2',
      title: 'Tối ưu hóa hiệu suất ứng dụng web',
      content: 'Nội dung về tối ưu hóa...',
      excerpt: 'Hiệu suất ứng dụng web là yếu tố quan trọng quyết định trải nghiệm người dùng. Bài viết này sẽ chia sẻ những techniques...',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
      status: 'published',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      views: 856,
      likes: 67,
      comments: 15,
      tags: ['Performance', 'Web Development', 'Optimization'],
      category: 'Lập trình'
    },
    {
      id: '3',
      title: 'Thiết kế UI/UX cho ứng dụng mobile',
      content: 'Nội dung về UI/UX...',
      excerpt: 'Thiết kế giao diện cho ứng dụng mobile có những đặc thù riêng. Chúng ta cần chú ý đến trải nghiệm người dùng...',
      thumbnail: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=400&h=200&fit=crop',
      status: 'draft',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
      views: 0,
      likes: 0,
      comments: 0,
      tags: ['UI/UX', 'Mobile', 'Design'],
      category: 'Thiết kế'
    },
    {
      id: '4',
      title: 'Xu hướng công nghệ 2024',
      content: 'Nội dung về xu hướng...',
      excerpt: 'Năm 2024 đánh dấu nhiều bước tiến quan trọng trong ngành công nghệ. AI, blockchain, và metaverse tiếp tục...',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
      status: 'pending',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-06',
      views: 432,
      likes: 34,
      comments: 8,
      tags: ['Technology', 'Trends', '2024'],
      category: 'Công nghệ'
    }
  ];

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      // Thay thế bằng API call thực tế
      // const response = await config.get('/blog/my-posts', {
      //   params: { page: currentPage, limit: pageSize }
      // });
      
      // Mock API response
      setTimeout(() => {
        setPosts(mockPosts);
        setTotalPosts(mockPosts.length);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Không thể tải bài viết');
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
          // await config.delete(`/blog/posts/${postId}`);
          setPosts(posts.filter(post => post.id !== postId));
          message.success('Xóa bài viết thành công');
        } catch (error) {
          message.error('Không thể xóa bài viết');
        }
      }
    });
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
    const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderPostCard = (post: BlogPost) => (
    <Card
      key={post.id}
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
                {post.tags.map(tag => (
                  <Tag key={tag} style={{ margin: '2px 4px 2px 0' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                <span><CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span><EyeOutlined /> {post.views}</span>
                <span><HeartOutlined /> {post.likes}</span>
                <span><MessageOutlined /> {post.comments}</span>
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
                      onClick={() => navigate(`/blog/post/${post.id}`)}
                    >
                      Xem bài viết
                    </Button>
                    <Button
                      type="text"
                      block
                      style={{ textAlign: 'left', marginBottom: 4 }}
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/blog/edit/${post.id}`)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="text"
                      block
                      style={{ textAlign: 'left', marginBottom: 4 }}
                      icon={<ShareAltOutlined />}
                    >
                      Chia sẻ
                    </Button>
                    <Button
                      type="text"
                      block
                      danger
                      style={{ textAlign: 'left' }}
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeletePost(post.id)}
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
                    Tổng cộng: {filteredPosts.length} bài viết
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
          ) : paginatedPosts.length > 0 ? (
            <>
              {paginatedPosts.map(renderPostCard)}
              
              {filteredPosts.length > pageSize && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Pagination
                    current={currentPage}
                    total={filteredPosts.length}
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