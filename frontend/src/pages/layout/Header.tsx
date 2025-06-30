import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layout, Input, Space, Button, Avatar, Dropdown, Spin, Typography, Badge, Card, List, Tag, Divider, Popover
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  DashboardOutlined,
  EditOutlined,
  ProfileOutlined,
  BookOutlined,
  ReadOutlined,
  TeamOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import AuthNotification from '../../components/common/AuthNotification';
import AccountTypeModal from '../../components/common/AccountTypeModal';
import { useCart } from '../../contexts/CartContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: { name: string };
  isVerified?: boolean;
  nickname?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
}

const AppHeader = () => {
  const getRoleName = (user: User): string => user?.role?.name || 'student';
  const { cartCount } = useCart();

  const [user, setUser] = useState<User | null | false>(null); // null: loading, User: logged in, false: not logged in
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountTypeModalVisible, setAccountTypeModalVisible] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Mock notifications data
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Khóa học mới',
      message: 'Khóa học ReactJS từ cơ bản đến nâng cao đã được phát hành',
      time: '5 phút trước',
      isRead: false,
      link: '/courses'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
      time: '1 giờ trước',
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Thông báo từ giảng viên',
      message: 'Giảng viên Nguyễn Văn An đã trả lời câu hỏi của bạn',
      time: '2 giờ trước',
      isRead: true,
      link: '/profile'
    },
    {
      id: '4',
      type: 'success',
      title: 'Thanh toán thành công',
      message: 'Bạn đã mua thành công khóa học Node.js với giá 450,000đ',
      time: '1 ngày trước',
      isRead: true,
      link: '/courses'
    },
    {
      id: '5',
      type: 'info',
      title: 'Nhắc nhở học tập',
      message: 'Bạn có 3 bài học chưa hoàn thành trong tuần này',
      time: '2 ngày trước',
      isRead: true,
      link: '/profile'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(false);
    setNotification({
      isVisible: true,
      type: 'success',
      title: 'Đăng xuất thành công!',
      message: 'Bạn đã đăng xuất khỏi hệ thống. Hẹn gặp lại!'
    });
    
    // Không chuyển hướng ngay, để thông báo tự động chuyển hướng
  };

  const handleRegisterClick = () => {
    setAccountTypeModalVisible(true);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }
    navigate(key);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    setNotificationsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && typeof userData.role === 'string') {
          userData.role = { name: userData.role };
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setUser(userData);
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
        const userData = response.data.data;
        setUser(userData);
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        // Không xóa token ở đây nữa
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
    window.addEventListener('user-updated', fetchUser);
    fetchUser();

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('user-updated', fetchUser);
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
                  {user.nickname && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      @{user.nickname}
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Xem hồ sơ của bạn</Text>
                </div>
              </div>
            ) as React.ReactNode,
            style: { height: 'auto', padding: '12px', cursor: 'pointer' },
          },
          { type: 'divider' as const },
          ...(getRoleName(user) === 'admin'
            ? [
                { key: '/admin', icon: <DashboardOutlined />, label: 'Trang quản trị' },
                { type: 'divider' as const },
              ]
            : []),
          ...(getRoleName(user) === 'moderator'
            ? [
                { key: '/moderator', icon: <DashboardOutlined />, label: 'Khu vực kiểm duyệt' },
                { type: 'divider' as const },
              ]
            : []),
          ...(getRoleName(user) === 'instructor'
            ? [
                { key: '/instructor', icon: <DashboardOutlined />, label: 'Khu vực giảng viên' },
                { type: 'divider' as const },
              ]
            : []),
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
          { key: 'logout', icon: <LogoutOutlined />, label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span> },
        ].filter((item, idx, arr) => {
          // Xóa divider trùng nhau
          if (item.type === 'divider' && idx > 0 && arr[idx - 1].type === 'divider') return false;
          // Không cho divider ở đầu hoặc cuối
          if (item.type === 'divider' && (idx === 0 || idx === arr.length - 1)) return false;
          return true;
        }),
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

  const notificationDropdown = (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ width: 380 }}
    >
      <Card 
        className="shadow-xl border-0"
        headStyle={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px 8px 0 0'
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellOutlined />
              <span>Thông báo</span>
            </div>
            <Badge count={unreadCount} size="small" />
          </div>
        }
        styles={{ body: { padding: 0, maxHeight: 400, overflowY: 'auto' } }}
      >
        <AnimatePresence>
          {notifications.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <List.Item
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: notification.isRead ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                      borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-gray-50"
                  >
                    <List.Item.Meta
                      avatar={
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong style={{ fontSize: 14 }}>
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
          style={{
                                width: 8,
                                height: 8,
            borderRadius: '50%',
                                backgroundColor: getNotificationColor(notification.type),
                              }}
                            />
                          )}
          </div>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                            {notification.message}
                          </Text>
                          <div className="flex items-center gap-2 mt-2">
                            <ClockCircleOutlined style={{ fontSize: 12, color: '#999' }} />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {notification.time}
                            </Text>
                            <Tag 
                              color={notification.type === 'success' ? 'green' : 
                                     notification.type === 'warning' ? 'orange' : 
                                     notification.type === 'error' ? 'red' : 'blue'}
                              style={{ fontSize: 10 }}
                            >
                              {notification.type === 'success' ? 'Thành công' :
                               notification.type === 'warning' ? 'Cảnh báo' :
                               notification.type === 'error' ? 'Lỗi' : 'Thông tin'}
                            </Tag>
          </div>
        </div>
                      }
                    />
                  </List.Item>
                  {index < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
                </motion.div>
              )}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                padding: '40px 20px', 
                textAlign: 'center',
                color: '#999'
              }}
            >
              <BellOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>Không có thông báo mới</div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {notifications.length > 0 && (
          <div style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center'
          }}>
            <Button type="link" size="small">
              Xem tất cả thông báo
            </Button>
      </div>
        )}
      </Card>
    </motion.div>
  );

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
          .search-input {
            transition: all 0.3s ease;
            border: 2px solid transparent;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          }
          .search-input:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
          }
          .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: white;
          }
          .auth-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border-radius: 8px;
            font-weight: 500;
          }
          .auth-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          .auth-button:hover::before {
            left: 100%;
          }
          .login-button {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e2e8f0;
            color: #475569;
          }
          .login-button:hover {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            border-color: #cbd5e1;
            color: #1e293b;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          .register-button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border: 2px solid #3b82f6;
            color: white;
          }
          .register-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            border-color: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          }
          .nav-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            color: #64748b;
            text-decoration: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
            border: none;
            overflow: visible;
          }
          .nav-link::before {
            display: none;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
            border-radius: 2px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(-50%);
          }
          .nav-link:hover {
            color: #1e293b;
            transform: translateY(-2px);
          }
          .nav-link:hover::after {
            width: 80%;
          }
          .nav-link.active {
            color: #1e293b;
            background: transparent;
            border: none;
            box-shadow: none;
          }
          .nav-link.active::after {
            width: 80%;
          }
          .nav-link .nav-icon {
            font-size: 16px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          }
          .nav-link:hover .nav-icon {
            transform: scale(1.1);
            color: #3b82f6;
          }
          .nav-link.active .nav-icon {
            color: #3b82f6;
            transform: scale(1.05);
          }
          .nav-text {
            position: relative;
            z-index: 1;
            transition: all 0.3s ease;
          }
          .nav-link:hover .nav-text {
            transform: translateX(2px);
          }
          .nav-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
          }
          .nav-link:hover .nav-badge {
            opacity: 1;
            transform: scale(1);
          }
          .nav-container {
            position: relative;
            display: flex;
            align-items: center;
          }
          .nav-container::before {
            display: none;
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavLink to="/" className="flex items-center">
                <span className="logo-text">EduPro</span>
              </NavLink>
            </motion.div>
            <div className="hidden lg:flex items-center gap-x-2">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-container"
              >
                <NavLink to="/vouchers" style={navLinkStyle} className="nav-link">
                  <span className="nav-icon">
                    <GiftOutlined />
                  </span>
                  <span className="nav-text">Mã giảm giá</span>
                </NavLink>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-container"
              >
                <NavLink to="/courses" style={navLinkStyle} className="nav-link">
                  <span className="nav-icon">
                    <ReadOutlined />
                  </span>
                  <span className="nav-text">Khóa học</span>
                </NavLink>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-container"
              >
                <NavLink to="/instructors" style={navLinkStyle} className="nav-link">
                  <span className="nav-icon">
                    <TeamOutlined />
                  </span>
                  <span className="nav-text">Giảng viên</span>
                </NavLink>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-container"
              >
                <NavLink to="/blog" style={navLinkStyle} className="nav-link">
                  <span className="nav-icon">
                    <BookOutlined />
                  </span>
                  <span className="nav-text">Blog</span>
                </NavLink>
              </motion.div>
            </div>
        </div>

          {/* Right Section */}
          <div className="flex items-center gap-x-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Input
                placeholder="Tìm kiếm khóa học, giảng viên..."
                prefix={
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </motion.div>
                }
                className="hidden md:flex w-72 search-input"
                style={{ borderRadius: '12px', height: '40px' }}
                allowClear
              />
            </motion.div>
            
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Spin />
                </motion.div>
              ) : user ? (
              <Space size="middle">
            <Popover
                  content={notificationDropdown} 
              trigger="click"
              placement="bottomRight"
              arrow
                  open={notificationsOpen}
                  onOpenChange={setNotificationsOpen}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge count={unreadCount} size="small">
                      <Button 
                        className="header-action-button" 
                        type="text" 
                        shape="circle" 
                        icon={<BellOutlined style={{ fontSize: '18px' }} />} 
                      />
                    </Badge>
                  </motion.div>
                </Popover>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge count={cartCount} showZero size="small">
                    <Button 
                      onClick={() => navigate('/cart')} 
                      className="header-action-button" 
                      type="text" 
                      shape="circle" 
                      icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} 
                    />
                  </Badge>
                </motion.div>
                <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight" arrow>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar 
                    src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff`}
                      className="cursor-pointer"
                      size={40}
                    />
                  </motion.div>
            </Dropdown>
              </Space>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    onClick={() => navigate('/login')} 
                    size="middle" 
                    className="auth-button login-button"
                    style={{ height: '40px', padding: '0 20px' }}
                  >
                    Đăng nhập
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    onClick={handleRegisterClick} 
                    type="primary" 
                    size="middle" 
                    className="auth-button register-button"
                    style={{ height: '40px', padding: '0 20px' }}
                  >
                    Đăng ký
                  </Button>
                </motion.div>
              </motion.div>
            )}
                  </div>
        </AntHeader>
      </motion.div>

      {/* Shared Auth Notification */}
      <AuthNotification 
        isVisible={notification.isVisible}
        onComplete={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        duration={2000}
        showProgress={notification.type === 'success'}
      />

      {/* Account Type Modal */}
      <AccountTypeModal
        isVisible={accountTypeModalVisible}
        onClose={() => setAccountTypeModalVisible(false)}
      />
    </>
  );
};

export default AppHeader;
