import React, { useState, useEffect } from 'react';
import { config } from '../../api/axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layout, Input, Space, Button, Avatar, Dropdown, Spin, Typography, Badge, Card, List, Tag, Divider, Popover, Select, message
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchOutlined,
  BellOutlined,
  MessageOutlined,
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
  BarChartOutlined,
  RocketOutlined,
  FireOutlined,
  StarOutlined,
  SettingOutlined,
  DeleteOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import AuthNotification from '../../components/common/AuthNotification';
import ToastNotification from '../../components/common/ToastNotification';
import AccountTypeModal from '../../components/common/AccountTypeModal';
import { useCart } from '../../contexts/CartContext';
import { courseService } from '../../services/apiService';
import { useNotification } from '../../hooks/useNotification';
import './Header.css';
import { io } from 'socket.io-client';
import socket from '../../services/socket';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const role = localStorage.getItem('role');


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

  const [user, setUser] = useState<User | null | false>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountTypeModalVisible, setAccountTypeModalVisible] = useState(false);
  const navigate = useNavigate();
  
  // Sử dụng hook notification mới
  const { 
    notification, 
    toast,
    showLogoutSuccess, 
    hideNotification, 
    hideToast 
  } = useNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/messages/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadMessagesCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread messages count:', error);
      }
    };

    if (user) {
      fetchUnreadMessagesCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadMessagesCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setLoadingNotifications(true);
    const token = localStorage.getItem('token');
    fetch('/api/notifications', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => setNotifications(
        (data.data || []).map((notification: any) => ({
          id: notification._id || notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.content,
          time: notification.created_at ? new Date(notification.created_at).toLocaleString() : '',
          isRead: notification.status === 'read',
          link: notification.meta?.link
        }))
      ))
      .finally(() => setLoadingNotifications(false));

    // --- SOCKET.IO REALTIME ---
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      const socket = io('http://localhost:5000');
      socket.emit('join', user._id);
      socket.on('new-notification', (notification: any) => {
        console.log('Nhận notification realtime:', notification);
        const mapped = {
          id: notification._id || notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.content,
          time: notification.created_at ? new Date(notification.created_at).toLocaleString() : '',
          isRead: notification.status === 'read',
          link: notification.meta?.link
        };
        setNotifications(prev => [mapped, ...prev]);
      });
      return () => {
        socket.off('new-notification');
        socket.disconnect();
      };
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user._id) {
      socket.connect();
      socket.emit('auth-event', { type: 'logout', userId: user._id });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(false);
    showLogoutSuccess();
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
    const token = localStorage.getItem('token');
    // Đánh dấu đã đọc trên backend
    fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    // Đánh dấu đã đọc trên frontend
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    if (notification.link) {
      navigate(notification.link);
    }
    setNotificationsOpen(false);
  };

  const handleDeleteNotification = (notification: Notification) => {
    const token = localStorage.getItem('token');
    fetch(`/api/notifications/${notification.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#10b981' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ef4444' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#3b82f6' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('user');
      try {
        if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
          setUser(false);
        } else {
          let userData = JSON.parse(storedUser);
          if (userData && typeof userData.role === 'string') {
            userData.role = { name: userData.role };
            localStorage.setItem('user', JSON.stringify(userData));
          }
          setUser(userData);
        }
      } catch (err) {
        console.error('Lỗi parse user data:', err);
        setUser(false);
      }
      setLoading(false);
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
    };
  }, []);

  const userMenu = user
    ? {
      items: [
        {
          key: '/profile',
          label: (
            <div className="user-menu-header">
              <Avatar
                src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff`}
                size={48}
                className="user-avatar"
              />
              <div className="user-info">
                <Text strong className="user-name">{user.fullname}</Text>
                {user.nickname && (
                  <Text className="user-nickname">@{user.nickname}</Text>
                )}
                <Text className="user-role">Xem hồ sơ của bạn</Text>
              </div>
            </div>
          ) as React.ReactNode,
          style: { height: 'auto', padding: '16px', cursor: 'pointer' },
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
        {
          type: 'group' as const,
          label: 'Đơn hàng',
          children: [
            { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng!' }
          ],
        },
        {
          type: 'group' as const,
          label: 'Báo cáo',
          children: [
            { key: '/report', icon: <BarChartOutlined />, label: 'Báo cáo!' }
          ],
        },
        ...(!['admin', 'instructor', 'moderator'].includes(getRoleName(user) || '') ? [{
          type: 'group' as const,
          label: 'Ví',
          children: [
            { key: '/wallet', icon: <WalletOutlined />, label: 'Ví của tôi' }
          ],
        }] : []),
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: <span className="logout-text">Đăng xuất</span> },
      ].filter((item, idx, arr) => {
        if (item.type === 'divider' && idx > 0 && arr[idx - 1].type === 'divider') return false;
        if (item.type === 'divider' && (idx === 0 || idx === arr.length - 1)) return false;
        return true;
      }),
      onClick: handleMenuClick,
    }
    : undefined;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#3b82f6' : '#64748b',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
  });

  const notificationDropdown = (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="notification-dropdown"
    >
      <Card
        className="notification-card"
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px'
        }}
        title={
          <div className="notification-header">
            <div className="notification-title">
              <BellOutlined className="notification-icon" />
              <span>Thông báo</span>
            </div>
            <Badge count={unreadCount} size="small" className="notification-badge" />
          </div>
        }
        styles={{ body: { padding: 0, maxHeight: 400, overflowY: 'auto' } }}
      >
        <AnimatePresence>
          {loadingNotifications ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="loading-notifications"
            >
              <Spin />
            </motion.div>
          ) : notifications.length > 0 ? (
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
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    actions={[
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteNotification(notification);
                        }}
                        danger
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <motion.div
                          className="notification-avatar"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>
                      }
                      title={
                        <div className="notification-item-header">
                          <Text strong className="notification-item-title">
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <motion.div
                              className="unread-indicator"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{ backgroundColor: getNotificationColor(notification.type) }}
                            />
                          )}
                        </div>
                      }
                      description={
                        <div className="notification-item-content">
                          <Text className="notification-message">
                            {notification.message}
                          </Text>
                          <div className="notification-meta">
                            <ClockCircleOutlined className="time-icon" />
                            <Text className="time-text">{notification.time}</Text>
                            <Tag
                              color={notification.type === 'success' ? 'green' :
                                notification.type === 'warning' ? 'orange' :
                                  notification.type === 'error' ? 'red' : 'blue'}
                              className="notification-tag"
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
              className="empty-notifications"
            >
              <BellOutlined className="empty-icon" />
              <div className="empty-text">Không có thông báo mới</div>
            </motion.div>
          )}
        </AnimatePresence>

        {notifications.length > 0 && (
          <div className="notification-footer">
            <Button type="link" size="small" className="view-all-button">
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );

  return (
    <>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="header-container"
      >
        <AntHeader className="modern-header">
          {/* Left & Center Section */}
          <div className="header-left">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="logo-container"
            >
              <NavLink to="/" className="logo-link">
                <RocketOutlined className="logo-icon" />
                <span className="logo-text">EduPro</span>
              </NavLink>
            </motion.div>
            
            <div className="nav-links">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-item"
              >
                <NavLink to="/vouchers" style={navLinkStyle} className="nav-link">
                  <GiftOutlined className="nav-icon" />
                  <span className="nav-text">Mã giảm giá</span>
                </NavLink>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-item"
              >
                <NavLink to="/courses" style={navLinkStyle} className="nav-link">
                  <ReadOutlined className="nav-icon" />
                  <span className="nav-text">Khóa học</span>
                </NavLink>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-item"
              >
                <NavLink to="/instructors" style={navLinkStyle} className="nav-link">
                  <TeamOutlined className="nav-icon" />
                  <span className="nav-text">Giảng viên</span>
                </NavLink>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="nav-item"
              >
                <NavLink to="/blog" style={navLinkStyle} className="nav-link">
                  <BookOutlined className="nav-icon" />
                  <span className="nav-text">Blog</span>
                </NavLink>
              </motion.div>
            </div>
          </div>

          {/* Right Section */}
          <div className="header-right">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="loading-container"
              >
                <Spin />
              </motion.div>
            ) : user ? (
              <Space size="middle" className="user-actions">
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
                    className="notification-button"
                  >
                    <div className="action-button-wrapper">
                      <Button
                        className="action-button notification-action"
                        type="text"
                        shape="circle"
                        icon={<BellOutlined className="action-icon" />}
                      />
                      {unreadCount > 0 && (
                        <span className="corner-badge notification-corner-badge">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Popover>
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="message-button"
                >
                  <div className="action-button-wrapper">
                    <Button
                      onClick={() => navigate('/messages')}
                      className="action-button message-action"
                      type="text"
                      shape="circle"
                      icon={<MessageOutlined className="action-icon" />}
                    />
                    {unreadMessagesCount > 0 && (
                      <span className="corner-badge message-corner-badge">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="cart-button"
                >
                  <div className="action-button-wrapper">
                    <Button
                      onClick={() => navigate('/cart')}
                      className="action-button cart-action"
                      type="text"
                      shape="circle"
                      icon={<ShoppingCartOutlined className="action-icon" />}
                    />
                    {cartCount > 0 && (
                      <span className="corner-badge cart-corner-badge">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </motion.div>
                
                <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight" arrow>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="user-avatar-container"
                  >
                    <Avatar
                      src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff`}
                      className="user-avatar"
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
                className="auth-buttons"
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
                  >
                    <RocketOutlined className="register-icon" />
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
        onComplete={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.autoClose}
        duration={notification.duration}
        showProgress={notification.showProgress}
      />

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast.isVisible}
        onComplete={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        autoClose={toast.autoClose}
        duration={toast.duration}
        position={toast.position}
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
