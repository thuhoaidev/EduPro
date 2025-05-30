import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  FileSearchOutlined,
  TagsOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined,
  WarningOutlined,
  AppstoreOutlined,
  MenuOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Avatar,
  Space,
  Dropdown,
  Breadcrumb,
  Button,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

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
      key: "/admin",
      title: <HomeOutlined />,
    },
    ...breadcrumbItems,
  ];

  const renderLabel = (title: string, caption?: string) => {
    if (collapsed) return null;
    return (
      <div className="flex flex-col">
        <span className="text-[15px] font-medium">{title}</span>
        {caption && (
          <span className="text-[11px] text-gray-500 mt-0.5">{caption}</span>
        )}
      </div>
    );
  };

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: collapsed ? null : (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Bảng Điều Khiển
        </div>
      ),
      children: [
        {
          key: "/admin",
          icon: <DashboardOutlined className="text-lg" />,
          label: renderLabel("Trang tổng quan"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
        {
          key: "/admin/instructor-approval",
          icon: <FileSearchOutlined className="text-lg" />,
          label: renderLabel("Duyệt giảng viên"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Nội dung
        </div>
      ),
      children: [
        {
          key: "/admin/content-approval",
          icon: <FileSearchOutlined className="text-lg" />,
          label: renderLabel("Duyệt khóa học & blog"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
            <p style={{ margin: 0, fontWeight: "bold" }}>Xin chào, Dương Đức Phương</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Vai trò: Admin</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>admin@gmail.com</p>
          </div>
        }
      >
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Trang cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Item key="user-page" icon={<UserOutlined />}>
        Trang người dùng
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
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
        className="shadow-lg"
        style={{
          background: token.colorBgContainer,
          height: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 1000,
        }}
      >
        <div className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : 'justify-start'} border-b border-gray-100`}>
          <img 
            src="https://i.imgur.com/xsKJ4Eh.png" 
            alt="Logo" 
            className={`h-8 w-8 rounded-lg ${collapsed ? 'mx-auto' : 'mr-3'}`}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">Admin</span>
              <span className="text-xs text-gray-500">Quản trị hệ thống</span>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => nav(key)}
          items={menuItems}
          className="border-0"
          style={{
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          theme="light"
          rootClassName="custom-admin-menu"
        />
      </Sider>

      <style>
        {`
          .custom-admin-menu .ant-menu-item {
            margin: 4px 8px !important;
            border-radius: 6px !important;
            height: 44px !important;
            line-height: 44px !important;
          }
          .custom-admin-menu .ant-menu-item:hover {
            background-color: ${token.colorPrimaryBgHover} !important;
          }
          .custom-admin-menu .ant-menu-item-selected {
            background-color: ${token.colorPrimaryBg} !important;
            color: ${token.colorPrimary} !important;
          }
          .custom-admin-menu .ant-menu-item-selected .anticon {
            color: ${token.colorPrimary} !important;
          }
          .custom-admin-menu .ant-menu-item-group-title {
            padding: 0 !important;
          }
          .custom-admin-menu .ant-menu-item-group {
            margin-bottom: 8px !important;
          }
        `}
      </style>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <Space size="middle">
            <Avatar size={40} src="https://i.imgur.com/xsKJ4Eh.png" />
            {!collapsed && <span style={{ fontSize: 20, fontWeight: 600 }}>FTECH Admin</span>}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#444" }} />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </Space>

          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f5f7fa",
                padding: "4px 12px",
                borderRadius: "999px",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <Avatar size={36} src="https://i.imgur.com/xsKJ4Eh.png" />
              <SettingOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 20,
            padding: 20,
            background: "#fff",
            borderRadius: 8,
            minHeight: "calc(100vh - 64px - 40px)",
          }}
        >
          <Breadcrumb items={finalBreadcrumbItems} style={{ marginBottom: 20 }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
