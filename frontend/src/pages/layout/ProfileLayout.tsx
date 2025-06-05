import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import ProfileNav from './ProfileNav';

const { Content } = Layout;

const ProfileLayout = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
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