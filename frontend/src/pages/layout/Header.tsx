import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../hooks/useNotification';
import { io } from 'socket.io-client';
import {
  Layout, Input, Space, Button, Avatar, Dropdown, Spin, Typography, Badge, Card, List, Tag, Divider, Popover, Select, message, Menu
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
import { courseService } from '../../services/apiService';
import './Header.css';
import socket from '../../services/socket';

// Debounce function to prevent excessive API calls
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Extend Window interface for cartContext
declare global {
  interface Window {
    cartContext?: {
      refreshCart?: () => void;
    };
  }
}

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const role = localStorage.getItem('role');


interface User {
  _id?: string;
  avatar?: string;
  fullname: string;
  email: string;
  role_id?: { name: string };
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
  const getRoleName = (user: User): string => {
    const roleName = user?.role_id?.name || 'student';
    console.log('Header - getRoleName:', roleName, 'for user:', user);
    return roleName;
  };

  // Debug function để kiểm tra role
  const debugUserRole = () => {
    if (user) {
      console.log('Current user:', user);
      console.log('User role:', getRoleName(user));
      console.log('Role check results:');
      console.log('- Is admin:', getRoleName(user) === 'admin' || getRoleName(user) === 'quản trị viên');
      console.log('- Is instructor:', getRoleName(user) === 'instructor' || getRoleName(user) === 'giảng viên');
      console.log('- Is moderator:', getRoleName(user) === 'moderator' || getRoleName(user) === 'kiểm duyệt viên');
      console.log('- Is student:', getRoleName(user) === 'student' || getRoleName(user) === 'học viên');
    }
  };
  const { cartCount, refreshCart } = useCart();
  
  // Create debounced version of refreshCart to prevent excessive API calls
  const debouncedRefreshCart = useRef(debounce(refreshCart, 1000)).current;

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

  // Fetch unread messages count (only once when user changes)
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
      // Refresh count every 2 minutes instead of 30 seconds to reduce API calls
      const interval = setInterval(fetchUnreadMessagesCount, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Lắng nghe sự kiện mua khóa học thành công để cập nhật cart count
  useEffect(() => {
    const handleCoursePurchase = (event: CustomEvent) => {
      console.log('Header: Course purchased, updating cart count');
      debouncedRefreshCart();
    };

    const handleOrderSuccess = (event: CustomEvent) => {
      console.log('Header: Order success, updating cart count');
      debouncedRefreshCart();
    };

    const handlePaymentSuccess = (event: CustomEvent) => {
      console.log('Header: Payment success, updating cart count');
      debouncedRefreshCart();
    };

    const handleCartUpdate = (event: CustomEvent) => {
      console.log('Header: Cart updated, refreshing cart count');
      debouncedRefreshCart();
    };

    const handleCartItemAdded = (event: CustomEvent) => {
      console.log('Header: Cart item added, updating cart count');
      debouncedRefreshCart();
    };

    const handleCartItemRemoved = (event: CustomEvent) => {
      console.log('Header: Cart item removed, updating cart count');
      debouncedRefreshCart();
    };

    // Lắng nghe các sự kiện từ localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart' || event.key === 'cartCount' || event.key === 'checkoutData') {
        console.log('Header: Cart storage changed, updating cart count');
        debouncedRefreshCart();
      }
    };

    // Lắng nghe các sự kiện custom
    window.addEventListener('course-purchased', handleCoursePurchase as EventListener);
    window.addEventListener('order-success', handleOrderSuccess as EventListener);
    window.addEventListener('payment-success', handlePaymentSuccess as EventListener);
    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    window.addEventListener('cart-item-added', handleCartItemAdded as EventListener);
    window.addEventListener('cart-item-removed', handleCartItemRemoved as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Lắng nghe sự kiện từ URL changes (khi quay về từ payment)
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromPayment = urlParams.get('fromPayment');
      const orderSuccess = urlParams.get('orderSuccess');
      
      if (fromPayment === 'true' || orderSuccess === 'true') {
        console.log('Header: URL indicates payment success, updating cart count');
        debouncedRefreshCart();
      }
    };

    // Kiểm tra URL khi component mount
    handleUrlChange();

    // Cập nhật giỏ hàng khi component mount và khi user thay đổi
    if (user) {
      debouncedRefreshCart();
    }

    return () => {
      window.removeEventListener('course-purchased', handleCoursePurchase as EventListener);
      window.removeEventListener('order-success', handleOrderSuccess as EventListener);
      window.removeEventListener('payment-success', handlePaymentSuccess as EventListener);
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
      window.removeEventListener('cart-item-added', handleCartItemAdded as EventListener);
      window.removeEventListener('cart-item-removed', handleCartItemRemoved as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [debouncedRefreshCart, user]);

  // Cập nhật giỏ hàng khi user quay lại tab
  useEffect(() => {
    const handleFocus = () => {
      console.log('Header: Window focused, updating cart count');
      if (user) {
        debouncedRefreshCart();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Header: Page became visible, updating cart count');
        debouncedRefreshCart();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [debouncedRefreshCart, user]);

  // Tự động cập nhật giỏ hàng định kỳ
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Header: Auto-refreshing cart count');
      debouncedRefreshCart();
    }, 120000); // Tăng từ 30 giây lên 2 phút để giảm API calls

    return () => clearInterval(interval);
  }, [debouncedRefreshCart, user]);

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
    console.log('handleLogout called'); // Debug log
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user); // Debug log
    if (user && user._id) {
      socket.connect();
      socket.emit('auth-event', { type: 'logout', userId: user._id });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(false);
    showLogoutSuccess();
    console.log('Logout completed'); // Debug log
  };

  const handleRegisterClick = () => {
    setAccountTypeModalVisible(true);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu clicked:', key); // Debug log
    if (user && typeof user === 'object') {
      console.log('User role:', getRoleName(user as User)); // Debug log
    }
    if (key === 'logout') {
      handleLogout();
      return;
    }
    // Đảm bảo key bắt đầu với / nếu không phải là logout
    const path = key.startsWith('/') ? key : `/${key}`;
    console.log('Navigating to:', path); // Debug log
    navigate(path);
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
          // Debug log khi user được set
          if (userData) {
            console.log('User set in Header:', userData);
            debugUserRole();
          }
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

    // Custom event listener để cập nhật user data khi có thay đổi từ ProfileEdit
    const handleUserUpdate = (event: CustomEvent) => {
      console.log('Header: Received user-updated event', event.detail);
      if (event.detail && event.detail.user) {
        setUser(event.detail.user);
      } else {
        fetchUser(); // Fallback: fetch lại từ localStorage
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-updated', handleUserUpdate as EventListener);
    fetchUser();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-updated', handleUserUpdate as EventListener);
    };
  }, []);

  // Thêm useEffect để lắng nghe thay đổi user data từ localStorage
  useEffect(() => {
    const checkUserUpdate = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (user && userData._id === (user as any)._id) {
            // Chỉ cập nhật nếu có thay đổi
            if (JSON.stringify(userData) !== JSON.stringify(user)) {
              console.log('Header: User data changed, updating...');
              setUser(userData);
            }
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    };

    // Kiểm tra thay đổi mỗi 1 giây
    const interval = setInterval(checkUserUpdate, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const userMenu = user
    ? {
      items: [
        {
          key: '/profile',
          label: (
            <motion.div 
              className="user-menu-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="user-menu-avatar-container">
                <Avatar
                  src={user.avatar && user.avatar !== 'default-avatar.jpg' ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=1677ff&color=fff`}
                  size={56}
                  className="user-menu-avatar"
                />
                <div className="user-menu-status-indicator" />
              </div>
              <div className="user-menu-info">
                <Text strong className="user-menu-name">{user.fullname}</Text>
                {user.nickname && (
                  <Text className="user-menu-nickname">@{user.nickname}</Text>
                )}
                <div className="user-menu-role-badge">
                  <Text className="user-menu-role-text">
                    {getRoleName(user) === 'admin' || getRoleName(user) === 'quản trị viên' ? 'Quản trị viên' :
                     getRoleName(user) === 'moderator' || getRoleName(user) === 'kiểm duyệt viên' ? 'Kiểm duyệt viên' :
                     getRoleName(user) === 'instructor' || getRoleName(user) === 'giảng viên' ? 'Giảng viên' : 'Học viên'}
                  </Text>
                </div>
                <Text className="user-menu-subtitle">Xem hồ sơ của bạn</Text>
              </div>
            </motion.div>
          ) as React.ReactNode,
          style: { 
            height: 'auto', 
            padding: '20px', 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px 16px 0 0',
            margin: '0',
            border: 'none'
          },
          onClick: () => {
            console.log('Profile clicked directly');
            navigate('/profile');
          }
        },
        { 
          type: 'divider' as const,
          style: { 
            margin: '0',
            borderColor: '#f0f0f0',
            borderWidth: '1px'
          }
        },
        ...(getRoleName(user) === 'admin' || getRoleName(user) === 'quản trị viên'
          ? [
            { 
              key: '/admin', 
              icon: <DashboardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Trang quản trị</span>
                  <span className="menu-item-description">Quản lý hệ thống</span>
                </div>
              ),
              style: { padding: '12px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Admin dashboard clicked directly');
                navigate('/admin');
              }
            },
            { type: 'divider' as const, style: { margin: '4px 0', borderColor: '#f0f0f0' } },
          ]
          : []),
        ...(getRoleName(user) === 'moderator' || getRoleName(user) === 'kiểm duyệt viên'
          ? [
            { 
              key: '/moderator', 
              icon: <DashboardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Khu vực kiểm duyệt</span>
                  <span className="menu-item-description">Duyệt nội dung</span>
                </div>
              ),
              style: { padding: '12px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Moderator dashboard clicked directly');
                navigate('/moderator');
              }
            },
            { type: 'divider' as const, style: { margin: '4px 0', borderColor: '#f0f0f0' } },
          ]
          : []),
        ...(getRoleName(user) === 'instructor' || getRoleName(user) === 'giảng viên'
          ? [
            { 
              key: '/instructor', 
              icon: <DashboardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Khu vực giảng viên</span>
                  <span className="menu-item-description">Quản lý khóa học</span>
                </div>
              ),
              style: { padding: '12px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Instructor dashboard clicked directly');
                navigate('/instructor');
              }
            },
            { type: 'divider' as const, style: { margin: '4px 0', borderColor: '#f0f0f0' } },
          ]
          : []),
        {
          type: 'group' as const,
          label: (
            <div className="menu-group-header">
              <BookOutlined style={{ fontSize: '16px', color: '#666' }} />
              <span>Blog cá nhân</span>
            </div>
          ),
          children: [
            { 
              key: '/blog/write', 
              icon: <EditOutlined style={{ fontSize: '16px', color: '#52c41a' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Viết blog</span>
                  <span className="menu-item-description">Tạo bài viết mới</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Write blog clicked directly');
                navigate('/blog/write');
              }
            },
            { 
              key: '/blog/mine', 
              icon: <ProfileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Bài viết của tôi</span>
                  <span className="menu-item-description">Quản lý bài viết</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('My blog posts clicked directly');
                navigate('/blog/mine');
              }
            },
            { 
              key: '/blog/saved', 
              icon: <BookOutlined style={{ fontSize: '16px', color: '#faad14' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Bài viết đã lưu</span>
                  <span className="menu-item-description">Xem bài viết đã lưu</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Saved blog posts clicked directly');
                navigate('/blog/saved');
              }
            },
          ],
        },
        {
          type: 'group' as const,
          label: (
            <div className="menu-group-header">
              <ShoppingCartOutlined style={{ fontSize: '16px', color: '#666' }} />
              <span>Đơn hàng</span>
            </div>
          ),
          children: [
            { 
              key: '/orders', 
              icon: <ShoppingCartOutlined style={{ fontSize: '16px', color: '#722ed1' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Đơn hàng</span>
                  <span className="menu-item-description">Xem lịch sử mua hàng</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Orders clicked directly');
                navigate('/orders');
              }
            }
          ],
        },
        {
          type: 'group' as const,
          label: (
            <div className="menu-group-header">
              <BarChartOutlined style={{ fontSize: '16px', color: '#666' }} />
              <span>Báo cáo</span>
            </div>
          ),
          children: [
            { 
              key: '/report', 
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#13c2c2' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Báo cáo</span>
                  <span className="menu-item-description">Xem thống kê học tập</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Report clicked directly');
                navigate('/report');
              }
            }
          ],
        },
        ...(getRoleName(user) === 'student' || getRoleName(user) === 'học viên' ? [{
          type: 'group' as const,
          label: (
            <div className="menu-group-header">
              <WalletOutlined style={{ fontSize: '16px', color: '#666' }} />
              <span>Ví</span>
            </div>
          ),
          children: [
            { 
              key: '/wallet', 
              icon: <WalletOutlined style={{ fontSize: '16px', color: '#52c41a' }} />, 
              label: (
                <div className="menu-item-content">
                  <span className="menu-item-label">Ví của tôi</span>
                  <span className="menu-item-description">Quản lý tài khoản</span>
                </div>
              ),
              style: { padding: '10px 16px', cursor: 'pointer' },
              onClick: () => {
                console.log('Wallet clicked directly');
                navigate('/wallet');
              }
            }
          ],
        }] : []),
        { 
          type: 'divider' as const,
          style: { 
            margin: '8px 0',
            borderColor: '#f0f0f0',
            borderWidth: '1px'
          }
        },
        { 
          key: 'logout', 
          icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />, 
          label: (
            <div className="menu-item-content">
              <span className="menu-item-label logout-text">Đăng xuất</span>
              <span className="menu-item-description">Thoát khỏi tài khoản</span>
            </div>
          ),
          style: { 
            padding: '12px 16px',
            background: 'rgba(255, 77, 79, 0.05)',
            borderRadius: '8px',
            margin: '0 8px 8px 8px',
            cursor: 'pointer'
          },
          onClick: () => {
            console.log('Logout clicked directly');
            handleLogout();
          }
        },
      ].filter((item, idx, arr) => {
        if (item.type === 'divider' && idx > 0 && arr[idx - 1].type === 'divider') return false;
        if (item.type === 'divider' && (idx === 0 || idx === arr.length - 1)) return false;
        return true;
      }),
      onClick: handleMenuClick,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid #f0f0f0',
        overflow: 'hidden'
      }
    } as any
    : undefined;

  // Debug log để kiểm tra userMenu
  console.log('userMenu created:', userMenu);
  console.log('userMenu onClick:', userMenu?.onClick);

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

                <Popover
                  content={
                    <div style={{ 
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      background: 'white',
                      minWidth: '320px',
                      maxWidth: '380px'
                    }}>
                      {userMenu?.items?.map((item: any, index: number) => {
                        if (item.type === 'divider') {
                          return <Divider key={index} style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />;
                        }
                        if (item.type === 'group') {
                          return (
                            <div key={index}>
                              <div style={{ 
                                padding: '12px 20px 8px 20px', 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                color: '#8c8c8c',
                                background: '#fafafa',
                                borderBottom: '1px solid #f0f0f0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {item.label?.props?.children?.[1] || item.label}
                              </div>
                              {item.children?.map((child: any, childIndex: number) => (
                                <div
                                  key={childIndex}
                                  onClick={child.onClick}
                                  style={{
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderBottom: '1px solid #fafafa'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                  }}
                                >
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px'
                                  }}>
                                    {child.icon}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ 
                                      fontWeight: '500', 
                                      color: '#262626',
                                      fontSize: '14px',
                                      lineHeight: '1.4'
                                    }}>
                                      {child.label?.props?.children?.[0]?.props?.children || child.label}
                                    </div>
                                    {child.label?.props?.children?.[1]?.props?.children && (
                                      <div style={{ 
                                        fontSize: '12px', 
                                        color: '#8c8c8c',
                                        marginTop: '2px',
                                        lineHeight: '1.3'
                                      }}>
                                        {child.label.props.children[1].props.children}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        // Special handling for profile header
                        if (item.key === '/profile') {
                          return (
                            <div 
                              key={index} 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Profile header clicked!');
                                navigate('/profile');
                              }}
                              style={{ 
                                ...item.style,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                zIndex: 1
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                              }}
                            >
                              {item.label}
                            </div>
                          );
                        }
                        // Regular menu items
                        return (
                          <div
                            key={index}
                            onClick={item.onClick}
                            style={{
                              padding: '12px 20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              borderBottom: '1px solid #fafafa'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px'
                            }}>
                              {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: '500', 
                                color: item.key === 'logout' ? '#ff4d4f' : '#262626',
                                fontSize: '14px',
                                lineHeight: '1.4'
                              }}>
                                {item.label?.props?.children?.[0]?.props?.children || item.label}
                              </div>
                              {item.label?.props?.children?.[1]?.props?.children && (
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#8c8c8c',
                                  marginTop: '2px',
                                  lineHeight: '1.3'
                                }}>
                                  {item.label.props.children[1].props.children}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  }
                  trigger="click"
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                  overlayStyle={{ 
                    paddingTop: '8px'
                  }}
                >
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
                </Popover>
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
        type={notification.type as any}
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
