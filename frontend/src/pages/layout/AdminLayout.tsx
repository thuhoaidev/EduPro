import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  FileSearchOutlined,
  TagsOutlined,
  HistoryOutlined,
  SettingOutlined,
  BarChartOutlined,
  WarningOutlined,
  AppstoreOutlined,
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
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../styles/AdminLayout.module.css";
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

  // Kiểm tra approval_status để xác định vai trò
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

const AdminLayout = () => {
  const nav = useNavigate();
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    nav(key);
  };
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
  }, [nav]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    message.success('Đăng xuất thành công!');
    nav('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    nav('/login');
    return null;
  }

  // Kiểm tra role
  if (!checkRole(user, 'admin')) {
    message.error('Bạn không có quyền truy cập trang quản trị');
    nav('/');
    return null;
  }

  const breadcrumbItems = location.pathname
    .split("/")
    .filter((i) => i)
    .map((path, index, array) => {
      const url = `/${array.slice(0, index + 1).join("/")}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return {
        key: `breadcrumb-${url.replace('/', '-')}`,
        title: <a href={url}>{name}</a>,
      };
    });

  const finalBreadcrumbItems = [
    {
      key: "/admin",
      title: <HomeOutlined />,
    },
    ...breadcrumbItems,
  ];

  const renderLabel = (title: string, caption?: string) => {
    if (collapsed) return null;
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
        <div>
          Người dùng
        </div>
      ),
      children: [
        {
          key: "/admin/users",
          icon: <UserOutlined className="text-lg" />,
          label: renderLabel("Quản lý người dùng"),
        },
        {
          key: "/admin/instructors",
          icon: <TeamOutlined className="text-lg" />,
          label: renderLabel("Quản lý giảng viên"),
        },
        // {
        //   key: "/admin/instructor-approval",
        //   icon: <FileSearchOutlined className="text-lg" />,
        //   label: renderLabel("Duyệt giảng viên"),
        // },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div>
          Nội dung
        </div>
      ),
      children: [
        {
          key: "/admin/content-approval",
          icon: <FileSearchOutlined className="text-lg" />,
          label: renderLabel("Duyệt khóa học & blog"),
        },
        {
          key: "/admin/categories",
          icon: <TagsOutlined className="text-lg" />,
          label: renderLabel("Quản lý danh mục"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div>
          Báo cáo
        </div>
      ),
      children: [
        {
          key: "/admin/reports",
          icon: <WarningOutlined className="text-lg" />,
          label: renderLabel("Quản lý báo cáo"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div>
          Hệ thống
        </div>
      ),
      children: [
        {
          key: "/admin/system/vouchers",
          icon: <TagsOutlined className="text-lg" />,
          label: renderLabel("Mã giảm giá"),
        },
        {
          key: "/admin/system/payments",
          icon: <HistoryOutlined className="text-lg" />,
          label: renderLabel("Thanh toán"),
        },
        {
          key: "/admin/system/notifications",
          icon: <AppstoreOutlined className="text-lg" />,
          label: renderLabel("Thông báo hệ thống"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div>
          Thống kê
        </div>
      ),
      children: [
        {
          key: "/admin/statistics",
          icon: <BarChartOutlined className="text-lg" />,
          label: renderLabel("Thống kê & báo cáo"),
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
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Vai trò: {user?.role?.name === 'admin' ? 'Admin' : user?.role?.name === 'instructor' ? 'Giảng viên' : user?.role?.name === 'moderator' ? 'Quản trị viên' : 'Người dùng'}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{user?.email}</p>
          </div>
        }
      >
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => nav('/')}>
        Trang người dùng
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
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
        className={`${styles.sider}`}
      >
        <div className={styles.logo}>
          {collapsed ? "AD" : "Admin Panel"}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          className={styles.customAdminMenu}
          style={{
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            overflowX: "hidden",
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
              <SettingOutlined style={{ fontSize: 20, color: "#1890ff" }} />
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

export default AdminLayout;
