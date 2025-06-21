import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import AppSidebar from './CategoryNav';

const { Content } = Layout;

const ClientLayout = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isCoursesPage = location.pathname === '/courses';
  const isVouchersPage = location.pathname === '/vouchers';
  const isInstructorsPage = location.pathname === '/instructors';
  const isBlogPage = location.pathname === '/blog';
  const isCartPage = location.pathname === '/cart';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        {!isProfilePage && !isCoursesPage && !isVouchersPage && !isInstructorsPage && !isBlogPage && !isCartPage && <AppSidebar />}
        <Layout className="site-layout">
          <Content style={{ margin: '0', overflow: 'initial' }}>
            {/* Đây là nơi nội dung của các route con sẽ được render */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <AppFooter />
    </Layout>
  );
};

export default ClientLayout;