import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  LoadingOutlined,
  MailOutlined,
  UserOutlined,
  LockOutlined
} from "@ant-design/icons";
import { notification } from 'antd';
import { isTokenValid } from '../../utils/tokenUtils';

interface AuthNotificationProps {
  children: React.ReactNode;
}

const AuthNotification: React.FC<AuthNotificationProps> = ({ children }) => {
  const [hasShownExpiryWarning, setHasShownExpiryWarning] = useState(false);

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

  return <>{children}</>;
};

export default AuthNotification; 