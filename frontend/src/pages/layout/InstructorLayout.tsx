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
  return getRoleName(user) === requiredRole;
};

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch User Data (FIXED) ---
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && typeof userData.role_id === 'string') {
          userData.role_id = { name: userData.role_id };
        }
        setUser(userData);
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await config.get('/auth/me');
        const userData = response.data;
        if (userData && typeof userData.role_id === 'string') {
          userData.role_id = { name: userData.role_id };
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // --- Role Check ---
  useEffect(() => {
    if (!loading && !checkRole(user, "instructor") && !checkRole(user, "admin")) {
      message.error("Bạn không có quyền truy cập trang giảng viên");
      navigate("/");
    }
  }, [user, loading, navigate]);

  // --- Menu Items ---
  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "/instructor",
        icon: <DashboardOutlined />,
        label: collapsed ? "TQ" : "Tổng quan",
      },
      {
        label: collapsed ? "KH" : "KHÓA HỌC",
        type: "group",
        children: [
          { key: "/instructor/courses", icon: <BookOutlined />, label: collapsed ? "DS" : "Khóa học của tôi" },
          { key: "/instructor/courses/create", icon: <PlusCircleOutlined />, label: collapsed ? "TK" : "Tạo khóa học mới" },
        ],
      },
      {
        label: collapsed ? "ND" : "QUẢN LÝ NỘI DUNG",
        type: "group",
        children: [
          { key: "/instructor/lessons", icon: <VideoCameraOutlined />, label: collapsed ? "BH" : "Quản lý bài học" },
          { key: "/instructor/videos", icon: <PlayCircleOutlined />, label: collapsed ? "VD" : "Quản lý video" },
          { key: "/instructor/quiz", icon: <FormOutlined />, label: collapsed ? "QZ" : "Quản lý quiz" },
        ],
      },
      {
        label: collapsed ? "HV" : "HỌC VIÊN",
        type: "group",
        children: [
          { key: "/instructor/students", icon: <TeamOutlined />, label: collapsed ? "TK" : "Thống kê học viên" },
          { key: "/instructor/community", icon: <MessageOutlined />, label: collapsed ? "GT" : "Giao tiếp học viên" },
        ],
      },
      {
        label: collapsed ? "TC" : "TÀI CHÍNH",
        type: "group",
        children: [
          { key: "/instructor/income", icon: <WalletOutlined />, label: collapsed ? "TN" : "Thu nhập & giao dịch" },
        ],
      },
    ],
    [collapsed]
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

  // --- Render ---
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Đang tải...</div>
        </div>
      </div>
    );
  }
  
  if (!user || (!checkRole(user, "instructor") && !checkRole(user, "admin"))) {
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
                src={user.avatar} 
                size="small" 
                className={styles.userAvatar}
              >
                {user.fullname.charAt(0).toUpperCase()}
              </Avatar>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user.fullname}</div>
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
                  src={user.avatar} 
                  size="small" 
                  className={styles.headerAvatar}
                >
                  {user.fullname.charAt(0).toUpperCase()}
                </Avatar>
                {!collapsed && (
                  <span className={styles.headerUserName}>{user.fullname}</span>
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
