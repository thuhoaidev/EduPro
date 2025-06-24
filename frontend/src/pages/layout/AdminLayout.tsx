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
} from "antd";
import type { MenuProps } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../styles/AdminLayout.module.css";
import { config } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const { Header, Sider, Content } = Layout;

interface User {
  avatar?: string;
  fullname: string;
  email: string;
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
}

const checkRole = (user: User | null, requiredRole: string): boolean => {
  return user?.role?.name === requiredRole;
};

const AdminLayout = () => {
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
        // Reverted to /auth/me and response.data
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
    if (!loading && !checkRole(user, "admin")) {
      message.error("Bạn không có quyền truy cập trang quản trị");
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
        key: "/admin",
        icon: <HomeOutlined />,
        label: "Tổng quan",
      },
      {
        label: "QUẢN LÝ",
        type: "group",
        children: [
          { key: "/admin/users", icon: <UserOutlined />, label: "Người dùng" },
          { key: "/admin/instructors", icon: <TeamOutlined />, label: "Giảng viên" },
          { key: "/admin/categories", icon: <TagsOutlined />, label: "Danh mục" },
          { key: "/admin/courses", icon: <BookOutlined />, label: "Khóa học" },
        ],
      },
      {
        label: "KIỂM DUYỆT",
        type: "group",
        children: [
          { key: "/admin/content-approval", icon: <SafetyCertificateOutlined />, label: "Nội dung" },
          { key: "/admin/reports", icon: <WarningOutlined />, label: "Báo cáo" },
        ],
      },
      {
        label: "KINH DOANH",
        type: "group",
        children: [
          { key: "/admin/transactions", icon: <DollarCircleOutlined />, label: "Giao dịch" },
          { key: "/admin/vouchers", icon: <GiftOutlined />, label: "Mã giảm giá" },
          { key: "/admin/statistics", icon: <BarChartOutlined />, label: "Thống kê" },
        ],
      },
      {
        label: "HỆ THỐNG",
        type: "group",
        children: [{ key: "/admin/settings", icon: <SettingOutlined />, label: "Cài đặt" }],
      },
    ],
    []
  );

  // --- Breadcrumb ---
  const breadcrumbNameMap: { [key: string]: string } = {
    '/admin': 'Tổng quan',
    '/admin/users': 'Quản lý người dùng',
    '/admin/instructors': 'Quản lý giảng viên',
    '/admin/categories': 'Quản lý danh mục',
    // Thêm các path khác ở đây
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
    { key: 'home', title: <Link to="/admin"><HomeOutlined /></Link> },
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
  if (!user || !checkRole(user, "admin")) {
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
              EduPro
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

export default AdminLayout;
