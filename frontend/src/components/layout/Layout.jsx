import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const { Content } = AntLayout;

// Component Layout chính của ứng dụng
const Layout = () => {
  return (
    <AntLayout className="min-h-screen">
      <Header />
      <Content className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout; 