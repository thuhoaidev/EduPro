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

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // Nếu có user trong localStorage, dùng luôn
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      }

      // Nếu không có token, chuyển về login
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await config.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
        // Xóa token không hợp lệ
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Hiển thị loading trong khi fetch user
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Kiểm tra đăng nhập
  if (!user) {
    navigate("/login");
    return null;
  }

  // Kiểm tra quyền truy cập
  if (user.role?.name !== "instructor") {
    message.error("Bạn không có quyền truy cập trang giảng viên");
    navigate("/");
    return null;
  }

  // Kiểm tra trạng thái phê duyệt (tùy chọn)
  if (user.approval_status && user.approval_status !== "approved") {
    message.warning("Tài khoản giảng viên của bạn đang chờ phê duyệt");
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Đăng xuất thành công");
    navigate("/login");
  };

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
        {caption && <span>{caption}</span>}
      </div>
    );
  };

  const nav = (key: string) => navigate(key);

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: collapsed ? null : <div className={styles.menuItemGroupTitle}>Giảng viên</div>,
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
          key: "/instructor/courses/new",
          icon: <PlusCircleOutlined />,
          label: renderLabel("Tạo khóa học mới"),
        },
        {
          key: "/instructor/lessons",
          icon: <VideoCameraOutlined />,
          label: renderLabel("Quản lý chương học và bài học"),
        },
        {
          key: "/instructor/sections",
          icon: <BookOutlined />,
          label: renderLabel("Quản lý video và quiz"),
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
            <p style={{ margin: 0, fontWeight: "bold" }}>Xin chào, {user.fullname}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
              Vai trò: {user.role?.description || "Giảng viên"}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{user.email}</p>
          </div>
        }
      />
      <Menu.Divider />
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => nav("/")}>
        Trang người dùng
      </Menu.Item>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => nav("/profile")}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => nav("/settings")}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
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
        className={styles.sider}
      >
        <div className={styles.logo}>
          {collapsed ? "IR" : "Instructor Panel"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => nav(key)}
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
        <Header className={styles.header}>
          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
            <div className={styles.profileDropdown}>
              <SettingOutlined className={styles.profileSettingIcon} />
            </div>
          </Dropdown>
        </Header>

        <Content className={styles.contentArea}>
          <Breadcrumb items={finalBreadcrumbItems} className={styles.breadcrumb} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default InstructorLayout;