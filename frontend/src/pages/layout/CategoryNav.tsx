import React from 'react';
import { Menu, Layout } from 'antd';
import { 
  HomeOutlined,
  LaptopOutlined,
  PieChartOutlined,
  BarChartOutlined,
  BankOutlined,
  GlobalOutlined,
  BookOutlined 
} from '@ant-design/icons';

const { Sider } = Layout;

const categories = [
  { name: 'Trang chủ', icon: <HomeOutlined /> },
  { name: 'Công nghệ thông tin', icon: <LaptopOutlined /> },
  { name: 'Thiết kế đồ họa', icon: <PieChartOutlined /> },
  { name: 'Marketing', icon: <BarChartOutlined /> },
  { name: 'Quản trị kinh doanh', icon: <BankOutlined /> },
  { name: 'Ngoại ngữ', icon: <GlobalOutlined /> }
];

const AppSidebar = () => {
  return (
    <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        {/* Danh mục khóa học */}
        {categories.map((category, index) => (
          <Menu.Item key={index + 1}>
            {category.icon} {category.name}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default AppSidebar;