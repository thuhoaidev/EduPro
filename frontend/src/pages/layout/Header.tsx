import React from 'react';
import { Layout, Input, Space, Button, Avatar, Badge, Dropdown } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, ShoppingCartOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
  // Menu items cho dropdown khi click vào avatar
  const avatarMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center py-2 cursor-pointer">
          <UserOutlined className="mr-2" />
          Trang cá nhân
        </div>
      ),
    },
    {
      key: 'blog',
      label: (
        <div className="flex items-center py-2 cursor-pointer">
          <EditOutlined className="mr-2" />
          Viết blog
        </div>
      ),
    },
    {
      key: 'my-posts',
      label: (
        <div className="flex items-center py-2 cursor-pointer">
          <EditOutlined className="mr-2" />
          Bài viết của tôi
        </div>
      ),
    },
    {
      key: 'saved-posts',
      label: (
        <div className="flex items-center py-2 cursor-pointer">
          <EditOutlined className="mr-2" />
          Bài viết đã lưu
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: (
        <a href="http://localhost:5173/client/PersonalInfoPage" className="flex items-center py-2">
          <SettingOutlined className="mr-2" />
          Cài đặt
        </a>
      ),
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center py-2 cursor-pointer">
          <EditOutlined className="mr-2" />
          Đăng xuất
        </div>
      ),
    },
  ];

  return (
    <Header style={{
      background: '#fff',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      height: 70,
    }} className="sticky top-0 z-50 w-full">
      <div className="flex items-center h-full">
        {/* Logo */}
        <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg" alt="Udemy Logo" style={{
          height: 34,
          marginRight: 8,
        }} />
        {/* Explore Text */}
        <span className="font-semibold text-gray-700 cursor-pointer hidden md:block">Explore</span>
      </div>

      {/* Search Input */}
      <div className="flex-1 mx-4 max-w-md">
        <Input
          placeholder="Find your next course by skill, topic, or instructor"
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          style={{
            width: '100%',
            borderRadius: 9999,
            padding: '10px 20px',
            border: '1px solid #d1d7dc',
            backgroundColor: '#f7f9fa',
          }}
          className="hover:border-[#a435f0] focus:border-[#a435f0]"
          onFocus={(e) => {
            e.target.style.borderColor = '#a435f0';
            e.target.style.boxShadow = '0 0 0 1px rgba(164, 53, 240, 0.2)';
            e.target.style.backgroundColor = '#fff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d7dc';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = '#f7f9fa';
          }}
        />
      </div>

      {/* Right Section: Links and Icons */}
      <Space size="middle" className="h-full flex items-center">
        {/* Links */}
        <Button type="link" className="text-gray-700 font-semibold hidden lg:block">Udemy Business</Button>
        <Button type="link" className="text-gray-700 font-semibold hidden lg:block">Teach on Udemy</Button>
        <Button type="link" className="text-gray-700 font-semibold hidden md:block">My learning</Button>

        {/* Cart Icon */}
        <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: '1.4em', color: '#5624d0' }} />} className="text-gray-700" />

        {/* Bell Icon */}
        <Button type="text" icon={<BellOutlined style={{ fontSize: '1.4em', color: '#5624d0' }} />} className="text-gray-700" />

        {/* User Avatar with Dropdown */}
        <Dropdown 
          menu={{ items: avatarMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          overlayStyle={{ minWidth: 200 }}
        >
          <Badge dot offset={[-2, 2]} size="small">
            <Avatar icon={<UserOutlined />} style={{
              backgroundColor: '#000',
              color: '#fff',
              cursor: 'pointer',
              height: 40, 
              width: 40,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }} />
          </Badge>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;