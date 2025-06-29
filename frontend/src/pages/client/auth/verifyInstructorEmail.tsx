import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { instructorService } from '../../../services/apiService';

export function VerifyInstructorEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác minh không hợp lệ');
        return;
      }

      try {
        const result = await instructorService.verifyInstructorEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message || 'Xác minh email thất bại');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Lỗi xác minh email');
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => navigate('/login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center"
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
            Đang xác minh email...
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl"
      >
        <motion.div variants={itemVariants}>
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
                ? 'Xác minh email thành công!' 
                : 'Xác minh email thất bại'
            }
            subTitle={message}
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
                  Đăng nhập
                </Button>
              )
            ]}
          />
        </motion.div>

        {status === 'success' && (
          <motion.div variants={itemVariants} className="mt-8">
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
          <motion.div variants={itemVariants} className="mt-8">
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