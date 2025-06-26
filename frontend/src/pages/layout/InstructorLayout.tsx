// src/layouts/InstructorLayout.tsx
import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  FileSearchOutlined,
  TagsOutlined,
  HistoryOutlined,
  BarChartOutlined,
  WarningOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  BookOutlined,
  GiftOutlined,
  DollarCircleOutlined,
  SafetyCertificateOutlined,
  PlusCircleOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Breadcrumb,
  message,
  Avatar,
  Button,
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
  approval_status?: string;
}

const checkRole = (user: User | null, requiredRole: string): boolean => {
  return user?.role?.name === requiredRole;
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
        if (userData && typeof userData.role === 'string') {
          userData.role = { name: userData.role };
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
        let userData = response.data;
        if (userData && typeof userData.role === 'string') {
          userData.role = { name: userData.role };
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
    if (!loading && !checkRole(user, "instructor")) {
      message.error("Bạn không có quyền truy cập trang giảng viên");
      navigate("/");
    }
  }, [user, loading, navigate]);

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // --- Menu Items ---
  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "/instructor",
        icon: <HomeOutlined />,
        label: "Dashboard cá nhân",
      },
      {
        label: "KHÓA HỌC",
        type: "group",
        children: [
          { key: "/instructor/courses", icon: <BookOutlined />, label: "Khóa học của tôi" },
          { key: "/instructor/courses/create", icon: <PlusCircleOutlined />, label: "Tạo khóa học mới" },
          { key: "/instructor/lessons", icon: <VideoCameraOutlined />, label: "Quản lý bài học & video" },
        ],
      },
      {
        label: "HỌC VIÊN",
        type: "group",
        children: [
          { key: "/instructor/students", icon: <UserOutlined />, label: "Thống kê học viên" },
          { key: "/instructor/community", icon: <CommentOutlined />, label: "Giao tiếp học viên" },
        ],
      },
      {
        label: "TÀI CHÍNH",
        type: "group",
        children: [
          { key: "/instructor/income", icon: <DollarOutlined />, label: "Thu nhập & giao dịch" },
        ],
      },
    ],
    []
  );

  // --- Breadcrumb ---
  const breadcrumbNameMap: { [key: string]: string } = {
    '/instructor': 'Dashboard cá nhân',
    '/instructor/courses': 'Khóa học của tôi',
    '/instructor/courses/create': 'Tạo khóa học mới',
    '/instructor/lessons': 'Quản lý bài học & video',
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

  // --- Dropdown Menu ---
  const userMenuItems: MenuProps["items"] = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Quay lại trang chủ",
      onClick: () => navigate("/"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // --- Render ---
  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }
  if (!user || !checkRole(user, "instructor")) {
    return null;
  }

  return (
    <Layout className={styles.adminLayout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className={styles.sider}
        theme="light"
      >
        <motion.div
          layout
          className={`${styles.logoArea} ${collapsed ? styles.collapsed : ""}`}
        >
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={styles.logoText}
            >
              Instructor
            </motion.span>
          )}
        </motion.div>
        <Menu
          mode="inline"
          theme="light"
          className={styles.menu}
          items={menuItems}
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className={styles.siteLayout}>
        <Header className={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.toggleButton}
          />
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <a onClick={(e) => e.preventDefault()} className={styles.profileDropdown}>
                <Avatar src={user.avatar} size="small">{user.fullname.charAt(0)}</Avatar>
                <span>{user.fullname}</span>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <Breadcrumb items={finalBreadcrumbItems} className={styles.breadcrumb} />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
