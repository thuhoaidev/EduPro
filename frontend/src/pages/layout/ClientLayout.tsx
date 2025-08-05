import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './Header';
import AppFooter from './Footer';
import AppSidebar from './CategoryNav';
import './ClientLayout.css';
import AIRecommendationModal from '../../components/ai/AIRecommendationModal';
import { useAIRecommendation } from '../../hooks/useAIRecommendation';
import { useAuth } from '../../contexts/AuthContext';

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
  const isSavedBlogPage = location.pathname === '/blog/saved';
  const isWalletPage = location.pathname === '/wallet';
  const isUserReportPage = location.pathname === '/report';
  const isOrdersPage = location.pathname === '/orders';
  const isCertificatesPage = location.pathname.startsWith('/certificates');

  const { user } = useAuth();
  const ai = useAIRecommendation(user?._id || '');

  return (
    <Layout className="client-layout">
      <AppHeader />
      <Layout className="main-content">
        {!isProfilePage && !isCoursesPage && !isVouchersPage && !isInstructorsPage && !isBlogPage && !isCartPage && !isCheckoutPage && !isLessonVideoOrQuiz && !isUserProfilePage && !isSavedBlogPage && !isWalletPage && !isUserReportPage && !isOrdersPage && !isCertificatesPage && (
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
      {user && (
        <AIRecommendationModal
          visible={ai.visible}
          onClose={() => ai.setVisible(false)}
          loading={ai.loading}
          recommendations={ai.recommendations}
          reasons={ai.reasons}
          error={ai.error}
        />
      )}
    </Layout>
  );
};

export default ClientLayout;