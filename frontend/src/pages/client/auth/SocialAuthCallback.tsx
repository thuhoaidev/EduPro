import { useEffect } from 'react';
import config from '../../../api/axios';

export default function SocialAuthCallback() {
  useEffect(() => {
    const handleSocialAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userStr = params.get('user');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        // Lưu token trước
        localStorage.setItem('token', token);
        
        // Gọi API /auth/me để lấy thông tin user đầy đủ
        const response = await config.get('/auth/me');
        const userData = response.data.user;
        
        console.log('SocialAuthCallback - Full user data from /auth/me:', userData);
        
        // Lưu thông tin user đầy đủ vào localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Trigger event để cập nhật UI
        window.dispatchEvent(new CustomEvent('user-updated', { 
          detail: { user: userData } 
        }));
        
        // Chuyển hướng về trang chủ
        setTimeout(() => window.location.href = '/', 100);
      } catch (error) {
        console.error('Error fetching user data after social auth:', error);
        
        // Fallback: sử dụng user data từ URL params nếu có
        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr));
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {
            console.error('Error parsing user data from URL:', e);
          }
        }
        
        // Chuyển hướng về trang chủ
        setTimeout(() => window.location.href = '/', 100);
      }
    };

    handleSocialAuth();
  }, []);

  return <div>Đang xác thực đăng nhập...</div>;
} 