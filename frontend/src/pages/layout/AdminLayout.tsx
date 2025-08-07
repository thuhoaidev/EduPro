import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  FileSearchOutlined,
  TagsOutlined,
  HistoryOutlined,
  BarChartOutlined,
  WarningOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  BookOutlined,
  GiftOutlined,
  DollarCircleOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
  LogoutOutlined,
  KeyOutlined,
  SettingOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Breadcrumb,
  message,
  Avatar,
  Badge,
  Tooltip,
  Button,
  Divider,
  Popover,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../styles/AdminLayout.module.css";
import { config } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  canAccessRoute,
  getUserRoleDisplayName,
  PERMISSIONS,
} from "../../utils/permissionUtils";
import type { User } from "../../utils/permissionUtils";
import { debugUserData } from "../../utils/debugUserData";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;

// User interface and role checking functions are now imported from permissionUtils

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user: authUser, isAuthenticated } = useAuth();
  const { canAccessRoute: canAccessRouteHook } = usePermissions();

  // --- Check Authentication ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isAuthenticated) {
      // Nếu chưa authenticated, đợi AuthContext load xong
      return;
    }
    if (!authUser) {
      // Nếu đã authenticated nhưng không có user, có thể token lỗi
      navigate('/login');
    }
  }, [isAuthenticated, authUser, navigate]);

  // --- Permission Check ---
  useEffect(() => {
    console.log('AdminLayout - Permission Check:', {
      isAuthenticated: isAuthenticated,
      authUser: authUser,
      roleName: authUser?.role_id?.name
    });
    
    if (isAuthenticated && authUser) {
      const hasPermission = hasAnyRole(authUser, ["admin", "instructor", "quản trị viên", "giảng viên"]);
      console.log('AdminLayout - hasPermission:', hasPermission);
      
      if (!hasPermission) {
        console.log('AdminLayout - Permission denied!');
        message.error("Bạn không có quyền truy cập trang quản trị");
        navigate("/");
      }
    }
  }, [authUser, isAuthenticated, navigate]);

  // --- Route Permission Check ---
  useEffect(() => {
    if (isAuthenticated && authUser && location.pathname !== '/admin') {
      const currentRoute = location.pathname;
      const roleName = authUser?.role_id?.name;
      
      // Admin luôn có quyền truy cập tất cả routes
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        return;
      }
      
      if (!canAccessRoute(authUser, currentRoute)) {
        message.error("Bạn không có quyền truy cập trang này");
        navigate("/admin");
      }
    }
  }, [authUser, isAuthenticated, location.pathname, navigate]);

  // --- Menu Items with Permission Filtering ---
  const menuItems: MenuProps["items"] = useMemo(
    () => {
      const allMenuItems = [
        {
          key: "/admin",
          icon: <DashboardOutlined />,
          label: collapsed ? "TQ" : "Tổng quan",
        },
        {
          label: collapsed ? "ND" : "QUẢN LÝ NỘI DUNG",
          type: "group",
          children: [
            { key: "/admin/categories", icon: <TagsOutlined />, label: collapsed ? "DM" : "Danh mục khóa học" },
            { key: "/admin/courses", icon: <BookOutlined />, label: collapsed ? "KH" : "Khóa học" },
          ],
        },
        {
          label: collapsed ? "ND" : "QUẢN LÝ NGƯỜI DÙNG",
          type: "group",
          children: [
            { key: "/admin/users", icon: <UserOutlined />, label: collapsed ? "HV" : "Học viên" },
            { key: "/admin/instructors", icon: <TeamOutlined />, label: collapsed ? "GV" : "Giảng viên" },
            { key: "/admin/roles", icon: <KeyOutlined />, label: collapsed ? "PQ" : "Phân quyền" },
          ],
        },
        {
          label: collapsed ? "TC" : "TÀI CHÍNH",
          type: "group",
          children: [
            { key: "/admin/transactions", icon: <CreditCardOutlined />, label: collapsed ? "GD" : "Giao dịch" },
            { key: "/admin/vouchers", icon: <GiftOutlined />, label: collapsed ? "MGG" : "Mã giảm giá" },
            { key: "/admin/earnings", icon: <DollarCircleOutlined />, label: collapsed ? "TN" : "Thu nhập" },
            { key: "/admin/user-withdraw-requests", icon: <WalletOutlined />, label: collapsed ? "RT" : "Rút tiền" },
          ],
        },
        {
          label: collapsed ? "TK" : "THỐNG KÊ & BÁO CÁO",
          type: "group",
          children: [
            { key: "/admin/statistics", icon: <BarChartOutlined />, label: collapsed ? "TK" : "Thống kê" },
            { key: "/admin/reports", icon: <WarningOutlined />, label: collapsed ? "BC" : "Báo cáo & khiếu nại" },
          ],
        },
        {
          label: collapsed ? "BM" : "BẢO MẬT",
          type: "group",
          children: [
            { key: "/admin/device-violations", icon: <SecurityScanOutlined />, label: collapsed ? "TB" : "Vi phạm thiết bị" },
          ],
        },
      ];

      // Chỉ sử dụng user từ context
      console.log('Current user being used:', authUser);
      console.log('Current user.role_id:', authUser?.role_id);
      // Lấy roleName đúng từ authUser
      const roleName = authUser?.role_id?.name;
      console.log('Role name:', roleName);

      // Nếu là admin thì show full menu
      if (roleName === 'admin' || roleName === 'quản trị viên') {
        console.log('Admin detected - showing all menu items');
        console.log('All menu items:', allMenuItems);
        return allMenuItems;
      }

      // Nếu không phải admin, filter theo quyền
      return allMenuItems.filter(item => {
        if (item.children) {
          const filteredChildren = item.children.filter((child: any) => {
            if (child.key) {
              // Với admin, luôn cho phép
              if (roleName === 'admin' || roleName === 'quản trị viên') {
                return true;
              }
              return canAccessRouteHook(child.key);
            }
            return true;
          });
          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren,
            };
          }
          return false;
        }
        if (item.key) {
          // Với admin, luôn cho phép
          if (roleName === 'admin' || roleName === 'quản trị viên') {
            return true;
          }
          const canAccess = canAccessRouteHook(item.key);
          console.log(`Route ${item.key}: ${canAccess}`);
          return canAccess;
        }
        return true;
      }).filter(Boolean);
    },
    [collapsed, authUser]
  );

  // --- Breadcrumb ---
  const breadcrumbNameMap: { [key: string]: string } = {
    '/admin': 'Tổng quan',
    '/admin/users': 'Quản lý học viên',
    '/admin/instructors': 'Quản lý giảng viên',
    '/admin/categories': 'Quản lý danh mục',
    '/admin/courses': 'Quản lý khóa học',
    '/admin/content-approval': 'Duyệt nội dung',
    '/admin/roles': 'Quản lý phân quyền',
    '/admin/transactions': 'Quản lý giao dịch',
    '/admin/vouchers': 'Quản lý mã giảm giá',
    '/admin/earnings': 'Thu nhập giảng viên',
    '/admin/user-withdraw-requests': 'Rút tiền học viên',
    '/admin/statistics': 'Thống kê tổng quan',
    '/admin/reports': 'Báo cáo & khiếu nại',
    '/admin/device-violations': 'Vi phạm thiết bị',
  };

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    let title = breadcrumbNameMap[url] || url.split('/').pop();
    // Xử lý trường hợp trang chi tiết vai trò
    if (url.includes('/admin/roles/') && url !== '/admin/roles') {
      title = 'Chi tiết vai trò';
    }
    return {
      key: url,
      title: <Link to={url}>{title}</Link>,
    };
  });

  const finalBreadcrumbItems = [
    { key: 'home', title: <Link to="/admin"><HomeOutlined /></Link> },
    ...breadcrumbItems,
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Đã đăng xuất!');
    navigate('/login');
  };

  // --- Dropdown Menu ---
  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  // --- Render ---
  if (!isAuthenticated && localStorage.getItem('token')) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Đang tải...</div>
        </div>
      </div>
    );
  }

  // Kiểm tra quyền truy cập
  const hasAccess = authUser && hasAnyRole(authUser, ["admin", "instructor", "quản trị viên", "giảng viên"]);
  console.log('AdminLayout - Final check:', {
    authUser: authUser,
    hasAccess: hasAccess,
    roleName: authUser?.role_id?.name
  });
  
  if (!hasAccess) {
    console.log('AdminLayout - Access denied!');
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.loadingText}>Bạn không có quyền truy cập</div>
        </div>
      </div>
    );
  }

  return (
    <Layout className={styles.adminLayout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className={styles.sider}
        theme="light"
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 1000 }}
      >
        <motion.div
          layout
          className={`${styles.logoArea} ${collapsed ? styles.collapsed : ""}`}
        >
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={styles.logoContainer}
            >
              <div className={styles.logoIcon}>🎓</div>
              <div className={styles.logoTextContainer}>
                <span className={styles.logoText}>EduPro</span>
                <span className={styles.logoSubtitle}>Admin Panel</span>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className={styles.logoIconCollapsed}
            >
              🎓
            </motion.div>
          )}
        </motion.div>
        
        <div className={styles.menuContainer}>
          <Menu
            mode="inline"
            theme="light"
            className={styles.menu}
            items={menuItems}
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            expandIcon={({ isOpen }) => (
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▶
              </motion.div>
            )}
          />
        </div>
        
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={styles.siderFooter}
          >
            <Divider style={{ margin: '8px 0' }} />
            <div className={styles.userInfo}>
              <Avatar 
                src={authUser?.avatar} 
                size="small" 
                className={styles.userAvatar}
              >
                {authUser?.fullname?.charAt(0).toUpperCase()}
              </Avatar>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{authUser?.fullname}</div>
                <div className={styles.userRole}>
                  {getUserRoleDisplayName(authUser)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Sider>
      
      <Layout className={styles.siteLayout} style={{ marginLeft: collapsed ? 80 : 280, transition: 'margin-left 0.2s' }}>
        <Header className={styles.header} style={{ position: 'sticky', top: 0, zIndex: 999 }}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.toggleButton}
            />
            <Breadcrumb items={finalBreadcrumbItems} className={styles.breadcrumb} />
          </div>
          
          <div className={styles.headerRight}>
            <Popover
              content={
                <Menu items={userMenuItems} onClick={({ key }) => {
                  if (key === 'home') {
                    navigate('/admin');
                  } else if (key === 'logout') {
                    handleLogout();
                  }
                }} />
              }
              trigger="click"
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()} className={styles.profileDropdown}>
                <Avatar 
                  src={authUser?.avatar} 
                  size="small" 
                  className={styles.headerAvatar}
                >
                  {authUser?.fullname?.charAt(0).toUpperCase()}
                </Avatar>
                {!collapsed && (
                  <span className={styles.headerUserName}>{authUser?.fullname}</span>
                )}
              </a>
            </Popover>
          </div>
        </Header>
        
        <Content className={styles.content} style={{ overflowY: 'auto', height: 'calc(100vh - 72px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={styles.pageContainer}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;