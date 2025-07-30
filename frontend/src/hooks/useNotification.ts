import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'achievement';

export interface NotificationState {
  isVisible: boolean;
  type: NotificationType;
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  showProgress?: boolean;
}

export interface ToastState {
  isVisible: boolean;
  type: NotificationType;
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    duration: 3000,
    showProgress: false
  });

  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    duration: 4000,
    position: 'top-right'
  });

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      autoClose?: boolean;
      duration?: number;
      showProgress?: boolean;
    }
  ) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 3000,
      showProgress: options?.showProgress ?? false
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showToast = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    options?: {
      autoClose?: boolean;
      duration?: number;
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    }
  ) => {
    setToast({
      isVisible: true,
      type,
      title,
      message,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'top-right'
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Convenience methods for common notifications
  const showSuccess = useCallback((title: string, message: string, options?: any) => {
    showNotification('success', title, message, { showProgress: true, ...options });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: any) => {
    showNotification('error', title, message, options);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: any) => {
    showNotification('warning', title, message, options);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: any) => {
    showNotification('info', title, message, options);
  }, [showNotification]);

  const showAchievement = useCallback((title: string, message: string, options?: any) => {
    showNotification('achievement', title, message, options);
  }, [showNotification]);

  // Toast convenience methods
  const showSuccessToast = useCallback((title: string, message?: string, options?: any) => {
    showToast('success', title, message, options);
  }, [showToast]);

  const showErrorToast = useCallback((title: string, message?: string, options?: any) => {
    showToast('error', title, message, options);
  }, [showToast]);

  const showWarningToast = useCallback((title: string, message?: string, options?: any) => {
    showToast('warning', title, message, options);
  }, [showToast]);

  const showInfoToast = useCallback((title: string, message?: string, options?: any) => {
    showToast('info', title, message, options);
  }, [showToast]);

  const showAchievementToast = useCallback((title: string, message?: string, options?: any) => {
    showToast('achievement', title, message, options);
  }, [showToast]);

  // Auth-specific notifications
  const showLoginSuccess = useCallback(() => {
    showSuccess(
      'Đăng nhập thành công!',
      'Chào mừng bạn trở lại!',
      { duration: 2000, showProgress: true }
    );
  }, [showSuccess]);

  const showRegisterSuccess = useCallback(() => {
    showSuccess(
      'Tạo tài khoản thành công!',
      'Tài khoản của bạn đã được tạo thành công! Vui lòng xác minh email để đăng nhập.',
      { duration: 4000, showProgress: true }
    );
  }, [showSuccess]);

  const showLogoutSuccess = useCallback(() => {
    showSuccess(
      'Đăng xuất thành công!',
      'Bạn đã đăng xuất khỏi hệ thống. Hẹn gặp lại!',
      { duration: 2000, showProgress: true }
    );
  }, [showSuccess]);

  const showLoginError = useCallback(() => {
    showError(
      'Lỗi đăng nhập!',
      'Sai email hoặc mật khẩu!'
    );
  }, [showError]);

  const showRegisterError = useCallback((message: string) => {
    showError(
      'Lỗi đăng ký!',
      message
    );
  }, [showError]);

  const showVerificationRequired = useCallback(() => {
    showWarning(
      'Xác minh email cần thiết!',
      'Vui lòng xác minh email của bạn trước khi đăng nhập.'
    );
  }, [showWarning]);

  return {
    // State
    notification,
    toast,
    
    // General methods
    showNotification,
    hideNotification,
    showToast,
    hideToast,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    
    // Toast convenience methods
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showAchievementToast,
    
    // Auth-specific methods
    showLoginSuccess,
    showRegisterSuccess,
    showLogoutSuccess,
    showLoginError,
    showRegisterError,
    showVerificationRequired
  };
}; 