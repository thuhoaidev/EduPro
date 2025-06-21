import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layout, Input, Space, Button, Avatar, Dropdown, Spin, message
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
  ArrowLeftOutlined,
  EditOutlined,
  ProfileOutlined,
  BookOutlined,
} from '@ant-design/icons';


const { Header } = Layout;

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
  nickname?: string;
  isVerified?: boolean;
  approval_status?: string;
}

const AppHeader = () => {
  const getRoleName = (user: User): string => {
    if (!user) {
      return 'user';
    }

    // Kiểm tra role của người dùng
    if (user.role?.name === 'admin') {
      return 'admin';
    }
    if (user.role?.name === 'moderator') {
      return 'moderator';
    }
    if (user.role?.name === 'instructor') {
      return 'instructor';
    }
    if (user.role?.name === 'student') {
      return 'student';
    }

    return 'user';
  };

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

  const handleMenuClick = (path: string) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    // Kiểm tra role trước khi cho phép truy cập
    const roleName = getRoleName(user);
    console.log('Current role:', roleName); // Log role name

    if (path === '/admin' && roleName !== 'admin') {
      message.error('Bạn không có quyền truy cập trang quản trị');
      return;
    }

    if (path === '/moderator' && roleName !== 'moderator') {
      message.error('Bạn không có quyền truy cập trang kiểm duyệt');
      return;
    }

    if (path === '/instructor' && roleName !== 'instructor') {
      message.error('Bạn không có quyền truy cập trang giảng viên');
      return;
    }

    navigate(path);
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
        const userData = response.data;
        console.log('Raw user data from API:', userData); // Log raw data

        // Ensure role is properly structured if it exists
        if (userData.role) {
          // Keep the original role object structure
          userData.role.name = userData.role.name || 'user';
          userData.role.description = userData.role.description || '';
          userData.role.permissions = userData.role.permissions || [];
        } else {
          userData.role = {
            name: 'user',
            description: '',
            permissions: []
          };
        }

        console.log('Processed user data:', userData); // Log processed data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setUser(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

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
        <img
          src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullname || '') + '&background=4f8cff&color=fff&size=48'}
          alt="avatar"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: '#000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '16px',
            marginBottom: 4
          }} onClick={() => navigate('/profile')}>
            {user.fullname}
          </div>
          <div style={{
            fontSize: 13,
            color: '#666',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          }} onClick={() => navigate('/profile')}>
            {getRoleName(user) === 'user' ? user.email : user.nickname || user.email}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <>
          {getRoleName(user) === 'admin' && (
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
          {getRoleName(user) === 'student' && (
            <a onClick={() => navigate('/register/instructor')} className="menu-item" style={{
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <UserAddOutlined style={{ marginRight: 8 }} />
              Đăng ký tài khoản giảng viên
            </a>
          )}
          {getRoleName(user) === 'moderator' && (
            <a onClick={() => handleMenuClick('/moderator')} className="menu-item" style={{
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.3s'
            }}>
              <DashboardOutlined style={{ marginRight: 8 }} />
              Trang kiểm duyệt
            </a>
          )}
          {getRoleName(user) === 'instructor' && (
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
          {/* Blog menu items for all logged-in users */}
          <a onClick={() => handleMenuClick('/blog/write')} className="menu-item" style={{
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.3s'
          }}>
            <EditOutlined style={{ marginRight: 8 }} />
            Viết blog
          </a>
          <a onClick={() => handleMenuClick('/blog/mine')} className="menu-item" style={{
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.3s'
          }}>
            <ProfileOutlined style={{ marginRight: 8 }} />
            Bài viết của tôi
          </a>
          <a onClick={() => handleMenuClick('/blog/saved')} className="menu-item" style={{
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.3s'
          }}>
            <BookOutlined style={{ marginRight: 8 }} />
            Bài viết đã lưu
          </a>
          {/* Settings button above logout */}
          <a onClick={() => handleMenuClick('/profile/edit')} className="menu-item" style={{
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.3s',
            marginTop: 8
          }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            Cài đặt
          </a>
          {/* Logout button at the bottom */}
          <a onClick={handleLogout} className="menu-item-danger" style={{
            color: '#ff4d4f',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.3s',
            marginTop: 16
          }}>
            <LogoutOutlined style={{ marginRight: 8 }} />
            Đăng xuất
          </a>
        </>
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
          .logo-text {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(45deg, #1a73e8, #34a853);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
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
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="logo-text mr-2">EduPro</span>
          </div>
          {['/profile', '/profile/edit'].includes(window.location.pathname) && (
            <Button
              type="text"
              onClick={() => navigate('/')}
              style={{
                marginLeft: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 8px',
                height: 'auto',
                color: '#1a73e8',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              icon={<ArrowLeftOutlined style={{ fontSize: '1.2em' }} />}
            >
              Quay lại
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 mx-4 max-w-md">
          <Input
            placeholder="Tìm kiếm khóa học, giảng viên..."
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            style={{
              width: '100%',
              borderRadius: 9999,
              padding: '10px 20px',
              border: '1px solid #d1d7dc',
              backgroundColor: '#f7f9fa',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a73e8';
              e.target.style.boxShadow = '0 0 0 1px rgba(26, 115, 232, 0.2)';
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
          <Button type="link" className="text-gray-700 font-semibold hidden lg:block hover:text-[#1a73e8]">Giảng viên</Button>

          <Button type="link" className="text-gray-700 font-semibold hidden lg:block hover:text-[#1a73e8]">Bài viết nổi bật</Button>
<Link to="/cart">
      <Button 
        type="text" 
        icon={<ShoppingCartOutlined style={{ fontSize: '1.4em', color: '#1a73e8' }} />}
      />
    </Link>
          <Button type="text" icon={<BellOutlined style={{ fontSize: '1.4em', color: '#1a73e8' }} />} />

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
              <img
                src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullname || '') + '&background=4f8cff&color=fff&size=32'}
                alt="avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              />
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
                    className="!bg-[#1a73e8] !text-white !font-semibold hover:opacity-90 h-10"
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
                backgroundColor: '#1a73e8', color: '#fff', cursor: 'pointer',
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
