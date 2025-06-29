import {
  HomeOutlined,
  FileSearchOutlined,
  CommentOutlined,
  WarningOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
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
import styles from "../../styles/ModeratorLayout.module.css";
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

const ModeratorLayout = () => {
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
  if (!checkRole(user, 'moderator')) {
    message.error('Bạn không có quyền truy cập trang kiểm duyệt');
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
      key: "/moderator",
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
          Kiểm duyệt nội dung
        </div>
      ),
      children: [
        {
          key: "/moderator/blogs",
          icon: <FileSearchOutlined />,
          label: renderLabel("Duyệt Blog"),
        },
        {
          key: "/moderator/comments",
          icon: <CommentOutlined />,
          label: renderLabel("Danh sách Bình luận"),
        },
        {
          key: "/moderator/reports",
          icon: <WarningOutlined />,
          label: renderLabel("Báo cáo vi phạm"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div className={styles.menuItemGroupTitle}>
          Thống kê
        </div>
      ),
      children: [
        {
          key: "/moderator/statistics",
          icon: <BarChartOutlined />,
          label: renderLabel("Thống kê báo cáo"),
        },
      ],
    },
  ];

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Quay lại trang chủ",
      onClick: () => navigate('/'),
    },
  ];

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
          {collapsed ? "MP" : "Moderator Panel"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          className={styles.customModeratorMenu}
          style={{
            height: "100%",
            borderRight: 0,
            overflowY: "auto",
            paddingTop: 16,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: "margin-left 0.2s" }}>
        <Header
          className={styles.header}
        >
          <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
            <div
              className={styles.profileDropdown}
            >
              {/* <Avatar size={36} src="https://i.imgur.com/xsKJ4Eh.png" /> */}
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

export default ModeratorLayout;
