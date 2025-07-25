import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import AppSidebar from './CategoryNav';
import './ClientLayout.css';

const { Content } = Layout;

const ClientLayout = () => {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  const isCoursesPage = location.pathname.startsWith('/courses');
  const isVouchersPage = location.pathname.startsWith('/vouchers');
  const isInstructorsPage = location.pathname.startsWith('/instructors');
  const isBlogPage = location.pathname === '/blog';
  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname === '/checkout';
  const isLessonVideoOrQuiz = /^\/lessons\/[^/]+\/(video|quiz)$/.test(location.pathname);
  const isUserProfilePage = /^\/users\//.test(location.pathname);

  return (
    <Layout className="client-layout">
      <AppHeader />
      <Layout className="main-content">
        {!isProfilePage && !isCoursesPage && !isVouchersPage && !isInstructorsPage && !isBlogPage && !isCartPage && !isCheckoutPage && !isLessonVideoOrQuiz && !isUserProfilePage && (
          <div className="sidebar-container">
            <AppSidebar />
          </div>
        )}
        <Layout className="content-layout">
          <Content className="main-content-area">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
      <AppFooter />
    </Layout>
  );
};

export default ClientLayout;