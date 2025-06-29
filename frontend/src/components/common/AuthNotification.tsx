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
  CloseOutlined
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
        return <CheckCircleOutlined className="text-green-500 text-xl" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-500 text-xl" />;
      case 'warning':
        return <ExclamationCircleOutlined className="text-yellow-500 text-xl" />;
      case 'info':
        return <InfoCircleOutlined className="text-blue-500 text-xl" />;
      default:
        return <InfoCircleOutlined className="text-blue-500 text-xl" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 relative overflow-hidden`}>
            {/* Progress bar */}
            {showProgress && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onComplete}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseOutlined />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm mb-1 ${getTextColor()}`}>
                  {title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthNotification; 