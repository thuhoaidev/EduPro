import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  CloseOutlined,
  BellOutlined,
  StarOutlined,
  TrophyOutlined
} from "@ant-design/icons";

interface ToastNotificationProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'info' | 'warning' | 'achievement';
  title: string;
  message?: string;
  onComplete: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  isVisible, 
  type, 
  title, 
  message, 
  onComplete, 
  autoClose = true, 
  duration = 4000,
  position = 'top-right'
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-close with progress
  useEffect(() => {
    if (isVisible && autoClose) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            onComplete();
            return 0;
          }
          return prev - (100 / (duration / 50));
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoClose, duration, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
            <CheckCircleOutlined className="relative text-green-500 text-lg" />
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
            <ExclamationCircleOutlined className="relative text-red-500 text-lg" />
          </div>
        );
      case 'warning':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
            <ExclamationCircleOutlined className="relative text-yellow-500 text-lg" />
          </div>
        );
      case 'info':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
            <InfoCircleOutlined className="relative text-blue-500 text-lg" />
          </div>
        );
      case 'achievement':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-30"></div>
            <TrophyOutlined className="relative text-purple-500 text-lg" />
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
            <BellOutlined className="relative text-blue-500 text-lg" />
          </div>
        );
    }
  };

  const getGradientBg = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/60';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/60';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200/60';
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/60';
      case 'achievement':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/60';
      default:
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/60';
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
      case 'achievement':
        return 'text-purple-800';
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
      case 'achievement':
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
      default:
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-[80px] left-6';
      case 'top-center':
        return 'top-[80px] left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-[80px] right-6';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-[80px] right-6';
    }
  };

  const getEntranceAnimation = () => {
    switch (position) {
      case 'top-right':
      case 'top-left':
        return { x: position === 'top-right' ? 100 : -100, y: -50, scale: 0.8 };
      case 'bottom-right':
      case 'bottom-left':
        return { x: position === 'bottom-right' ? 100 : -100, y: 50, scale: 0.8 };
      case 'top-center':
      case 'bottom-center':
        return { y: position === 'top-center' ? -50 : 50, scale: 0.8 };
      default:
        return { x: 100, y: -50, scale: 0.8 };
    }
  };

  const getExitAnimation = () => {
    switch (position) {
      case 'top-right':
      case 'top-left':
        return { x: position === 'top-right' ? 100 : -100, y: -50, scale: 0.8 };
      case 'bottom-right':
      case 'bottom-left':
        return { x: position === 'bottom-right' ? 100 : -100, y: 50, scale: 0.8 };
      case 'top-center':
      case 'bottom-center':
        return { y: position === 'top-center' ? -50 : 50, scale: 0.8 };
      default:
        return { x: 100, y: -50, scale: 0.8 };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={getEntranceAnimation()}
          animate={{ 
            x: 0, 
            y: 0, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 30
            }
          }}
          exit={getExitAnimation()}
          className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full`}
        >
          <div className={`${getGradientBg()} border rounded-xl shadow-xl p-4 relative overflow-hidden backdrop-blur-sm`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200/30">
              <motion.div
                className={`h-full ${getProgressColor()} rounded-r-full`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </div>

            {/* Close button */}
            <motion.button
              onClick={onComplete}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <CloseOutlined className="text-xs" />
            </motion.button>

            {/* Content */}
            <div className="flex items-start gap-3 pr-6">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm mb-1 ${getTextColor()}`}>
                  {title}
                </h4>
                {message && (
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Decorative sparkle for achievement */}
            {type === 'achievement' && (
              <div className="absolute top-1 right-8 opacity-60">
                <StarOutlined className="text-yellow-400 text-xs animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification; 