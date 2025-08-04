import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, Avatar, Typography, message as antMessage, Spin } from 'antd';
import { SendOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EventEmitter } from '../../utils/eventEmitter';
import './MessagesPage.css';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface UserInfo {
  _id: string;
  fullname: string;
  avatar?: string;
  slug?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
}, (error) => Promise.reject(error));

const MessagesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [receiver, setReceiver] = useState<UserInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingReceiver, setLoadingReceiver] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Log userId khi vào trang
  useEffect(() => {
    console.log('userId trên URL:', userId);
  }, [userId]);

  // Lấy thông tin người nhận
  useEffect(() => {
    if (!userId) {
      console.log('No userId provided');
      return;
    }
    
    console.log('=== FETCHING RECEIVER INFO ===');
    console.log('userId from URL:', userId);
    
    setLoadingReceiver(true);
    
    // Thử tìm theo ID trước
    console.log('Trying to find user by ID:', userId);
    api.get(`/api/users/profile/${userId}`)
      .then(res => {
        console.log('SUCCESS: Found receiver by ID:', res.data);
        if (res.data.success && res.data.data) {
          setReceiver(res.data.data);
          setLoadingReceiver(false);
        } else {
          console.log('Response success=false or no data, trying slug...');
          throw new Error('No data in response');
        }
      })
      .catch(() => {
       
        
        // Nếu không tìm thấy theo ID, thử tìm theo slug
        api.get(`/api/users/slug/${userId}`)
          .then(res2 => {
            console.log('SUCCESS: Found receiver by slug:', res2.data);
            if (res2.data.success && res2.data.data) {
              setReceiver(res2.data.data);
            } else {
              console.log('Slug response success=false or no data');
              setReceiver(null);
            }
          })
          .catch(err2 => {
            console.log('Failed to find by slug, error:', err2.response?.status, err2.response?.data);
            console.log('FINAL ERROR: Không tìm thấy receiver với ID/slug:', userId);
            setReceiver(null);
          })
          .finally(() => setLoadingReceiver(false));
      });
  }, [userId]);

  // Lấy thông tin user hiện tại
  useEffect(() => {
    setLoadingUser(true);
    api.get('/api/users/me')
      .then(res => {
        console.log('Current user:', res.data.data);
        setCurrentUser(res.data.data);
      })
      .catch(() => {
        console.log('Không lấy được currentUser');
        setCurrentUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  // Lấy danh sách tin nhắn giữa 2 user
  useEffect(() => {
    if (!userId || !currentUser) return;
    const fetchMessages = () => {
      api.get(`/api/messages/${userId}`)
        .then(res => setMessages(res.data.data))
        .catch(() => setMessages([]));
    };
    fetchMessages();
    // Polling mỗi 10s thay vì 3s để giảm tải backend
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [userId, currentUser]);

  // Lắng nghe sự kiện follow/unfollow để refresh receiver info
  useEffect(() => {
    const handleFollowUpdate = (event: CustomEvent) => {
      const data = event.detail;
      // Nếu follow/unfollow user hiện tại, refresh receiver info
      if (data?.targetUserId === userId || !data) {
        console.log('Follow status updated, refreshing receiver info...');
        // Refresh receiver info
        if (userId) {
          setLoadingReceiver(true);
          api.get(`/api/users/profile/${userId}`)
            .then(res => {
              if (res.data.success && res.data.data) {
                setReceiver(res.data.data);
              }
            })
            .catch(() => {
              api.get(`/api/users/slug/${userId}`)
                .then(res2 => {
                  if (res2.data.success && res2.data.data) {
                    setReceiver(res2.data.data);
                  }
                })
                .catch(() => console.log('Failed to refresh receiver info'));
            })
            .finally(() => setLoadingReceiver(false));
        }
      }
    };

    EventEmitter.on('followStatusChanged', handleFollowUpdate);
    return () => {
      EventEmitter.off('followStatusChanged', handleFollowUpdate);
    };
  }, [userId]);

  // Gửi tin nhắn
  const handleSend = async () => {
    // Kiểm tra input
    
    if (!input.trim()) {
      console.log('ERROR: Input is empty');
      antMessage.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    
    if (!currentUser) {
      console.log('ERROR: Current user is null');
      antMessage.error('Bạn chưa đăng nhập');
      return;
    }
    
    if (!receiver) {
      console.log('ERROR: Receiver is null');
      antMessage.error('Không tìm thấy người nhận');
      return;
    }
    
    if (!receiver._id) {
      console.log('ERROR: Receiver ID is missing');
      antMessage.error('ID người nhận không hợp lệ');
      return;
    }
    
    try {
      const requestData = {
        receiverId: receiver._id,
        content: input.trim(),
      };
      
      console.log('Sending request with data:', requestData);
      
      const res = await api.post('/api/messages', requestData);
      
      console.log('Response received:', res.data);
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setInput('');
      } else {
      
        antMessage.error(res.data.message || 'Gửi tin nhắn thất bại');
      }
    } catch (err: any) {
      
      
      const errorMessage = err.response?.data?.message || 'Gửi tin nhắn thất bại';
      const debugInfo = err.response?.data?.debug;
      
      if (debugInfo) {
        console.log('Debug info from server:', debugInfo);
      }
      
      antMessage.error(errorMessage);
    }
  };

  if (loadingUser || loadingReceiver) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="error-container">
        <Typography.Title level={4}>Lỗi xác thực</Typography.Title>
        <Typography.Text>Không xác định được người dùng hiện tại. Vui lòng đăng nhập lại.</Typography.Text>
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          Đăng nhập
        </Button>
      </div>
    );
  }
  
  if (!receiver) {
    return (
      <div className="error-container">
        <Typography.Title level={4}>Không tìm thấy người dùng</Typography.Title>
        <Typography.Text>Không tìm thấy người nhận tin nhắn.</Typography.Text>
        <Button type="primary" onClick={() => navigate('/messages')} style={{ marginTop: 16 }}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="messages-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/messages')}
          className="back-button"
        />
        <Avatar 
          size={40} 
          src={receiver.avatar && receiver.avatar !== 'default-avatar.jpg' 
            ? receiver.avatar 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.fullname)}&background=1677ff&color=fff`
          } 
          icon={<UserOutlined />} 
          style={{ cursor: 'pointer' }}
          onClick={() => {
            // Sử dụng slug nếu có, nếu không thì dùng _id
            const profilePath = receiver.slug ? `/users/${receiver.slug}` : `/users/${receiver._id}`;
            navigate(profilePath);
          }}
        />
        <div>
          <Typography.Title level={4}>{receiver.fullname}</Typography.Title>
        </div>
      </div>
      
      {/* Messages Content */}
      <div className="messages-content">
        {/* Messages List */}
        <div className="messages-list">
          {messages.map(msg => (
            <div 
              key={msg._id} 
              className={`message-item ${msg.sender === currentUser._id ? 'own' : 'other'}`}
            >
              <div className={`message-bubble ${msg.sender === currentUser._id ? 'own' : 'other'}`}>
                {msg.content}
                <div className={`message-time ${msg.sender === currentUser._id ? 'own' : 'other'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="messages-input">
          <Input.TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim() || !currentUser || !receiver}
            className="send-button"
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;