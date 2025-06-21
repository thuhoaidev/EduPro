//Bài viết nổi bật
import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Avatar, 
  Input, 
  Select, 
  Pagination, 
  Spin,
  Empty,
  Button,
  Space,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Mock data cho bài viết nổi bật
const mockFeaturedPosts = [
  {
    id: 1,
    title: "Hướng dẫn React Hook từ cơ bản đến nâng cao",
    content: "React Hook là một tính năng mạnh mẽ được giới thiệu từ React 16.8, cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class component...",
    author: {
      name: "Nguyễn Văn A",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=4f8cff&color=fff&size=40",
      role: "Senior Developer"
    },
    category: "Frontend",
    tags: ["React", "JavaScript", "Web Development"],
    views: 2543,
    likes: 156,
    comments: 23,
    publishedAt: "2024-06-15",
    readTime: "12 phút đọc",
    featured: true,
    featuredReason: "Bài viết có nhiều tương tác nhất tuần",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Machine Learning cơ bản: Từ lý thuyết đến thực hành",
    content: "Machine Learning đang trở thành một trong những lĩnh vực hot nhất trong công nghệ thông tin. Bài viết này sẽ giúp bạn hiểu rõ về các khái niệm cơ bản...",
    author: {
      name: "Trần Thị B",
      avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=52c41a&color=fff&size=40",
      role: "AI Researcher"
    },
    category: "AI/ML",
    tags: ["Machine Learning", "Python", "Data Science"],
    views: 1876,
    likes: 203,
    comments: 45,
    publishedAt: "2024-06-14",
    readTime: "18 phút đọc",
    featured: true,
    featuredReason: "Được Admin đánh dấu nổi bật",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Thiết kế UI/UX hiện đại với Figma",
    content: "Figma đã trở thành công cụ thiết kế UI/UX được yêu thích nhất hiện nay. Trong bài viết này, chúng ta sẽ tìm hiểu các kỹ thuật thiết kế hiện đại...",
    author: {
      name: "Lê Văn C",
      avatar: "https://ui-avatars.com/api/?name=Le+Van+C&background=f5222d&color=fff&size=40",
      role: "UX Designer"
    },
    category: "Design",
    tags: ["UI/UX", "Figma", "Design System"],
    views: 1234,
    likes: 89,
    comments: 12,
    publishedAt: "2024-06-13",
    readTime: "15 phút đọc",
    featured: true,
    featuredReason: "Trending trong tuần",
    thumbnail: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "DevOps và CI/CD: Tự động hóa quy trình phát triển",
    content: "DevOps không chỉ là một tập hợp các công cụ mà còn là một văn hóa làm việc. Bài viết này sẽ hướng dẫn bạn xây dựng pipeline CI/CD hoàn chỉnh...",
    author: {
      name: "Phạm Văn D",
      avatar: "https://ui-avatars.com/api/?name=Pham+Van+D&background=722ed1&color=fff&size=40",
      role: "DevOps Engineer"
    },
    category: "DevOps",
    tags: ["DevOps", "CI/CD", "Docker", "Kubernetes"],
    views: 987,
    likes: 67,
    comments: 8,
    publishedAt: "2024-06-12",
    readTime: "20 phút đọc",
    featured: true,
    featuredReason: "Chủ đề hot",
    thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Blockchain và Cryptocurrency: Tương lai của tài chính",
    content: "Blockchain không chỉ là công nghệ đằng sau Bitcoin mà còn có tiềm năng ứng dụng rộng rãi trong nhiều lĩnh vực khác nhau...",
    author: {
      name: "Hoàng Thị E",
      avatar: "https://ui-avatars.com/api/?name=Hoang+Thi+E&background=fa8c16&color=fff&size=40",
      role: "Blockchain Developer"
    },
    category: "Blockchain",
    tags: ["Blockchain", "Cryptocurrency", "Smart Contract"],
    views: 1456,
    likes: 112,
    comments: 34,
    publishedAt: "2024-06-11",
    readTime: "16 phút đọc",
    featured: true,
    featuredReason: "Bài viết chất lượng cao",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Cybersecurity: Bảo mật thông tin trong kỷ nguyên số",
    content: "Với sự phát triển của công nghệ, các mối đe dọa an ninh mạng cũng ngày càng tinh vi. Bài viết này sẽ giúp bạn hiểu rõ về các biện pháp bảo mật...",
    author: {
      name: "Vũ Văn F",
      avatar: "https://ui-avatars.com/api/?name=Vu+Van+F&background=13c2c2&color=fff&size=40",
      role: "Security Expert"
    },
    category: "Security",
    tags: ["Cybersecurity", "Network Security", "Ethical Hacking"],
    views: 2100,
    likes: 178,
    comments: 56,
    publishedAt: "2024-06-10",
    readTime: "14 phút đọc",
    featured: true,
    featuredReason: "Nhiều người quan tâm",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop"
  }
];

const categories = ["Tất cả", "Frontend", "AI/ML", "Design", "DevOps", "Blockchain", "Security"];

const FeaturedPostsPage = () => {
  const [posts, setPosts] = useState(mockFeaturedPosts);
  const [filteredPosts, setFilteredPosts] = useState(mockFeaturedPosts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  // Lọc và tìm kiếm bài viết
  useEffect(() => {
    let filtered = [...posts];

    // Lọc theo category
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Tìm kiếm theo title và content
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'publishedAt':
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Tính toán dữ liệu phân trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getFeaturedIcon = (reason) => {
    if (reason.includes('tương tác')) return <FireOutlined style={{ color: '#ff4d4f' }} />;
    if (reason.includes('Admin')) return <TrophyOutlined style={{ color: '#faad14' }} />;
    if (reason.includes('Trending')) return <StarOutlined style={{ color: '#722ed1' }} />;
    return <FireOutlined style={{ color: '#1890ff' }} />;
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Content style={{ padding: '24px' }}>
        {/* Header Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '48px 32px',
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center'
        }}>
          <FireOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#ffd700' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontSize: '42px' }}>
            Bài Viết Nổi Bật
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Khám phá những bài viết được cộng đồng yêu thích và chuyên gia đánh giá cao
          </Text>
        </div>

        {/* Filters Section */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm bài viết..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '8px' }}
                size="large"
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                size="large"
              >
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="publishedAt">Mới nhất</Option>
                <Option value="views">Lượt xem</Option>
                <Option value="likes">Lượt thích</Option>
                <Option value="comments">Bình luận</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Text style={{ color: '#666', fontSize: '14px' }}>
                Tìm thấy <strong>{filteredPosts.length}</strong> bài viết nổi bật
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Posts Grid */}
        <Spin spinning={loading}>
          {currentPosts.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {currentPosts.map((post, index) => (
                  <Col xs={24} sm={12} lg={8} key={post.id}>
                    <Card
                      hoverable
                      style={{ 
                        height: '100%',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.3s ease'
                      }}
                      cover={
                        <div style={{ position: 'relative' }}>
                          <img
                            alt={post.title}
                            src={post.thumbnail}
                            style={{ 
                              height: '200px', 
                              width: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {getFeaturedIcon(post.featuredReason)}
                            Nổi bật
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#1890ff',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {post.category}
                          </div>
                        </div>
                      }
                    >
                      <div style={{ padding: '8px 0' }}>
                        {/* Featured Reason */}
                        <Tag 
                          color="gold" 
                          style={{ 
                            marginBottom: '12px',
                            borderRadius: '12px',
                            fontSize: '11px'
                          }}
                        >
                          {post.featuredReason}
                        </Tag>

                        {/* Title */}
                        <Title 
                          level={4} 
                          style={{ 
                            marginBottom: '12px',
                            fontSize: '18px',
                            lineHeight: '1.4',
                            height: '50px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {post.title}
                        </Title>

                        {/* Content Preview */}
                        <Paragraph 
                          style={{ 
                            color: '#666',
                            fontSize: '14px',
                            marginBottom: '16px',
                            height: '60px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {post.content}
                        </Paragraph>

                        {/* Tags */}
                        <div style={{ marginBottom: '16px' }}>
                          {post.tags.slice(0, 3).map(tag => (
                            <Tag 
                              key={tag} 
                              style={{ 
                                marginBottom: '4px',
                                borderRadius: '12px',
                                fontSize: '11px'
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Author Info */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '16px' 
                        }}>
                          <Avatar 
                            src={post.author.avatar} 
                            style={{ marginRight: '12px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: '14px' }}>
                              {post.author.name}
                            </Text>
                            <div>
                              <Text style={{ fontSize: '12px', color: '#999' }}>
                                {post.author.role}
                              </Text>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <Space size="large">
                            <Space size="small">
                              <EyeOutlined style={{ color: '#999' }} />
                              <Text style={{ fontSize: '13px', color: '#666' }}>
                                {formatNumber(post.views)}
                              </Text>
                            </Space>
                            <Space size="small">
                              <LikeOutlined style={{ color: '#ff4d4f' }} />
                              <Text style={{ fontSize: '13px', color: '#666' }}>
                                {formatNumber(post.likes)}
                              </Text>
                            </Space>
                            <Space size="small">
                              <CommentOutlined style={{ color: '#1890ff' }} />
                              <Text style={{ fontSize: '13px', color: '#666' }}>
                                {post.comments}
                              </Text>
                            </Space>
                          </Space>
                        </div>

                        {/* Date and Read Time */}
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Space size="small">
                            <ClockCircleOutlined style={{ color: '#999' }} />
                            <Text style={{ fontSize: '12px', color: '#999' }}>
                              {formatDate(post.publishedAt)}
                            </Text>
                          </Space>
                          <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                            {post.readTime}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {filteredPosts.length > pageSize && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '48px',
                  marginBottom: '24px'
                }}>
                  <Pagination
                    current={currentPage}
                    total={filteredPosts.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} của ${total} bài viết`
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <Empty
                description="Không tìm thấy bài viết nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tất cả');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Empty>
            </div>
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default FeaturedPostsPage;