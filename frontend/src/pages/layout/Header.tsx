import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layout, Input, Space, Button, Avatar, Dropdown, Spin, message, Typography, Badge
} from 'antd';
import { motion } from 'framer-motion';
import {
  SearchOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  EditOutlined,
  ProfileOutlined,
  BookOutlined,
  ReadOutlined,
  TeamOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: { name: string };
  isVerified?: boolean;
}

const AppHeader = () => {
  const getRoleName = (user: User): string => user?.role?.name || 'student';

  const [user, setUser] = useState<User | null | false>(null); // null: loading, User: logged in, false: not logged in
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(false);
    message.success('Đăng xuất thành công!');
    navigate('/');
  };
  
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }
    navigate(key);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(false);
        setLoading(false);
        return;
      }

      try {
        const response = await config.get('/auth/me');
        const userData = response.data.data; // Assuming user data is in response.data.data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        localStorage.removeItem('token'); // Clear invalid token
        setUser(false);
      } finally {
        setLoading(false);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'user' || event.key === 'token') {
            fetchUser();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    fetchUser();

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const userMenu = user
    ? {
        items: [
          {
            key: '/profile',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar 
                  src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff`}
                  size={48} 
                />
                <div>
                  <Text strong>{user.fullname}</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Xem hồ sơ của bạn</Text>
                </div>
              </div>
            ) as React.ReactNode,
            style: { height: 'auto', padding: '12px', cursor: 'pointer' },
          },
          { type: 'divider' as const },
          ...(getRoleName(user) === 'admin' ? [{ key: '/admin', icon: <DashboardOutlined />, label: 'Bảng điều khiển Admin' }] : []),
          ...(getRoleName(user) === 'moderator' ? [{ key: '/moderator', icon: <DashboardOutlined />, label: 'Khu vực kiểm duyệt' }] : []),
          ...(getRoleName(user) === 'instructor' ? [{ key: '/instructor', icon: <DashboardOutlined />, label: 'Khu vực giảng viên' }] : []),
          ...(getRoleName(user) === 'student' ? [{ key: '/register/instructor', icon: <TeamOutlined />, label: 'Trở thành giảng viên' }] : []),
          ...(getRoleName(user) !== 'student' ? [{ type: 'divider' as const }] : []),
          {
            type: 'group' as const,
            label: 'Blog cá nhân',
            children: [
              { key: '/blog/write', icon: <EditOutlined />, label: 'Viết blog' },
              { key: '/blog/mine', icon: <ProfileOutlined />, label: 'Bài viết của tôi' },
              { key: '/blog/saved', icon: <BookOutlined />, label: 'Bài viết đã lưu' },
            ],
          },
          { type: 'divider' as const },
          { key: '/profile/edit', icon: <SettingOutlined />, label: 'Cài đặt tài khoản' },
          { key: 'logout', icon: <LogoutOutlined />, label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span> },
        ],
        onClick: handleMenuClick,
      }
    : undefined;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#1677ff' : '#333',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#' : 'transparent'
  });

  return (
    <>
      <style>
        {`
          .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            letter-spacing: -0.5px;
          }
          .header-action-button:hover {
            background-color: #f1f5f9;
          }
        `}
      </style>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <AntHeader style={{
          background: '#fff',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          height: 68,
        }} className="sticky top-0 z-50 w-full">

          {/* Left & Center Section */}
          <div className="flex items-center gap-x-8">
            <NavLink to="/" className="flex items-center">
              <span className="logo-text">EduPro</span>
            </NavLink>
            <div className="hidden lg:flex items-center gap-x-2">
              <motion.div whileHover={{ scale: 1.05 }}><NavLink to="/vouchers" style={navLinkStyle}><GiftOutlined /> Mã giảm giá</NavLink></motion.div>
              <motion.div whileHover={{ scale: 1.05 }}><NavLink to="/courses" style={navLinkStyle}><ReadOutlined /> Khóa học</NavLink></motion.div>
              <motion.div whileHover={{ scale: 1.05 }}><NavLink to="/instructors" style={navLinkStyle}><TeamOutlined /> Giảng viên</NavLink></motion.div>
              <motion.div whileHover={{ scale: 1.05 }}><NavLink to="/blog" style={navLinkStyle}><BookOutlined /> Blog</NavLink></motion.div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-x-4">
              <Input
                  placeholder="Tìm kiếm..."
                  prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                  className="hidden md:flex w-64"
                  style={{ borderRadius: '8px' }}
              />
            
              {loading ? <Spin /> : user ? (
              <Space size="middle">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Badge count={5} size="small">
                    <Button className="header-action-button" type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
                  </Badge>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Badge count={0} showZero size="small">
                    <Button onClick={() => navigate('/cart')} className="header-action-button" type="text" shape="circle" icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} />
                  </Badge>
                </motion.div>
                <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight" arrow>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Avatar 
                      src={user.avatar && user.avatar !== 'default-avatar.jpg' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff` : user.avatar}
                      className="cursor-pointer"
                      size={40}
                    />
                  </motion.div>
                </Dropdown>
              </Space>
            ) : (
              <Space>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button href="/login" size="middle">Đăng nhập</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button href="/register" type="primary" size="middle">Đăng ký</Button>
                </motion.div>
              </Space>
            )}
          </div>
        </AntHeader>
      </motion.div>
    </>
  );
};

export default AppHeader;
