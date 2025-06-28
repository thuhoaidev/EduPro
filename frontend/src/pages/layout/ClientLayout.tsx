import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import AppSidebar from './CategoryNav';

const { Content } = Layout;

const ClientLayout = () => {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  const isCoursesPage = location.pathname.startsWith('/courses');
  const isVouchersPage = location.pathname.startsWith('/vouchers');
  const isInstructorsPage = location.pathname.startsWith('/instructors');
  const isBlogPage = location.pathname === '/blog';
  const isCartPage = location.pathname === '/cart';
  const isLessonVideoOrQuiz = /^\/lessons\/[^/]+\/(video|quiz)$/.test(location.pathname);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        {!isProfilePage && !isCoursesPage && !isVouchersPage && !isInstructorsPage && !isBlogPage && !isCartPage && !isLessonVideoOrQuiz && <AppSidebar />}
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