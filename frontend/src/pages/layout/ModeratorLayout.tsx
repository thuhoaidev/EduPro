import {
  HomeOutlined,
  FileSearchOutlined,
  CommentOutlined,
  WarningOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  DashboardOutlined,
  EyeOutlined,
  MessageOutlined,
  FlagOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Breadcrumb,
  message,
  Avatar,
  Button,
  Divider,
  Popover,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import styles from "../../styles/ModeratorLayout.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

const { Header, Sider, Content } = Layout;

// Simple interface for moderator layout
interface ModeratorUser {
  avatar?: string;
  fullname?: string;
  name?: string;
  email: string;
  role_id?: {
    _id: string;
    name: string;
    description?: string;
    permissions?: string[];
  };
  approval_status?: string;
}

const getRoleName = (user: ModeratorUser): string => {
  if (!user) {
    return 'user';
  }

  // Kiểm tra approval_status để xác định role
  if (user.approval_status === 'approved') {
    if (user.email === 'admin@pro.edu.vn') {
      return 'admin';
    }
    if (user.email === 'nguoikiemduyet@pro.edu.vn') {
      return 'moderator';
    }
    if (user.email.endsWith('@pro.edu.vn')) {
      return 'instructor';
    }
  }
  
  return 'user';
};

const checkRole = (user: ModeratorUser, requiredRole: string): boolean => {
  if (!user) return false;
  
  // Lấy role name từ user
  let roleName = '';
  if (typeof user.role_id === 'string') {
    roleName = user.role_id;
  } else if (user.role_id && user.role_id.name) {
    roleName = user.role_id.name;
  } else {
    roleName = getRoleName(user);
  }
  
  // Kiểm tra role với mapping
  const roleMapping: { [key: string]: string[] } = {
    'moderator': ['moderator', 'kiểm duyệt viên'],
    'admin': ['admin', 'quản trị viên'],
    'instructor': ['instructor', 'giảng viên'],
    'student': ['student', 'học viên'],
  };
  
  const allowedRoles = roleMapping[requiredRole] || [requiredRole];
  return allowedRoles.includes(roleName);
};

const ModeratorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { user: authUser, isAuthenticated, forceReloadUser } = useAuth();
  const { hasPermission, user } = usePermissions();

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

  // --- Auto reload user data when component mounts (only once) ---
  useEffect(() => {
    if (isAuthenticated && authUser) {
      // Force reload user data to get latest permissions (only on mount)
      const timer = setTimeout(() => {
        forceReloadUser();
      }, 1000); // Delay 1 second to avoid infinite loop
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only run once on mount

  // --- Role Check ---
  useEffect(() => {
    console.log('ModeratorLayout - isAuthenticated:', isAuthenticated);
    console.log('ModeratorLayout - authUser:', authUser);
    if (isAuthenticated && authUser) {
      const hasRole = checkRole(authUser, 'moderator') || checkRole(authUser, 'admin');
      console.log('ModeratorLayout - hasRole:', hasRole);
      if (!hasRole) {
        message.error('Bạn không có quyền truy cập trang kiểm duyệt');
        navigate('/');
      }
    }
  }, [authUser, isAuthenticated, navigate]);

  // --- Monitor permissions changes for dynamic sidebar update ---
  useEffect(() => {
    if ((authUser?.role_id as any)?.permissions) {
      console.log('ModeratorLayout - Permissions changed:', (authUser?.role_id as any)?.permissions);
      console.log('ModeratorLayout - Sidebar will re-render with new permissions');
      // Force re-render by updating forceUpdate
      setForceUpdate(prev => prev + 1);
    }
  }, [(authUser?.role_id as any)?.permissions]);

  // --- Menu Items ---
  const menuItems: MenuProps["items"] = useMemo(
    () => {
      console.log('ModeratorLayout - Rendering menu items');
      console.log('ModeratorLayout - authUser:', authUser);
      console.log('ModeratorLayout - permissions:', (authUser?.role_id as any)?.permissions);
      console.log('ModeratorLayout - forceUpdate value:', forceUpdate);
      
      console.log('ModeratorLayout - User role:', authUser?.role_id?.name);
      
      // Import permission check functions
      const canAccessRoute = (permission: string) => {
        // Admin có toàn quyền
        if (authUser?.role_id?.name === 'admin' || authUser?.role_id?.name === 'quản trị viên') {
          return true;
        }
        // Sử dụng hook usePermissions để kiểm tra quyền
        const hasPermissionResult = hasPermission(permission);
        console.log(`ModeratorLayout - canAccessRoute(${permission}): ${hasPermissionResult}`);
        return hasPermissionResult;
      };
      
      // Tạo menu items dựa trên permissions
      const allMenuItems = [
        {
          key: "/moderator",
          icon: <DashboardOutlined />,
          label: collapsed ? "TQ" : "Bảng điều khiển",
        },
        {
          label: collapsed ? "KD" : "KIỂM DUYỆT NỘI DUNG",
          type: "group" as const,
          children: [
            // Chỉ hiển thị nếu có quyền duyệt bài viết
            ...(canAccessRoute('duyệt bài viết') ? [
              { key: "/moderator/blogs", icon: <FileSearchOutlined />, label: collapsed ? "BL" : "Duyệt Blog" }
            ] : []),
                         // Chỉ hiển thị nếu có quyền duyệt khóa học
             ...(canAccessRoute('approve_courses') ? [
               { key: "/moderator/courses", icon: <BookOutlined />, label: collapsed ? "KH" : "Duyệt Khóa học" }
             ] : []),
            // Chỉ hiển thị nếu có quyền duyệt bình luận
            ...(canAccessRoute('duyệt bình luận') ? [
              { key: "/moderator/comments", icon: <CommentOutlined />, label: collapsed ? "BL" : "Danh sách Bình luận" }
            ] : []),
            // Chỉ hiển thị nếu có quyền xử lý báo cáo
            ...(canAccessRoute('xử lý báo cáo') ? [
              { key: "/moderator/reports", icon: <WarningOutlined />, label: collapsed ? "BC" : "Báo cáo vi phạm" }
            ] : []),
          ].filter(Boolean),
        },
        {
          label: collapsed ? "TK" : "THỐNG KÊ",
          type: "group" as const,
          children: [
            // Chỉ hiển thị nếu có quyền xem thống kê báo cáo
            ...(canAccessRoute('xem thống kê báo cáo') ? [
              { key: "/moderator/statistics", icon: <BarChartOutlined />, label: collapsed ? "TK" : "Thống kê báo cáo" }
            ] : []),
          ].filter(Boolean),
        },
      ];
      
      // Lọc bỏ các group không có children
      const filteredMenuItems = allMenuItems.filter(item => {
        if (item.children) {
          return item.children.length > 0;
        }
        return true;
      });
      
             console.log('ModeratorLayout - Final menu items:', filteredMenuItems);
       return filteredMenuItems;
    },
         [collapsed, authUser, forceUpdate]
  );

  // --- Breadcrumb ---
  const breadcrumbNameMap: { [key: string]: string } = {
    '/moderator': 'Bảng điều khiển',
    '/moderator/blogs': 'Duyệt Blog',
    '/moderator/courses': 'Duyệt Khóa học',
    '/moderator/comments': 'Danh sách Bình luận',
    '/moderator/reports': 'Báo cáo vi phạm',
    '/moderator/statistics': 'Thống kê báo cáo',
  };

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    let title = breadcrumbNameMap[url] || url.split('/').pop();
    
    return {
      key: url,
      title: <Link to={url}>{title}</Link>,
    };
  });

  const finalBreadcrumbItems = [
    { key: 'home', title: <Link to="/moderator"><HomeOutlined /></Link> },
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

  // Show loading while AuthContext is initializing
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

  // Check if user has moderator role
  if (!authUser || (!checkRole(authUser, 'moderator') && !checkRole(authUser, 'admin'))) {
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
    <Layout className={styles.moderatorLayout}>
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
              <div className={styles.logoIcon}>🛡️</div>
              <div className={styles.logoTextContainer}>
                <span className={styles.logoText}>Moderator</span>
                <span className={styles.logoSubtitle}>Content Panel</span>
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
              🛡️
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
                src={(authUser as any)?.avatar} 
                size="small" 
                className={styles.userAvatar}
              >
                {(authUser as any)?.fullname?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{(authUser as any)?.fullname || 'User'}</div>
                <div className={styles.userRole}>Kiểm duyệt viên</div>
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
                    navigate('/');
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
                  src={(authUser as any)?.avatar} 
                  size="small" 
                  className={styles.headerAvatar}
                >
                  {(authUser as any)?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                {!collapsed && (
                  <span className={styles.headerUserName}>{(authUser as any)?.fullname || 'User'}</span>
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

export default ModeratorLayout;
