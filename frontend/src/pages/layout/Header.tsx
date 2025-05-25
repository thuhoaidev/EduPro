import React from 'react';
import { Layout, Input, Space, Button, Avatar, Dropdown, Menu } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

import ftechcLogo from '../../assets/ftech-c.png'; // Đường dẫn đã được xác nhận

const { Header } = Layout;

const AppHeader = () => {
  const menu = (
    <Menu>
      <Menu.Item key="1">Đăng nhập</Menu.Item>
      <Menu.Item key="2">Đăng ký</Menu.Item>
    </Menu>
  );

  return (
    <>
      {/* Top Bar - Consistent across all images */}
      <div style={{ background: '#f8f8f8', padding: '8px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <span style={{ color: '#595959', marginRight: '16px', fontSize: '0.9em' }}>Xin chào admin Dương Đức Phương!</span>
        <Button style={{ background: '#e0e0e0', borderColor: '#d9d9d9', color: '#595959', borderRadius: 20, padding: '4px 12px', height: 'auto', fontSize: '0.9em' }}>
          Đăng nhập vào quản trị nội dung
        </Button>
      </div>

      {/* Main Header */}
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' // Add subtle shadow like in images
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo */}
          <img src={ftechcLogo} alt="Logo" style={{
            height: 38,
            width: 38,
            marginRight: 8,
            borderRadius: 8, // Square with rounded corners
            objectFit: 'cover'
          }} />
          {/* Brand Name with Dropdown */}
          <Dropdown overlay={menu} placement="bottomLeft">
            <Button type="link" style={{ color: '#000', fontSize: '1.2em', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              Lập trình Frech <span style={{ marginLeft: 4, transform: 'rotate(90deg)', display: 'inline-block', lineHeight: 1, transition: 'transform 0.2s' }}>&#9660;</span> {/* Small arrow, consider dynamic rotation */}
            </Button>
          </Dropdown>
        </div>
        {/* Search Input */}
        <div style={{ flex: 1, marginLeft: 24, marginRight: 24 }}>
          <Input
            placeholder="Tìm kiếm khóa học"
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            style={{
              width: '100%',
              borderRadius: 25, // More rounded corners for input
              padding: '8px 12px',
              border: '1px solid #d9d9d9', // Default border
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
            }}
            
            onFocus={(e) => {
              e.target.style.borderColor = '#1890ff';
              e.target.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d9d9d9';
              e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            }}
          />
        </div>
        {/* Right Section: Icons and Avatar */}
        <Space size="middle" style={{ alignItems: 'center' }}>
          {/* Bell Icon */}
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '1.4em', color: '#888' }} />}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundColor: '#f0f2f5',
              border: '1px solid #d9d9d9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
          />
          {/* User Avatar */}
          <Avatar
            icon={<UserOutlined />}
            style={{
              backgroundColor: '#e0e0e0',
              color: '#888',
              cursor: 'pointer',
              height: 40, width: 40,
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #d9d9d9',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
          />
        </Space>
      </Header>
    </>
  );
};

export default AppHeader;