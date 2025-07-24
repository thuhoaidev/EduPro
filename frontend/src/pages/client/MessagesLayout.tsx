import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Layout, Empty, Spin, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MessagesSidebar from '../../components/messages/MessagesSidebar';    
import AppHeader from '../layout/Header';
import './MessagesLayout.css';

const { Content, Header } = Layout;

const MessagesLayout: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedUserId(userId);
  }, [userId]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [navigate]);

  const handleUserSelect = (newUserId: string) => {
    setSelectedUserId(newUserId);
  };

  if (loading) {
    return (
      <div className="messages-layout-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="messages-layout-wrapper">
      <Header className="messages-header-wrapper">
        <AppHeader />
      </Header>
      
      <Layout className="messages-layout">
        <MessagesSidebar 
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
        />
        
        <Content className="messages-content">
          {selectedUserId ? (
            <Outlet />
          ) : (
            <div className="no-conversation-selected">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn một cuộc trò chuyện để bắt đầu"
              />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MessagesLayout;
