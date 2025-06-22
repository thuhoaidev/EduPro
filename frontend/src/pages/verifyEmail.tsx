import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { config as axios } from '../api/axios';

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      fullname: string;
      email: string;
      status: string;
      email_verified: boolean;
      approval_status: string;
    };
    instructorInfo: any;
  };
}

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Token xác minh không hợp lệ');
        return;
      }

      try {
        const response = await axios.get<VerificationResponse>(`/api/users/verify-instructor-email/${token}`);
        
        if (response.data.success) {
          setVerificationStatus('success');
          setMessage(response.data.message);
        } else {
          setVerificationStatus('error');
          setMessage(response.data.message);
        }
      } catch (error: any) {
        setVerificationStatus('error');
        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Đã xảy ra lỗi khi xác minh email');
        }
        setErrorDetails(error.message);
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
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

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <motion.div variants={itemVariants} className="text-center">
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />} 
              size="large"
            />
            <div className="mt-6 text-lg text-gray-600">
              Đang xác minh email...
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Vui lòng chờ trong giây lát
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div variants={itemVariants}>
            <Result
              status="success"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="Xác minh email thành công!"
              subTitle={message}
              extra={[
                <Button 
                  type="primary" 
                  key="home"
                  onClick={handleGoHome}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 border-none hover:opacity-90"
                >
                  Về trang chủ
                </Button>,
                <Button 
                  key="login"
                  onClick={handleGoToLogin}
                  className="border-gray-300 hover:border-cyan-400"
                >
                  Đăng nhập
                </Button>
              ]}
            />
            <motion.div 
              variants={itemVariants}
              className="mt-8 max-w-2xl mx-auto"
            >
              <Alert
                message="Quy trình tiếp theo"
                description={
                  <div className="mt-2">
                    <p className="mb-2">🎉 Chúc mừng! Email của bạn đã được xác minh thành công.</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Hồ sơ của bạn đã được gửi cho admin xét duyệt</li>
                      <li>Admin sẽ xem xét trong vòng 3-5 ngày làm việc</li>
                      <li>Bạn sẽ nhận được email thông báo kết quả</li>
                      <li>Nếu được chấp thuận, bạn có thể bắt đầu tạo khóa học</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
                className="border-blue-200 bg-blue-50"
              />
            </motion.div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div variants={itemVariants}>
            <Result
              status="error"
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              title="Xác minh email thất bại"
              subTitle={message}
              extra={[
                <Button 
                  type="primary" 
                  key="home"
                  onClick={handleGoHome}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 border-none hover:opacity-90"
                >
                  Về trang chủ
                </Button>,
                <Button 
                  key="contact"
                  onClick={() => window.open('mailto:support@edupro.com', '_blank')}
                  className="border-gray-300 hover:border-cyan-400"
                >
                  Liên hệ hỗ trợ
                </Button>
              ]}
            />
            {errorDetails && (
              <motion.div variants={itemVariants} className="mt-6 max-w-2xl mx-auto">
                <Alert
                  message="Chi tiết lỗi"
                  description={errorDetails}
                  type="error"
                  showIcon
                  className="border-red-200 bg-red-50"
                />
              </motion.div>
            )}
            <motion.div variants={itemVariants} className="mt-6 max-w-2xl mx-auto">
              <Alert
                message="Cần hỗ trợ?"
                description={
                  <div className="mt-2">
                    <p className="mb-2">Nếu bạn gặp vấn đề, vui lòng:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Kiểm tra lại link xác minh có đúng không</li>
                      <li>Đảm bảo link chưa hết hạn (24 giờ)</li>
                      <li>Liên hệ với chúng tôi qua email: support@edupro.com</li>
                    </ul>
                  </div>
                }
                type="warning"
                showIcon
                className="border-orange-200 bg-orange-50"
              />
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <motion.div 
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 mb-4"
            variants={itemVariants}
          >
            Xác minh Email
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            variants={itemVariants}
          >
            Hoàn tất quá trình đăng ký giảng viên
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 lg:p-12 border border-white/20"
          variants={itemVariants}
        >
          {renderContent()}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8 text-gray-500"
          variants={itemVariants}
        >
          <p>© 2024 EduPro Platform. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
