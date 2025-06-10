import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import ProfileNav from './ProfileNav';
import { message } from 'antd';

const { Content } = Layout;

const ProfileLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname === '/profile';

  // Kiểm tra token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Vui lòng đăng nhập để truy cập trang cá nhân');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        {!isProfilePage && <ProfileNav />}
        <Layout className="site-layout">
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            {/* Đây là nơi nội dung của các route con sẽ được render */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <AppFooter />
    </Layout>
  );
};

export default ProfileLayout;