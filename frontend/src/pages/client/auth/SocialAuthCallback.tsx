import { useEffect } from 'react';

export default function SocialAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    let user = null;
    try {
      if (userStr) user = JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      user = null;
    }
    if (token) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      setTimeout(() => window.location.href = '/', 100);
    } else {
      window.location.href = '/login';
    }
  }, []);

  return <div>Đang xác thực đăng nhập...</div>;
} 