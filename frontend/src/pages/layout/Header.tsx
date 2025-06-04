import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import {
  Layout, Input, Space, Button, Avatar, Badge, Dropdown, Spin
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  EditOutlined
} from '@ant-design/icons';


const { Header } = Layout;

const AppHeader = () => {
  const [user, setUser] = useState(null); // null: chưa load, object: đã đăng nhập, false: chưa đăng nhập
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log(storedUser)

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return; // Dùng dữ liệu cached, không gọi API
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
        localStorage.setItem('user', JSON.stringify(response.data)); // Lưu lại user
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setUser(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  // Menu khi đã đăng nhập
  const userDropdown = user && (
    <div style={{
      width: 220,
      padding: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderRadius: 8,
      color: '#000',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Avatar src={user.avatar} size={48} style={{ flexShrink: 0 }} />
        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          {/* Đặt chiều rộng cố định, overflow hidden và dấu ... */}
          <div style={{
            fontWeight: 600,
            color: '#000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.fullName}
          </div>
          <div style={{
            fontSize: 12,
            color: '#888',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            @{user.email}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href="/profile" style={{ color: '#000' }}>Trang cá nhân</a>
        <a href="/register/instructor" style={{ color: '#000' }}>Đăng ký làm giảng viên</a>
        <a href="/settings" style={{ color: '#000' }}>Cài đặt</a>
        <a href="/logout" style={{ color: 'red', fontWeight: '500' }}>Đăng xuất</a>
      </div>
    </div>
  );


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

      {/* Logo + Explore */}
      <div className="flex items-center h-full">
        <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
          alt="Udemy Logo" style={{ height: 34, marginRight: 8 }} />
        <span className="font-semibold text-gray-700 cursor-pointer hidden md:block">Explore</span>
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
          <Dropdown overlay={userDropdown} trigger={['click']} placement="bottomRight" arrow>
            <Badge dot offset={[-2, 2]} size="small">
              <Avatar src={user.avatar} style={{ cursor: 'pointer' }} />
            </Badge>
          </Dropdown>
        ) : (
          <Dropdown
            overlay={
              <div style={{
                width: 200,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <Button
                  type="primary"
                  block
                  href="/login"
                  className="!bg-[#a435f0] !text-white !font-semibold hover:opacity-90"
                >
                  Đăng nhập
                </Button>
                <Button
                  type="default"
                  block
                  href="/register"
                  className="!font-semibold"
                >
                  Đăng ký
                </Button>
              </div>
            }
            trigger={['click']}
            placement="bottomRight"
          >

            <Avatar icon={<UserOutlined />} style={{
              backgroundColor: '#000', color: '#fff', cursor: 'pointer',
              height: 40, width: 40
            }} />
          </Dropdown>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
