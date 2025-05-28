import React from 'react';
import { Menu, Layout } from 'antd';
import { HomeOutlined, BookOutlined, FacebookOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar = () => {
  return (
    <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="1" icon={<HomeOutlined />}>
          Home
        </Menu.Item>
        <Menu.Item key="2" icon={<BookOutlined />}>
          Courses
        </Menu.Item>
        <Menu.Item key="3" icon={<FacebookOutlined />}>
          Facebook
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSidebar;