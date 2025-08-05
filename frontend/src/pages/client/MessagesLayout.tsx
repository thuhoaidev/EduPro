import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import MessagesSidebar from '../../components/messages/MessagesSidebar';    
import AppHeader from '../layout/Header';
import './MessagesLayout.css';

const { Text } = Typography;

const MessagesLayout: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedUserId(userId);
  }, [userId]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để sử dụng tính năng tin nhắn');
      setLoading(false);
      return;
    }
    
    // Additional validation if needed
    try {
      // You can add more validation here
      setLoading(false);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải trang tin nhắn');
      setLoading(false);
    }
  }, [navigate]);

  const handleUserSelect = (newUserId: string) => {
    setSelectedUserId(newUserId);
  };

  const handleBackToMessages = () => {
    navigate('/messages');
  };

  // Debug: Log layout info
  useEffect(() => {
    // Ẩn debug info để giao diện sạch sẽ
    // console.log('MessagesLayout - Layout Info:');
    // console.log('- Viewport height:', window.innerHeight);
    // console.log('- Header height: 72px');
    // console.log('- Layout height:', window.innerHeight - 72);
    // console.log('- Selected user ID:', selectedUserId);
  }, [selectedUserId]);

  if (loading) {
    return (
      <div className="messages-layout-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16, color: '#8c8c8c' }}>
          Đang tải tin nhắn...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-layout-error">
        <div className="error-content">
          <MessageOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
          <Typography.Title level={4} style={{ color: '#ff4d4f', marginBottom: 8 }}>
            Lỗi xác thực
          </Typography.Title>
          <Text type="secondary" style={{ marginBottom: 24, textAlign: 'center' }}>
            {error}
          </Text>
          <Button type="primary" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-layout-wrapper">
      <header className="messages-header-wrapper">
        <AppHeader />
      </header>
      
      <div className="messages-layout">
        <MessagesSidebar 
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
        />
        
        <main className="messages-content">
          {selectedUserId ? (
            <Outlet />
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-state">
                <MessageOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                <Typography.Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>
                  Chưa có cuộc trò chuyện nào
                </Typography.Title>
                <Text type="secondary" style={{ marginBottom: 24, textAlign: 'center' }}>
                  Chọn một người dùng từ danh sách bên trái để bắt đầu cuộc trò chuyện
                </Text>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  onClick={handleBackToMessages}
                >
                  Quay lại tin nhắn
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesLayout;
