import React, { useState, useEffect } from 'react';
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
  message
} from 'antd';
import { apiService } from '@/services/apiService';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SavedPost {
  _id: string;
  postId: string;
  savedAt: string;
  post: {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    thumbnail?: string;
    author: {
      _id: string;
      name: string;
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

const SavedBlogPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('saved_newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [categories, setCategories] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchSavedPosts();
      setSavedPosts(data.savedPosts || data || []);
      
      // Extract categories
      const uniqueCategories = [...new Set((data.savedPosts || data).map(item => item.post.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      message.error('Không thể tải bài viết đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    // Optimistic update
    setSavedPosts(prev => prev.map(item => 
      item.post._id === postId 
        ? {
            ...item,
            post: {
              ...item.post,
              isLiked: !isLiked,
              likes: isLiked ? item.post.likes - 1 : item.post.likes + 1
            }
          }
        : item
    ));
    
    try {
      if (isLiked) {
        await apiService.unlikePost(postId);
      } else {
        await apiService.likePost(postId);
      }
    } catch (error) {
      // Revert on error
      setSavedPosts(prev => prev.map(item => 
        item.post._id === postId 
          ? {
              ...item,
              post: {
                ...item.post,
                isLiked: isLiked,
                likes: isLiked ? item.post.likes + 1 : item.post.likes - 1
              }
            }
          : item
      ));
      message.error('Không thể cập nhật trạng thái like');
    }
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
          setSavedPosts(prev => prev.filter(item => item._id !== savedPostId));
          message.success('Đã bỏ lưu bài viết');
        } catch (error) {
          message.error('Không thể bỏ lưu bài viết');
        }
      }
    });
  };

  const filteredAndSortedPosts = () => {
    const filtered = savedPosts.filter(item => {
      const matchesSearch = item.post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.excerpt.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.author.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.post.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || item.post.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
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
  };

  const processedPosts = filteredAndSortedPosts();
  const paginatedPosts = processedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderSavedPostCard = (savedPost: SavedPost) => {
    const { post } = savedPost;
    return (
      <Card
        key={savedPost._id}
        hoverable
        style={{ marginBottom: 24, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <Row gutter={0}>
          <Col xs={24} sm={8}>
            <div 
              style={{ 
                height: 200, 
                background: post.thumbnail ? `url(${post.thumbnail})` : 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/blog/post/${post._id}`)}
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
                gap: 4
              }}>
                <ClockCircleOutlined />
                {post.readingTime} phút
              </div>
            </div>
          </Col>
          <Col xs={24} sm={16}>
            <div style={{ padding: 24 }}>
              <Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  marginBottom: 8, 
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/blog/post/${post._id}`)}
              >
                {post.title}
              </Title>
              
              <Paragraph 
                style={{ color: '#666', marginBottom: 12 }}
                ellipsis={{ rows: 2 }}
              >
                {post.excerpt}
              </Paragraph>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Avatar 
                  size={28}
                  src={post.author.avatar}
                  icon={<UserOutlined />}
                />
                <div style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                    {post.author.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999' }}>
                    {post.category} • {formatDate(post.createdAt)}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Space wrap>
                  {post.tags.slice(0, 3).map(tag => (
                    <Tag 
                      key={tag} 
                      style={{ borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => setSearchText(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                  {post.tags.length > 3 && (
                    <Tag>+{post.tags.length - 3}</Tag>
                  )}
                </Space>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 13 }}>
                  <Tooltip title={`Đã lưu vào ${formatDate(savedPost.savedAt)}`}>
                    <span><BookOutlined /> {formatDate(savedPost.savedAt)}</span>
                  </Tooltip>
                  <span><EyeOutlined /> {post.views.toLocaleString()}</span>
                  <span><MessageOutlined /> {post.comments}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={post.isLiked ? <HeartFilled style={{ color: '#ff4757' }} /> : <HeartOutlined />}
                    onClick={() => handleLikeToggle(post._id, post.isLiked)}
                  >
                    {post.likes}
                  </Button>
                  
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'view',
                          label: 'Xem bài viết',
                          icon: <EyeOutlined />,
                          onClick: () => navigate(`/blog/post/${post._id}`)
                        },
                        {
                          key: 'share',
                          label: 'Chia sẻ',
                          icon: <ShareAltOutlined />,
                          onClick: () => {
                            navigator.clipboard.writeText(`${window.location.origin}/blog/post/${post._id}`);
                            message.success('Đã copy link bài viết');
                          }
                        },
                        {
                          key: 'unsave',
                          label: 'Bỏ lưu',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handleUnsavePost(savedPost._id, post.title)
                        }
                      ]
                    }}
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

  return (
    <div style={{ padding: '24px 0', minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Bài viết đã lưu</Title>
          <Text style={{ color: '#666' }}>
            Quản lý và xem lại các bài viết bạn đã lưu
          </Text>
        </div>

        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm bài viết..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
              >
                <Option value="all">Tất cả</Option>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>
              Đang tải bài viết...
            </div>
          </div>
        ) : (
          <>
            {paginatedPosts.length > 0 ? (
              <>
                <div>
                  {paginatedPosts.map(renderSavedPostCard)}
                </div>
                
                {processedPosts.length > pageSize && (
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Pagination
                      current={currentPage}
                      total={processedPosts.length}
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
              <Empty
                description="Chưa có bài viết đã lưu"
                style={{ padding: 60, background: '#fff', borderRadius: 12 }}
              >
                <Button 
                  type="primary" 
                  onClick={() => navigate('/blog')}
                >
                  Khám phá bài viết
                </Button>
              </Empty>
            )}
          </>
        )}
      </Content>
    </div>
  );
};

export default SavedBlogPosts;