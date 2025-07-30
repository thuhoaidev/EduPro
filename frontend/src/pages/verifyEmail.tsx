import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, notification, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { verifyEmail, verifyInstructorEmail } from '../services/authService';
import { useAuth } from '../hooks/Auths/useAuth';
import styled from 'styled-components';
import Confetti from 'react-confetti';
import socket from '../services/socket';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
`;

const VerificationCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 16px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
`;

const StyledButton = styled(Button)`
  background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  border: none;
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(6, 182, 212, 0.4), 0 10px 10px -5px rgba(139, 92, 246, 0.3);
  }
`;

const SuccessIcon = styled(CheckCircleOutlined)`
  font-size: 72px;
  color: #10b981;
  margin-bottom: 24px;
`;

const ErrorIcon = styled(CloseCircleOutlined)`
  font-size: 72px;
  color: #ef4444;
  margin-bottom: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CountdownText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-top: 16px;
`;

const AnimatedCheck = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isInstructor, setIsInstructor] = useState(false);

  // Kết nối socket cho realtime (ẩn UI)
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Listen cho realtime events (ẩn UI)
    socket.on('email-verified', (data) => {
      console.log('Realtime email verified:', data);
      if (data.token === token) {
        setSuccess(true);
        setError(null);
      }
    });

    socket.on('instructor-approved', (data) => {
      console.log('Realtime instructor approved:', data);
    });

    return () => {
      socket.off('email-verified');
      socket.off('instructor-approved');
    };
  }, [token]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const verifyToken = async () => {
      try {
        if (!token) throw new Error('Token không hợp lệ');
        
        // Kiểm tra xem có phải là xác minh email giảng viên không
        const isInstructorVerify = window.location.pathname.includes('/users/verify-instructor-email/') || 
                                  window.location.pathname.includes('/auth/verify-instructor-email/');
        
        setIsInstructor(isInstructorVerify);
        
        console.log('🔍 Bắt đầu xác minh email...', { isInstructorVerify, token });
        
        const response = isInstructorVerify
          ? await verifyInstructorEmail(token)
          : await verifyEmail(token);
          
        console.log('✅ Response từ API:', response);
        
        if (response.success) {
          setSuccess(true);
          setError(null);
          
          // Emit realtime event (ẩn UI)
          socket.emit('email-verification-completed', {
            token,
            isInstructor: isInstructorVerify,
            userEmail: response.data?.user?.email
          });
          
          // Hiển thị thông báo thành công
          message.success(
            isInstructorVerify 
              ? 'Email giảng viên đã được xác minh thành công!' 
              : 'Email đã được xác minh thành công!'
          );
          
          // Bắt đầu đếm ngược để chuyển hướng
          timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                if (timer) clearInterval(timer);
                navigate('/login');
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          throw new Error(response.message || 'Xác thực không thành công');
        }
      } catch (err: any) {
        console.error('❌ Lỗi xác minh email:', err);
        setError(err.message || 'Đã có lỗi xảy ra khi xác thực email');
        setSuccess(false);
        
        notification.error({
          message: 'Lỗi xác thực',
          description: err.message || 'Đã có lỗi xảy ra khi xác thực email',
          duration: 5,
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [token, navigate]);

  const renderContent = () => {
    if (verifying) {
      return (
        <LoadingContainer>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <Subtitle>
            {isInstructor 
              ? 'Đang xác thực email giảng viên của bạn...' 
              : 'Đang xác thực email của bạn...'
            }
          </Subtitle>
        </LoadingContainer>
      );
    }

    if (success) {
      return (
        <>
          <Confetti numberOfPieces={120} recycle={false} width={window.innerWidth} height={window.innerHeight} />
          <AnimatedCheck
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1.2, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <SuccessIcon style={{ fontSize: 96, color: '#06b6d4', filter: 'drop-shadow(0 0 16px #8b5cf6)' }} />
          </AnimatedCheck>
          <Title style={{ fontSize: 32, color: '#06b6d4', marginBottom: 8 }}>
            {isInstructor ? 'Chúc mừng!' : 'Chúc mừng!'}
          </Title>
          <Subtitle style={{ fontSize: 18, color: '#475569', marginBottom: 16 }}>
            {isInstructor ? (
              <>
                Email giảng viên của bạn đã được xác thực thành công.<br />
                Hồ sơ của bạn sẽ được admin xét duyệt trong 3-5 ngày làm việc.<br />
                Bạn sẽ được tự động chuyển hướng về trang <b>đăng nhập</b> trong <b>{countdown}</b> giây.
              </>
            ) : (
              <>
                Email của bạn đã được xác thực thành công.<br />
                Bạn sẽ được tự động chuyển hướng về trang <b>đăng nhập</b> trong <b>{countdown}</b> giây.
              </>
            )}
          </Subtitle>
          <StyledButton 
            type="primary" 
            size="large" 
            onClick={() => navigate('/login')}
            style={{ marginTop: 16, fontSize: 18, borderRadius: 8 }}
          >
            <span role="img" aria-label="login">🔑</span> Đến trang đăng nhập
          </StyledButton>
          <CountdownText style={{ marginTop: 24, color: '#8b5cf6', fontWeight: 500 }}>
            Đang chuyển hướng... ({countdown}s)
          </CountdownText>
          
          {isInstructor && (
            <div style={{ marginTop: 24, padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <h4 style={{ color: '#0369a1', marginBottom: 8 }}>📋 Quy trình tiếp theo:</h4>
              <ul style={{ textAlign: 'left', color: '#475569', fontSize: 14 }}>
                <li>✅ Email đã được xác minh</li>
                <li>📋 Hồ sơ đã được gửi cho admin xét duyệt</li>
                <li>⏳ Thời gian xét duyệt: 3-5 ngày làm việc</li>
                <li>📧 Bạn sẽ nhận email thông báo kết quả</li>
                <li>🔐 Sau khi được duyệt, bạn có thể đăng nhập</li>
              </ul>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <ErrorIcon />
        </motion.div>
        <Title>Xác thực thất bại</Title>
        <Subtitle>{error || 'Đã có lỗi xảy ra trong quá trình xác thực email'}</Subtitle>
        <StyledButton type="primary" onClick={() => navigate('/login')}>
          Quay lại đăng nhập
        </StyledButton>
        
        <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <h4 style={{ color: '#dc2626', marginBottom: 8 }}>🔧 Hướng dẫn khắc phục:</h4>
          <ul style={{ textAlign: 'left', color: '#475569', fontSize: 14 }}>
            <li>❌ Token không hợp lệ hoặc đã hết hạn</li>
            <li>📧 Kiểm tra lại email và click vào link xác minh</li>
            <li>🔄 Nếu link không hoạt động, liên hệ admin</li>
            <li>📞 Email hỗ trợ: support@edupro.com</li>
          </ul>
        </div>
      </>
    );
  };

  return (
    <PageContainer>
      <VerificationCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </VerificationCard>
    </PageContainer>
  );
};

export default VerifyEmail;
