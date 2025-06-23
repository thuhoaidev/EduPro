import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { verifyEmail } from '../services/authService';
import { useAuth } from '../hooks/Auths/useAuth';
import styled from 'styled-components';
import Confetti from 'react-confetti';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f3e8ff 100%);
  padding: 20px;
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

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const verifyToken = async () => {
      try {
        if (!token) throw new Error('Token không hợp lệ');
        const response = await verifyEmail(token);
        if (response.success) {
          setSuccess(true);
          setError(null); // Reset error nếu thành công
          // KHÔNG tự động đăng nhập nữa
          // Bắt đầu đếm ngược để chuyển hướng sang trang đăng nhập
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
        setError(err.message || 'Đã có lỗi xảy ra khi xác thực email');
        setSuccess(false); // Reset success nếu lỗi
        notification.error({
          message: 'Lỗi xác thực',
          description: err.message || 'Đã có lỗi xảy ra khi xác thực email',
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
          <Subtitle>Đang xác thực email của bạn...</Subtitle>
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
          <Title style={{ fontSize: 32, color: '#06b6d4', marginBottom: 8 }}>Chúc mừng!</Title>
          <Subtitle style={{ fontSize: 18, color: '#475569', marginBottom: 16 }}>
            Email của bạn đã được xác thực thành công.<br />
            Bạn sẽ được tự động chuyển hướng về trang <b>đăng nhập</b> trong <b>{countdown}</b> giây.
          </Subtitle>
          <StyledButton type="primary" size="large" onClick={() => navigate('/login')}
            style={{ marginTop: 16, fontSize: 18, borderRadius: 8 }}>
            <span role="img" aria-label="login">🔑</span> Đến trang đăng nhập
          </StyledButton>
          <CountdownText style={{ marginTop: 24, color: '#8b5cf6', fontWeight: 500 }}>
            Đang chuyển hướng... ({countdown}s)
          </CountdownText>
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
