import React from "react";
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

interface AuthNotificationProps {
  isVisible: boolean;
  onComplete: () => void;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  showProgress?: boolean;
  icon?: React.ReactNode;
}

const AuthNotification: React.FC<AuthNotificationProps> = ({
  isVisible,
  onComplete,
  type,
  title,
  message,
  autoClose = true,
  duration = 2500,
  showProgress = true,
  icon
}) => {
  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onComplete]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: icon || <CheckCircleOutlined className="text-white text-3xl" />,
          bgGradient: 'from-green-500 to-emerald-500',
          borderGradient: 'from-green-500 to-emerald-500',
          accentColor: 'text-green-600',
          bgAccent: 'from-green-100 to-emerald-100'
        };
      case 'error':
        return {
          icon: icon || <ExclamationCircleOutlined className="text-white text-3xl" />,
          bgGradient: 'from-red-500 to-pink-500',
          borderGradient: 'from-red-500 to-pink-500',
          accentColor: 'text-red-600',
          bgAccent: 'from-red-100 to-pink-100'
        };
      case 'warning':
        return {
          icon: icon || <ExclamationCircleOutlined className="text-white text-3xl" />,
          bgGradient: 'from-yellow-500 to-orange-500',
          borderGradient: 'from-yellow-500 to-orange-500',
          accentColor: 'text-yellow-600',
          bgAccent: 'from-yellow-100 to-orange-100'
        };
      case 'info':
        return {
          icon: icon || <InfoCircleOutlined className="text-white text-3xl" />,
          bgGradient: 'from-cyan-500 to-purple-500',
          borderGradient: 'from-cyan-500 to-purple-500',
          accentColor: 'text-cyan-600',
          bgAccent: 'from-cyan-100 to-purple-100'
        };
      default:
        return {
          icon: icon || <InfoCircleOutlined className="text-white text-3xl" />,
          bgGradient: 'from-cyan-500 to-purple-500',
          borderGradient: 'from-cyan-500 to-purple-500',
          accentColor: 'text-cyan-600',
          bgAccent: 'from-cyan-100 to-purple-100'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.borderGradient}`}></div>
            <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${config.bgAccent} rounded-full opacity-50`}></div>
            
            <div className="relative z-10 text-center">
              {/* Icon Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
                className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${config.bgGradient} rounded-full flex items-center justify-center shadow-lg`}
              >
                {config.icon}
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-2xl font-bold text-gray-800 mb-3"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-gray-600 mb-6"
              >
                {message}
              </motion.p>

              {/* Loading Animation (for success with redirect) */}
              {type === 'success' && showProgress && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="flex items-center justify-center gap-2 text-cyan-600 mb-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-xl" />
                  </motion.div>
                  <span className="text-sm font-medium">Đang chuyển hướng...</span>
                </motion.div>
              )}

              {/* Progress Bar */}
              {showProgress && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: duration / 1000 - 0.8, ease: "easeInOut" }}
                  className={`h-1 bg-gradient-to-r ${config.borderGradient} rounded-full mt-4`}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthNotification; 