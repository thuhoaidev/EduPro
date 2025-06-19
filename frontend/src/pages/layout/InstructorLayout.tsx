// src/layouts/InstructorLayout.tsx
import {
  HomeOutlined,
  BookOutlined,
  PlusCircleOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  CommentOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Breadcrumb,
  message,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/InstructorLayout.module.css";
import { config } from "../../api/axios";

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
  approval_status?: string;
}

const getRoleName = (user: User): string => {
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

const checkRole = (user: User, requiredRole: string): boolean => {
  return user?.role?.name === requiredRole;
};

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await config.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Kiểm tra role
  if (!checkRole(user, 'instructor')) {
    message.error('Bạn không có quyền truy cập trang giảng viên');
    navigate('/');
    return null;
  }

  const breadcrumbItems = location.pathname
    .split("/")
    .filter((i) => i)
    .map((path, index, array) => {
      const url = `/${array.slice(0, index + 1).join("/")}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return {
        key: url,
        title: <a href={url}>{name}</a>,
      };
    });

  const finalBreadcrumbItems = [
    {
      key: "/instructor",
      title: <HomeOutlined />,
    },
    ...breadcrumbItems,
  ];

  const renderLabel = (title: string, caption?: string) => {
    if (collapsed) return title;
    return (
      <div className={styles.menuItemLabel}>
        <span>{title}</span>
        {caption && (
          <span>{caption}</span>
        )}
      </div>
    );
  };

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: collapsed ? null : (
        <div className={styles.menuItemGroupTitle}>
          Giảng viên
        </div>
      ),
      children: [
        {
          key: "/instructor",
          icon: <HomeOutlined />,
          label: renderLabel("Dashboard cá nhân"),
        },
        {
          key: "/instructor/courses",
          icon: <BookOutlined />,
          label: renderLabel("Khóa học của tôi"),
        },
        {
          key: "/instructor/courses/create",
          icon: <PlusCircleOutlined />,
          label: renderLabel("Tạo khóa học mới"),
        },
        {
          key: "/instructor/lessons",
          icon: <VideoCameraOutlined />,
          label: renderLabel("Quản lý bài học & video"),
        },
        {
          key: "/instructor/students",
          icon: <UserOutlined />,
          label: renderLabel("Thống kê học viên"),
        },
        {
          key: "/instructor/income",
          icon: <DollarOutlined />,
          label: renderLabel("Thu nhập & giao dịch"),
        },
        {
          key: "/instructor/community",
          icon: <CommentOutlined />,
          label: renderLabel("Giao tiếp học viên"),
        },
      ],
    },
  ];

  const profileMenu = (
    <Menu>
      <Menu.ItemGroup
        title={
          <div style={{ padding: "8px 12px" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>Xin chào, {user?.fullname}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Vai trò: Giảng viên</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{user?.email}</p>
          </div>
        }
      >
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
        Trang người dùng
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        collapsedWidth={80}
        className={styles.sider}
      >
        <div className={styles.logo}>
          {collapsed ? "IR" : "Instructor Panel"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          className={styles.customInstructorMenu}
          style={{
            height: "calc(100vh - 64px)",
            borderRight: 0,
            overflowY: "auto",
            paddingTop: 16,
          }}
          theme="light"
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: "margin-left 0.2s" }}>
        <Header
          className={styles.header}
        >
          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
            <div
              className={styles.profileDropdown}
            >
              <SettingOutlined className={styles.profileSettingIcon} />
            </div>
          </Dropdown>
        </Header>

        <Content
          className={styles.contentArea}
        >
          <Breadcrumb items={finalBreadcrumbItems} className={styles.breadcrumb} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default InstructorLayout;
