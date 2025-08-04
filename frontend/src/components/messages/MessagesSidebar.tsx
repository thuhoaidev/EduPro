import React, { useState, useEffect } from 'react';
import { List, Avatar, Typography, Input, Badge, Spin, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './MessagesSidebar.css';

const { Text } = Typography;
const { Search } = Input;

interface Conversation {
  _id: string;
  fullname: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  isFollowing: boolean;
  lastMessageTime: string;
}

interface MessagesSidebarProps {
  selectedUserId?: string;
  onUserSelect: (userId: string) => void;
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({ selectedUserId, onUserSelect }) => {
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy danh sách cuộc trò chuyện (bao gồm cả người lạ)
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('Fetching conversations...');
      const response = await axios.get(`http://localhost:5000/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Conversations response:', response.data);
      return response.data.data || [];
    },
    refetchInterval: 30000 // Refresh mỗi 30 giây thay vì 5 giây để giảm tải backend
  });

  useEffect(() => {
    if (conversations) {
      if (searchValue) {
        const filtered = conversations.filter((conv: Conversation) =>
          conv.fullname.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredConversations(filtered);
      } else {
        setFilteredConversations(conversations);
      }
    }
  }, [searchValue, conversations]);

  // Lắng nghe sự kiện follow/unfollow để refresh data
  useEffect(() => {
    const handleFollowChange = () => {
      // Invalidate và refetch conversations khi có thay đổi follow
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Lắng nghe custom events
    window.addEventListener('followStatusChanged', handleFollowChange);
    window.addEventListener('messageReceived', handleFollowChange);
    window.addEventListener('messageSent', handleFollowChange);

    return () => {
      window.removeEventListener('followStatusChanged', handleFollowChange);
      window.removeEventListener('messageReceived', handleFollowChange);
      window.removeEventListener('messageSent', handleFollowChange);
    };
  }, [queryClient]);

  const handleUserClick = (userId: string) => {
    onUserSelect(userId);
    navigate(`/messages/${userId}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ`;
    return `${Math.floor(diffInMinutes / 1440)} ngày`;
  };

  const truncateMessage = (message: string, maxLength: number = 30) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h3>Tin nhắn</h3>
        </div>
        <div className="sidebar-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="messages-sidebar">
      <div className="sidebar-header">
        <h3>Tin nhắn</h3>
        <Search
          placeholder="Tìm kiếm cuộc trò chuyện..."
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          prefix={<SearchOutlined />}
          className="sidebar-search"
        />
      </div>

      <div className="sidebar-content">
        {filteredConversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có cuộc trò chuyện nào"
          />
        ) : (
          <List
            dataSource={filteredConversations}
            renderItem={(conversation: Conversation) => (
              <List.Item
                key={conversation._id}
                className={`user-item ${selectedUserId === conversation._id ? 'selected' : ''}`}
                onClick={() => handleUserClick(conversation._id)}
              >
                <div className="user-info">
                  <div className="user-avatar-wrapper">
                    <Avatar
                      src={conversation.avatar}
                      icon={<UserOutlined />}
                      size={48}
                      className="user-avatar"
                    />
                    {conversation.unreadCount > 0 && (
                      <Badge
                        count={conversation.unreadCount}
                        className="user-badge"
                        size="small"
                      />
                    )}
                  </div>
                  
                  <div className="user-details">
                    <div className="user-name-row">
                      <Text strong className="user-name">
                        {conversation.isFollowing ? conversation.fullname : 'Người lạ'}
                      </Text>
                      {conversation.lastMessage && (
                        <Text className="message-time">
                          {formatTime(conversation.lastMessageTime)}
                        </Text>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <Text className="last-message" type="secondary">
                        {truncateMessage(conversation.lastMessage.content)}
                      </Text>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesSidebar;
