import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Space, Typography, Avatar, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, BookOutlined, BookFilled, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    fullname: string;
    avatar?: string;
    nickname?: string;
  };
  createdAt: string;
  updatedAt: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
  isSaved?: boolean;
  save_count: number;
}

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/blogs/${id}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải thông tin bài viết');
        }

        const data = await response.json();
        setBlog(data.data);
        setLiked(data.data.isLiked || false);
        setSaved(data.data.isSaved || false);
      } catch (error) {
        console.error('Error fetching blog detail:', error);
        message.error('Không thể tải thông tin bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  const handleLike = async () => {
    if (!blog) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập để thích bài viết');
        return;
      }

      const response = await fetch(`/api/blogs/${blog._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setLiked(!liked);
        setBlog(prev => prev ? {
          ...prev,
          likes_count: liked ? prev.likes_count - 1 : prev.likes_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      message.error('Không thể thích bài viết');
    }
  };

  const handleSave = async () => {
    if (!blog) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập để lưu bài viết');
        return;
      }

      const response = await fetch(`/api/blogs/${blog._id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSaved(!saved);
        setBlog(prev => prev ? {
          ...prev,
          save_count: saved ? prev.save_count - 1 : prev.save_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      message.error('Không thể lưu bài viết');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Không tìm thấy bài viết</Title>
        <Button type="primary" onClick={() => navigate('/blog')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/blog')}
        >
          Quay lại
        </Button>
      </Space>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Title level={2}>{blog.title}</Title>
            
            <Space style={{ marginBottom: '16px' }}>
              <Avatar 
                src={blog.author.avatar} 
                icon={<UserOutlined />}
                size="small"
              />
              <Text strong>{blog.author.fullname}</Text>
              {blog.author.nickname && (
                <Text type="secondary">@{blog.author.nickname}</Text>
              )}
              <Text type="secondary">
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </Space>

            <Space>
              <Button 
                type={liked ? 'primary' : 'default'}
                icon={liked ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleLike}
              >
                {blog.likes_count} Thích
              </Button>
              <Button 
                type={saved ? 'primary' : 'default'}
                icon={saved ? <BookFilled /> : <BookOutlined />}
                onClick={handleSave}
              >
                {blog.save_count} Lưu
              </Button>
              <Text type="secondary">
                {blog.comments_count} Bình luận
              </Text>
            </Space>
          </div>

          {blog.image && (
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <img 
                src={blog.image} 
                alt={blog.title}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          )}

          <Divider />

          <div 
            style={{ 
              fontSize: '16px', 
              lineHeight: '1.8',
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ 
              __html: blog.content.replace(/\n/g, '<br>') 
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default BlogDetailPage; 