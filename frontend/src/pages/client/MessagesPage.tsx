import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, Avatar, List, Typography, message as antMessage } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

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
      .catch(err => {
       
        
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
    // Polling mỗi 3s để cập nhật tin nhắn mới
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, currentUser]);

  

  // Gửi tin nhắn
  const handleSend = async () => {
    
    
    
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
    return <div className="text-center py-10 text-lg text-blue-600">Đang tải thông tin người dùng...</div>;
  }
  if (!currentUser) {
    return <div className="text-center py-10 text-lg text-red-600">Không xác định được người dùng hiện tại. Vui lòng đăng nhập lại.</div>;
  }
  if (!receiver) {
    return <div className="text-center py-10 text-lg text-red-600">Không tìm thấy người nhận.</div>;
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl mt-10 flex flex-col h-[80vh] border-1 border-blue-400">
      
      <div className="flex items-center gap-4 px-6 py-4 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
        <Avatar size={48} src={receiver?.avatar} icon={<UserOutlined />} />
        <div>
          <Typography.Title level={4} className="!mb-0 !text-blue-700">{receiver?.fullname || '...'}</Typography.Title>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item
              className={msg.sender === currentUser?._id ? 'justify-end' : 'justify-start'}
              style={{ display: 'flex' }}
            >
              <div
                className={
                  msg.sender === currentUser?._id
                    ? 'bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-xs ml-auto'
                    : 'bg-gray-100 text-gray-900 rounded-2xl px-4 py-2 max-w-xs'
                }
                style={{ wordBreak: 'break-word' }}
              >
                {msg.content}
                <div className="text-xs text-right text-gray-300 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: null }}
        />
        <div ref={messagesEndRef} />
      </div>
     
      <div className="px-6 py-4 border-t border-blue-50 bg-white rounded-b-3xl flex gap-3">
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
          className="flex-1 rounded-2xl"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!input.trim() || !currentUser || !receiver}
          className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 border-0"
        />
      </div>
    </div>
  );
};

export default MessagesPage; 