import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Input, Space, Button, Avatar, Badge, Dropdown, Spin, message
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';


const { Header } = Layout;

interface User {
  avatar?: string;
  fullName: string;
  email: string;
  role: string;
}

const AppHeader = () => {
  const [user, setUser] = useState<User | null | false>(null); // null: chưa load, User: đã đăng nhập, false: chưa đăng nhập
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset user state
    setUser(false);
    // Show success message
    message.success('Đăng xuất thành công!');
    // Redirect to home page
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log(storedUser)

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(false);
        setLoading(false);
        return;
      }

      try {
        const response = await config.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setUser(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  // Menu khi đã đăng nhập
  const userDropdown = user && (
    <div style={{
      width: 280,
      padding: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderRadius: 8,
      color: '#000',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Avatar src={user.avatar} size={48} style={{ flexShrink: 0 }} />
        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: '#000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: 4
          }} onClick={() => navigate('/profile')}>
            {user.fullName}
          </div>
          <div style={{
            fontSize: 13,
            color: '#666',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer'
          }} onClick={() => navigate('/profile')}>
            @{user.email}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {user.role === 'user' ? (
          <>
            <a onClick={() => handleMenuClick('/settings')} className="menu-item" style={{ 
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <SettingOutlined style={{ marginRight: 8 }} />
              Cài đặt
            </a>
            <a onClick={handleLogout} className="menu-item-danger" style={{ 
              color: '#ff4d4f',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <LogoutOutlined style={{ marginRight: 8 }} />
              Đăng xuất
            </a>
          </>
        ) : (
          <>
            {user.role === 'admin' && (
              <a onClick={() => handleMenuClick('/admin/users')} className="menu-item" style={{ 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 6,
                transition: 'all 0.3s'
              }}>
                <DashboardOutlined style={{ marginRight: 8 }} />
                Trang quản trị
              </a>
            )}
            {user.role === 'instructor' && (
              <a onClick={() => handleMenuClick('/instructor')} className="menu-item" style={{ 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 6,
                transition: 'all 0.3s'
              }}>
                <DashboardOutlined style={{ marginRight: 8 }} />
                Trang giảng viên
              </a>
            )}
            {user.role === 'moderator' && (
              <a onClick={() => handleMenuClick('/moderator')} className="menu-item" style={{ 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 6,
                transition: 'all 0.3s'
              }}>
                <DashboardOutlined style={{ marginRight: 8 }} />
                Trang quản trị viên
              </a>
            )}
            <a onClick={() => handleMenuClick('/settings')} className="menu-item" style={{ 
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <SettingOutlined style={{ marginRight: 8 }} />
              Cài đặt
            </a>
            <a onClick={handleLogout} className="menu-item-danger" style={{ 
              color: '#ff4d4f',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <LogoutOutlined style={{ marginRight: 8 }} />
              Đăng xuất
            </a>
          </>
        )}
      </div>
    </div>
  );


  return (
    <>
      <style>
        {`
          .menu-item:hover {
            background-color: #f5f5f5;
          }
          .menu-item-danger:hover {
            background-color: #fff1f0;
          }
        `}
      </style>
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

        {/* Logo + Explore */}
        <div className="flex items-center h-full">
          <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
            alt="Udemy Logo" style={{ height: 34, marginRight: 8 }} />
          {window.location.pathname === '/profile' && (
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: 8 }}
            >
              <span style={{ fontSize: 20, marginRight: 4, color: '#8a94a5', display: 'flex', alignItems: 'center', lineHeight: 1 }}>&lt;</span>
              <span style={{ fontWeight: 400, fontSize: 13, color: '#8a94a5', letterSpacing: 1 }}>QUAY LẠI</span>
            </div>
          )}
        </div>

        {/* Search */}
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

        {/* Right */}
        <Space size="middle" className="h-full flex items-center">
          <Button type="link" className="text-gray-700 font-semibold hidden lg:block">Udemy Business</Button>
          <Button type="link" className="text-gray-700 font-semibold hidden lg:block">Teach on Udemy</Button>
          <Button type="link" className="text-gray-700 font-semibold hidden md:block">My learning</Button>
          <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: '1.4em', color: '#5624d0' }} />} />
          <Button type="text" icon={<BellOutlined style={{ fontSize: '1.4em', color: '#5624d0' }} />} />

          {/* Avatar or Login */}
          {loading ? (
            <Spin size="small" />
          ) : user ? (
            <Dropdown 
              overlay={userDropdown as React.ReactElement} 
              trigger={['click']} 
              placement="bottomRight" 
              arrow
            >
              <Badge dot offset={[-2, 2]} size="small">
                <Avatar src={user.avatar} style={{ cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
          ) : (
            <Dropdown
              overlay={
                <div style={{
                  width: 280,
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#000' }}>Đăng nhập để tiếp tục</h3>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>Đăng nhập để truy cập vào các tính năng của hệ thống</p>
                  </div>
                  <Button
                    type="primary"
                    block
                    href="/login"
                    className="!bg-[#a435f0] !text-white !font-semibold hover:opacity-90 h-10"
                    icon={<LoginOutlined />}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="default"
                    block
                    href="/register"
                    className="!font-semibold h-10"
                    icon={<UserAddOutlined />}
                  >
                    Đăng ký
                  </Button>
                </div>
              }
              trigger={['click']}
              placement="bottomRight"
              arrow
            >
              <Avatar icon={<UserOutlined />} style={{
                backgroundColor: '#000', color: '#fff', cursor: 'pointer',
                height: 40, width: 40
              }} />
            </Dropdown>
          )}
        </Space>
      </Header>
    </>
  );
};

export default AppHeader;
