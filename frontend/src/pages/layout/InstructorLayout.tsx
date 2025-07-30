// src/layouts/InstructorLayout.tsx
import {
  UserOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  PlusCircleOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  CommentOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  FormOutlined,
  WalletOutlined,
  MessageOutlined,
  ReloadOutlined,
  GiftOutlined,
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
} from "antd";
import type { MenuProps } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../styles/InstructorLayout.module.css";
import { config } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: {
    name: string;
    description?: string;
    permissions?: string[];
  };
  role_id?: {
    name: string;
  };
  approval_status?: string;
}

const getRoleName = (user: User | null): string => {
  return user?.role?.name || user?.role_id?.name || '';
};

const checkRole = (user: User | null, requiredRole: string): boolean => {
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

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user: authUser, isAuthenticated, forceReloadUser } = useAuth();

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

  // --- Role Check ---
  useEffect(() => {
    console.log('InstructorLayout - isAuthenticated:', isAuthenticated);
    console.log('InstructorLayout - authUser:', authUser);
    if (isAuthenticated && authUser) {
      const hasRole = checkRole(authUser, 'instructor') || checkRole(authUser, 'admin');
      console.log('InstructorLayout - hasRole:', hasRole);
      if (!hasRole) {
        message.error('Bạn không có quyền truy cập trang giảng viên');
        navigate('/');
      }
    }
  }, [authUser, isAuthenticated, navigate]);

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

  // --- Menu Items ---
  const menuItems: MenuProps["items"] = useMemo(
    () => {
      console.log('InstructorLayout - Rendering menu items');
      console.log('InstructorLayout - authUser:', authUser);
      console.log('InstructorLayout - permissions:', authUser?.role_id?.permissions);
      
             const permissions = authUser?.role_id?.permissions || [];
       console.log('InstructorLayout - All permissions:', permissions);
       console.log('InstructorLayout - Permissions length:', permissions.length);
      
             // Import permission check functions
       const canAccessRoute = (permission: string) => {
         // Admin có toàn quyền
         if (authUser?.role_id?.name === 'admin' || authUser?.role_id?.name === 'quản trị viên') {
           return true;
         }
         const hasPermission = permissions.includes(permission);
         console.log(`InstructorLayout - canAccessRoute(${permission}): ${hasPermission}`);
         return hasPermission;
       };
      
             // Debug logs cho từng menu item
       const coursesMenu = canAccessRoute('tạo khóa học') || canAccessRoute('chỉnh sửa khóa học') || canAccessRoute('xuất bản khóa học');
       const createCourseMenu = canAccessRoute('tạo khóa học');
       const lessonsMenu = canAccessRoute('tạo bài học') || canAccessRoute('chỉnh sửa bài học') || canAccessRoute('xóa bài học');
       const videosMenu = canAccessRoute('upload video');
       const quizMenu = canAccessRoute('tạo quiz') || canAccessRoute('chỉnh sửa quiz');
       const studentsMenu = canAccessRoute('xem danh sách học viên') || canAccessRoute('xem tiến độ học viên');
       const communicationMenu = canAccessRoute('gửi thông báo');
       const financeMenu = canAccessRoute('xem thống kê thu nhập') || canAccessRoute('rút tiền') || canAccessRoute('xem lịch sử giao dịch');
       const userManagementMenu = canAccessRoute('phân quyền người dùng');
       const voucherMenu = canAccessRoute('quản lý voucher');
       
       console.log('InstructorLayout - Menu visibility:');
       console.log('- Courses menu:', coursesMenu);
       console.log('- Create course menu:', createCourseMenu);
       console.log('- Lessons menu:', lessonsMenu);
       console.log('- Videos menu:', videosMenu);
       console.log('- Quiz menu:', quizMenu);
       console.log('- Students menu:', studentsMenu);
       console.log('- Communication menu:', communicationMenu);
       console.log('- Finance menu:', financeMenu);
       console.log('- User Management menu:', userManagementMenu);
       console.log('- Voucher menu:', voucherMenu);
       
       return [
         {
           key: "/instructor",
           icon: <DashboardOutlined />,
           label: collapsed ? "TQ" : "Tổng quan",
         },
                 {
           label: collapsed ? "KH" : "KHÓA HỌC",
           type: "group",
           children: [
             // Chỉ hiển thị nếu có quyền tạo khóa học hoặc chỉnh sửa khóa học hoặc xuất bản khóa học
             ...(coursesMenu ? [
               { key: "/instructor/courses", icon: <BookOutlined />, label: collapsed ? "DS" : "Khóa học của tôi" }
             ] : []),
             // Chỉ hiển thị nếu có quyền tạo khóa học
             ...(createCourseMenu ? [
               { key: "/instructor/courses/create", icon: <PlusCircleOutlined />, label: collapsed ? "TK" : "Tạo khóa học mới" }
             ] : []),
           ].filter(Boolean),
         },
                 {
           label: collapsed ? "ND" : "QUẢN LÝ NỘI DUNG",
           type: "group",
           children: [
             // Chỉ hiển thị nếu có quyền tạo bài học hoặc chỉnh sửa bài học hoặc xóa bài học
             ...(lessonsMenu ? [
               { key: "/instructor/lessons", icon: <VideoCameraOutlined />, label: collapsed ? "BH" : "Quản lý bài học" }
             ] : []),
             // Chỉ hiển thị nếu có quyền upload video
             ...(videosMenu ? [
               { key: "/instructor/videos", icon: <PlayCircleOutlined />, label: collapsed ? "VD" : "Quản lý video" }
             ] : []),
             // Chỉ hiển thị nếu có quyền tạo quiz hoặc chỉnh sửa quiz
             ...(quizMenu ? [
               { key: "/instructor/quiz", icon: <FormOutlined />, label: collapsed ? "QZ" : "Quản lý quiz" }
             ] : []),
           ].filter(Boolean),
         },
                 {
           label: collapsed ? "HV" : "HỌC VIÊN",
           type: "group",
           children: [
             // Chỉ hiển thị nếu có quyền xem danh sách học viên hoặc xem tiến độ học viên
             ...(studentsMenu ? [
               { key: "/instructor/students", icon: <TeamOutlined />, label: collapsed ? "TK" : "Thống kê học viên" }
             ] : []),
             // Chỉ hiển thị nếu có quyền gửi thông báo
             ...(communicationMenu ? [
               { key: "/instructor/community", icon: <MessageOutlined />, label: collapsed ? "GT" : "Giao tiếp học viên" }
             ] : []),
             // Chỉ hiển thị nếu có quyền phân quyền người dùng
             ...(userManagementMenu ? [
               { key: "/instructor/user-management", icon: <UserOutlined />, label: collapsed ? "PQ" : "Phân quyền người dùng" }
             ] : []),
           ].filter(Boolean),
         },
                 {
           label: collapsed ? "TC" : "TÀI CHÍNH",
           type: "group",
           children: [
             // Chỉ hiển thị nếu có quyền xem thống kê thu nhập hoặc rút tiền hoặc xem lịch sử giao dịch
             ...(financeMenu ? [
               { key: "/instructor/income", icon: <WalletOutlined />, label: collapsed ? "TN" : "Thu nhập & giao dịch" }
             ] : []),
             // Chỉ hiển thị nếu có quyền quản lý voucher
             ...(voucherMenu ? [
               { key: "/instructor/vouchers", icon: <GiftOutlined />, label: collapsed ? "VG" : "Quản lý voucher" }
             ] : []),
           ].filter(Boolean),
         },
             ].filter(item => {
         if (item.children) {
           const shouldShow = item.children.length > 0;
           console.log(`InstructorLayout - Menu group "${item.label}": ${shouldShow ? 'SHOW' : 'HIDE'} (${item.children.length} children)`);
           return shouldShow;
         }
         return true;
       });
    },
    [collapsed, authUser]
  );

  // --- Breadcrumb ---
  const breadcrumbNameMap: { [key: string]: string } = {
    '/instructor': 'Tổng quan',
    '/instructor/courses': 'Khóa học của tôi',
    '/instructor/courses/create': 'Tạo khóa học mới',
    '/instructor/lessons': 'Quản lý bài học',
    '/instructor/videos': 'Quản lý video',
    '/instructor/quiz': 'Quản lý quiz',
    '/instructor/students': 'Thống kê học viên',
    '/instructor/income': 'Thu nhập & giao dịch',
    '/instructor/community': 'Giao tiếp học viên',
    '/instructor/vouchers': 'Quản lý voucher',
  };

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || url.split('/').pop()}</Link>,
    };
  });

  const finalBreadcrumbItems = [
    { key: 'home', title: <Link to="/instructor"><HomeOutlined /></Link> },
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
      key: "reload",
      icon: <ReloadOutlined />,
      label: "Reload User Data",
      onClick: async () => {
        try {
          await forceReloadUser();
          message.success('Đã reload user data!');
        } catch (error) {
          message.error('Không thể reload user data');
        }
      },
    },
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Quay lại trang chủ",
      onClick: () => navigate("/"),
    },
    {
      type: 'divider',
    },
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

  // Check if user has instructor role
  if (!authUser || (!checkRole(authUser, 'instructor') && !checkRole(authUser, 'admin'))) {
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
    <Layout className={styles.instructorLayout}>
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
              <div className={styles.logoIcon}>👨‍🏫</div>
              <div className={styles.logoTextContainer}>
                <span className={styles.logoText}>Instructor</span>
                <span className={styles.logoSubtitle}>Teaching Panel</span>
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
              👨‍🏫
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
                src={authUser.avatar} 
                size="small" 
                className={styles.userAvatar}
              >
                {authUser.fullname.charAt(0).toUpperCase()}
              </Avatar>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{authUser.fullname}</div>
                <div className={styles.userRole}>Giảng viên</div>
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
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()} className={styles.profileDropdown}>
                <Avatar 
                  src={authUser.avatar} 
                  size="small" 
                  className={styles.headerAvatar}
                >
                  {authUser.fullname.charAt(0).toUpperCase()}
                </Avatar>
                {!collapsed && (
                  <span className={styles.headerUserName}>{authUser.fullname}</span>
                )}
              </a>
            </Dropdown>
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

export default InstructorLayout;
