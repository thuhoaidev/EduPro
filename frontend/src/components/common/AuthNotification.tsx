import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  LoadingOutlined,
  MailOutlined,
  UserOutlined,
  LockOutlined,
  CloseOutlined,
  RocketOutlined,
  SmileOutlined,
  HeartOutlined
} from "@ant-design/icons";
import { notification } from 'antd';
import { isTokenValid } from '../../utils/tokenUtils';
import { useNavigate } from 'react-router-dom';

interface AuthNotificationProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onComplete: () => void;
  autoClose?: boolean;
  duration?: number;
  showProgress?: boolean;
}

const AuthNotification: React.FC<AuthNotificationProps> = ({ 
  isVisible, 
  type, 
  title, 
  message, 
  onComplete, 
  autoClose = true, 
  duration = 3000,
  showProgress = false 
}) => {
  const [hasShownExpiryWarning, setHasShownExpiryWarning] = useState(false);
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();

  // Token expiry check
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      if (token && !hasShownExpiryWarning) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          
          // Cảnh báo khi token còn 10 phút nữa sẽ hết hạn
          if (timeUntilExpiry < 600 && timeUntilExpiry > 0) {
            notification.warning({
              message: 'Phiên đăng nhập sắp hết hạn',
              description: 'Phiên đăng nhập của bạn sẽ hết hạn trong vài phút nữa. Vui lòng lưu công việc hiện tại.',
              duration: 10,
              placement: 'topRight',
            });
            setHasShownExpiryWarning(true);
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra token expiry:', error);
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkTokenExpiry();

    // Kiểm tra mỗi phút
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [hasShownExpiryWarning]);

  // Progress bar for auto-close
  useEffect(() => {
    if (isVisible && autoClose && showProgress) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            onComplete();
            // Chuyển hướng sau khi thông báo đăng nhập/đăng xuất thành công hoàn thành
            if (type === 'success' && (title.includes('Đăng nhập thành công') || title.includes('Đăng xuất thành công'))) {
              setTimeout(() => {
                navigate('/');
              }, 300); // Đợi animation exit hoàn thành
            }
            return 0;
          }
          return prev - (100 / (duration / 50)); // Update every 50ms
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoClose, duration, showProgress, onComplete, type, title, navigate]);

  // Auto-close without progress bar
  useEffect(() => {
    if (isVisible && autoClose && !showProgress) {
      const timer = setTimeout(() => {
        onComplete();
        // Chuyển hướng sau khi thông báo đăng nhập/đăng xuất thành công hoàn thành
        if (type === 'success' && (title.includes('Đăng nhập thành công') || title.includes('Đăng xuất thành công'))) {
          setTimeout(() => {
            navigate('/');
          }, 300); // Đợi animation exit hoàn thành
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, showProgress, onComplete, type, title, navigate]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            <CheckCircleOutlined className="relative text-green-500 text-2xl" />
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
            <ExclamationCircleOutlined className="relative text-red-500 text-2xl" />
          </div>
        );
      case 'warning':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
            <ExclamationCircleOutlined className="relative text-yellow-500 text-2xl" />
          </div>
        );
      case 'info':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            <InfoCircleOutlined className="relative text-blue-500 text-2xl" />
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            <InfoCircleOutlined className="relative text-blue-500 text-2xl" />
          </div>
        );
    }
  };

  const getGradientBg = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200/50';
      case 'error':
        return 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-red-200/50';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-200/50';
      case 'info':
        return 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-200/50';
      default:
        return 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-200/50';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'info':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
    }
  };

  const getSpecialIcon = () => {
    if (title.includes('Đăng ký thành công') || title.includes('Tạo tài khoản thành công')) {
      return <RocketOutlined className="text-purple-500 text-lg ml-2" />;
    }
    if (title.includes('Đăng nhập thành công')) {
      return <SmileOutlined className="text-green-500 text-lg ml-2" />;
    }
    if (title.includes('Đăng xuất thành công')) {
      return <HeartOutlined className="text-pink-500 text-lg ml-2" />;
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay background blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            style={{ pointerEvents: 'auto' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8, rotateX: -15 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              rotateX: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -100, 
              scale: 0.8, 
              rotateX: -15,
              transition: {
                duration: 0.2
              }
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full"
          >
            <div className={`${getGradientBg()} border rounded-2xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-sm`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-20 h-20 bg-current rounded-full -translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-current rounded-full translate-x-16 translate-y-16"></div>
              </div>
              {/* Progress bar */}
              {showProgress && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200/50">
                  <motion.div
                    className={`h-full ${getProgressColor()} rounded-r-full`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                </div>
              )}
              {/* Close button */}
              <motion.button
                onClick={onComplete}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <CloseOutlined />
              </motion.button>
              {/* Content */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="flex-shrink-0 mt-1">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-bold text-base ${getTextColor()} tracking-wide`}>
                      {title}
                    </h4>
                    {getSpecialIcon()}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    {message}
                  </p>
                  {/* Success specific content */}
                  {type === 'success' && (title.includes('Đăng ký') || title.includes('Tạo tài khoản')) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 p-3 bg-white/50 rounded-lg border border-green-200/50"
                    >
                      <div className="flex items-center gap-2 text-green-700 text-xs">
                        <MailOutlined />
                        <span className="font-medium">Vui lòng kiểm tra email để xác minh tài khoản</span>
                      </div>
                    </motion.div>
                  )}
                  {/* Login specific content */}
                  {type === 'success' && title.includes('Đăng nhập thành công') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 p-3 bg-white/50 rounded-lg border border-green-200/50"
                    >
                      <div className="flex items-center gap-2 text-green-700 text-xs">
                        <UserOutlined />
                        <span className="font-medium">Chào mừng bạn trở lại! Đang chuyển hướng...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute bottom-2 right-2 opacity-10">
                <div className="w-8 h-8 border-2 border-current rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthNotification; 