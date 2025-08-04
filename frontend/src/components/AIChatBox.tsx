import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Spin, message } from 'antd';
import { MessageOutlined, RobotOutlined, SendOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import aiChatService from '../services/aiChatService';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatBoxProps {
  lessonTitle: string;
  courseTitle?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({
  lessonTitle,
  courseTitle = 'Khóa học trực tuyến',
  isOpen,
  onToggle
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      // Add welcome message when opening chat for the first time
      const welcomeMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: `Xin chào! 👋 Tôi là trợ lý AI thông minh, sẵn sàng hỗ trợ bạn học tập hiệu quả hơn về bài học "${lessonTitle}". Bạn có câu hỏi gì không?`,
        timestamp: new Date(),
        isTyping: true
      };
      setChatMessages([welcomeMessage]);
      
      // Simulate typing effect
      setTimeout(() => {
        setChatMessages(prev => prev.map(msg => ({ ...msg, isTyping: false })));
      }, 2000);
    }
  }, [isOpen, lessonTitle]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const userInput = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    // Add typing indicator
    const typingMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai' as const,
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setChatMessages(prev => [...prev, typingMessage]);

    try {
      console.log('🚀 AIChatBox - Starting AI request...');
      
      // Tạo context cho bài học
      const lessonContext = `Bài học: ${lessonTitle}. Khóa học: ${courseTitle}`;
      console.log('📚 AIChatBox - Lesson context:', lessonContext);
      
      // Chuyển đổi chat history sang format cho API
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      console.log('💬 AIChatBox - Conversation history:', conversationHistory);

      // Gọi AI service
      console.log('📡 AIChatBox - Calling AI service...');
      const response = await aiChatService.sendMessage(userInput, lessonContext, conversationHistory);
      console.log('✅ AIChatBox - AI service response:', response);
      
      if (response.error) {
        console.warn('⚠️ AIChatBox - AI service returned error, using fallback');
        // Fallback to simulated response if API fails
        const fallbackResponse = await aiChatService.sendMessageFallback(userInput, lessonTitle);
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: fallbackResponse.message,
          timestamp: new Date()
        };
        setChatMessages(prev => prev.filter(msg => !msg.isTyping).concat(aiResponse));
      } else {
        console.log('🎉 AIChatBox - Using real ChatGPT response');
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: response.message,
          timestamp: new Date()
        };
        setChatMessages(prev => prev.filter(msg => !msg.isTyping).concat(aiResponse));
      }
    } catch (error) {
      console.error('❌ AIChatBox - Error in handleSendMessage:', error);
      // Fallback to simulated response
      const fallbackResponse = await aiChatService.sendMessageFallback(userInput, lessonTitle);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: fallbackResponse.message,
        timestamp: new Date()
      };
      setChatMessages(prev => prev.filter(msg => !msg.isTyping).concat(aiResponse));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get user avatar or fallback to initials
  const getUserAvatar = () => {
    if (user?.avatar && user.avatar !== 'default-avatar.jpg') {
      return user.avatar;
    }
    // Fallback to UI Avatars API with user's name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'User')}&background=667eea&color=fff&size=128`;
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    if (user?.fullname) {
      return user.fullname.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        animation: 'float 3s ease-in-out infinite'
      }}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={onToggle}
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5), 0 6px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 380,
      height: 560,
      background: '#ffffff',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      animation: 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      transform: 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          animation: 'shimmer 3s ease-in-out infinite'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'pulse 2s ease-in-out infinite',
            position: 'relative'
          }}>
            <RobotOutlined style={{ fontSize: 24, color: '#fff' }} />
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#4CAF50',
              border: '2px solid #fff',
              animation: 'blink 2s ease-in-out infinite'
            }} />
          </div>
          <div>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 18, 
              marginBottom: 4,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              AI Trợ lý
            </div>
            <div style={{ 
              fontSize: 13, 
              opacity: 0.9,
              fontWeight: 500,
              animation: 'fadeInUp 0.6s ease-out 0.1s both'
            }}>
              Sẵn sàng hỗ trợ học tập
            </div>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onToggle}
          style={{ 
            color: '#fff', 
            border: 'none',
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        />
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 transparent'
      }}>
        {chatMessages.map((msg, index) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 20,
              animation: `slideIn${msg.type === 'user' ? 'Right' : 'Left'} 0.4s ease-out`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            {msg.type === 'ai' && (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                animation: 'bounceIn 0.6s ease-out'
              }}>
                <RobotOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '16px 20px',
              borderRadius: msg.type === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              background: msg.type === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : '#ffffff',
              color: msg.type === 'user' ? '#fff' : '#2c3e50',
              boxShadow: msg.type === 'user'
                ? '0 4px 16px rgba(102, 126, 234, 0.3)'
                : '0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
              border: msg.type === 'ai' ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
              lineHeight: 1.5,
              animation: msg.isTyping ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}>
              {msg.isTyping ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 400 }}>AI đang nhập...</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'typing 1.4s ease-in-out infinite'
                    }} />
                    <div style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'typing 1.4s ease-in-out infinite 0.2s'
                    }} />
                    <div style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'typing 1.4s ease-in-out infinite 0.4s'
                    }} />
                  </div>
                </div>
              ) : (
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: msg.type === 'user' ? 500 : 400,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  animation: 'fadeIn 0.5s ease-out'
                }}>
                  {msg.content}
                </div>
              )}
              <div style={{
                fontSize: 11,
                opacity: msg.type === 'user' ? 0.8 : 0.6,
                marginTop: 8,
                textAlign: msg.type === 'user' ? 'right' : 'left',
                fontWeight: 500,
                animation: 'fadeIn 0.5s ease-out 0.2s both'
              }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
            {msg.type === 'user' && (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 12,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                animation: 'bounceIn 0.6s ease-out',
                overflow: 'hidden'
              }}>
                {user?.avatar && user.avatar !== 'default-avatar.jpg' ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullname || 'User'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                    {getUserInitials()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isChatLoading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            marginBottom: 20,
            animation: 'slideInLeft 0.4s ease-out'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <RobotOutlined style={{ fontSize: 16, color: '#fff' }} />
            </div>
            <div style={{
              padding: '16px 20px',
              borderRadius: '20px 20px 20px 6px',
              background: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                display: 'flex',
                gap: 4
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'bounce 1.4s ease-in-out infinite'
                }} />
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: '0.2s'
                }} />
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: '0.4s'
                }} />
              </div>
              <span style={{ 
                fontSize: 14, 
                color: '#667eea',
                fontWeight: 500
              }}>
                AI đang suy nghĩ...
              </span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div style={{
        padding: '20px 24px 24px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        background: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: 12,
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <TextArea
              ref={inputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                borderRadius: 24,
                border: '2px solid rgba(102, 126, 234, 0.2)',
                resize: 'none',
                padding: '12px 20px',
                fontSize: 14,
                lineHeight: 1.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#f8f9fa',
                transform: 'scale(1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isChatLoading}
            style={{
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: chatInput.trim() && !isChatLoading
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e0e0e0',
              border: 'none',
              boxShadow: chatInput.trim() && !isChatLoading
                ? '0 4px 16px rgba(102, 126, 234, 0.3)'
                : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (chatInput.trim() && !isChatLoading) {
                e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (chatInput.trim() && !isChatLoading) {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {chatInput.trim() && !isChatLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                animation: 'ripple 1s ease-out'
              }} />
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0.3;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AIChatBox; 