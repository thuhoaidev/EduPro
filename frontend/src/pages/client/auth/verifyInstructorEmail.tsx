import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Alert, notification, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { instructorService } from '../../../services/apiService';
import { verifyInstructorEmail } from '../../../services/authService';
import socket from '../../../services/socket';

export function VerifyInstructorEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Kết nối socket cho realtime (ẩn UI)
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Listen cho realtime events (ẩn UI)
    socket.on('email-verified', (data) => {
      console.log('Realtime email verified:', data);
      if (data.token === token) {
        setStatus('success');
        setMessage('Email giảng viên đã được xác minh thành công!');
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
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác minh không hợp lệ');
        return;
      }

      try {
        console.log('🔍 Bắt đầu xác minh email giảng viên...', { token });
        
        // Sử dụng service chính thay vì instructorService
        const result = await verifyInstructorEmail(token);
        
        console.log('✅ Response từ API:', result);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email giảng viên đã được xác minh thành công!');
          
          // Emit realtime event (ẩn UI)
          socket.emit('email-verification-completed', {
            token,
            isInstructor: true,
            userEmail: result.data?.user?.email
          });
          
          // Hiển thị thông báo thành công
          message.success('Email giảng viên đã được xác minh thành công!');
          
          // Bắt đầu đếm ngược để chuyển hướng
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login');
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          setStatus('error');
          setMessage(result.message || 'Xác minh email thất bại');
        }
      } catch (error: any) {
        console.error('❌ Lỗi xác minh email giảng viên:', error);
        setStatus('error');
        setMessage(error.message || 'Lỗi xác minh email');
        
        notification.error({
          message: 'Lỗi xác minh email',
          description: error.message || 'Lỗi xác minh email',
          duration: 5,
        });
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoLogin = () => {
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center fixed inset-0 z-50">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <motion.div variants={itemVariants}>
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
              size="large"
            />
          </motion.div>
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-bold text-gray-800 mt-6 mb-4"
          >
            Đang xác minh email giảng viên...
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 max-w-md mx-auto"
          >
            Vui lòng chờ trong giây lát, chúng tôi đang xác minh email của bạn.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center fixed inset-0 z-50 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <motion.div variants={itemVariants} className="p-8">
          <Result
            status={status === 'success' ? 'success' : 'error'}
            icon={
              status === 'success' ? (
                <CheckCircleOutlined className="text-green-500" />
              ) : (
                <ExclamationCircleOutlined className="text-red-500" />
              )
            }
            title={
              status === 'success' 
                ? 'Xác minh email giảng viên thành công!' 
                : 'Xác minh email thất bại'
            }
            subTitle={
              status === 'success' ? (
                <>
                  {message}<br />
                  Bạn sẽ được tự động chuyển hướng về trang đăng nhập trong {countdown} giây.
                </>
              ) : (
                message
              )
            }
            extra={[
              <Button 
                key="home" 
                type="primary" 
                size="large"
                onClick={handleGoHome}
                className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500"
              >
                Về trang chủ
              </Button>,
              status === 'success' && (
                <Button 
                  key="login" 
                  size="large"
                  onClick={handleGoLogin}
                  className="ml-4"
                >
                  Đăng nhập ngay
                </Button>
              )
            ]}
          />
        </motion.div>

        {status === 'success' && (
          <motion.div variants={itemVariants} className="px-8 pb-8">
            <Alert
              message="Quy trình tiếp theo"
              description={
                <div className="mt-2">
                  <p className="mb-2">✅ Email của bạn đã được xác minh thành công!</p>
                  <p className="mb-2">📋 Hồ sơ giảng viên của bạn đã được gửi cho admin xét duyệt.</p>
                  <p className="mb-2">⏳ Thời gian xét duyệt: 3-5 ngày làm việc.</p>
                  <p className="mb-2">📧 Bạn sẽ nhận được email thông báo kết quả xét duyệt.</p>
                  <p className="mb-2">🔐 Sau khi được duyệt, bạn có thể đăng nhập và bắt đầu tạo khóa học.</p>
                </div>
              }
              type="info"
              showIcon
              className="text-left"
            />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div variants={itemVariants} className="px-8 pb-8">
            <Alert
              message="Hướng dẫn khắc phục"
              description={
                <div className="mt-2">
                  <p className="mb-2">❌ Token xác minh không hợp lệ hoặc đã hết hạn.</p>
                  <p className="mb-2">📧 Vui lòng kiểm tra lại email và click vào link xác minh.</p>
                  <p className="mb-2">🔄 Nếu link không hoạt động, hãy liên hệ admin để được hỗ trợ.</p>
                  <p className="mb-2">📞 Email hỗ trợ: support@edupro.com</p>
                </div>
              }
              type="warning"
              showIcon
              className="text-left"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 