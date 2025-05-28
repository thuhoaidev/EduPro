import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  FileSearchOutlined,
  ShopOutlined,
  TagsOutlined,
  HistoryOutlined,
  CommentOutlined,
  PictureOutlined,
  MenuOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined,
  WarningOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Input,
  Avatar,
  Space,
  Dropdown,
  Breadcrumb,
  Button,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
    if (collapsed) return title;
    return (
      <div style={{ fontSize: "15px", display: "flex", flexDirection: "column" }}>
        <span>{title}</span>
        {caption && (
          <span style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>{caption}</span>
        )}
      </div>
    );
  };

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: collapsed ? null : "Bảng Điều Khiển",
      children: [
        {
          key: "/admin",
          icon: <HomeOutlined />,
          label: renderLabel("Trang tổng quan"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Người dùng",
      children: [
        {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: renderLabel("Quản lý người dùng"),
        },
        {
          key: "/admin/instructors",
          icon: <TeamOutlined />,
          label: renderLabel("Quản lý giảng viên"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Nội dung",
      children: [
        {
          key: "/admin/content-approval",
          icon: <FileSearchOutlined />,
          label: renderLabel("Duyệt khóa học & blog"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Báo cáo",
      children: [
        {
          key: "/admin/reports",
          icon: <WarningOutlined />,
          label: renderLabel("Quản lý báo cáo"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Hệ thống",
      children: [
        {
          key: "/admin/system/vouchers",
          icon: <TagsOutlined />,
          label: renderLabel("Mã giảm giá"),
        },
        {
          key: "/admin/system/payments",
          icon: <HistoryOutlined />,
          label: renderLabel("Thanh toán"),
        },
        {
          key: "/admin/system/notifications",
          icon: <AppstoreOutlined />,
          label: renderLabel("Thông báo hệ thống"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Thống kê",
      children: [
        {
          key: "/admin/statistics",
          icon: <BarChartOutlined />,
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
        <Menu.Item key="search-profile">
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined style={{ color: "#999" }} />}
            bordered={false}
          />
        </Menu.Item>
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
        width={260}
        collapsedWidth={80}
        style={{
          background: "#fff",
          height: "100vh",
          position: "fixed",
          left: 0,
          borderRight: "1px solid #eee",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => nav(key)}
          items={menuItems}
          style={{
            height: "100%",
            borderRight: 0,
            overflowY: "auto",
            paddingTop: 16,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: "margin-left 0.2s" }}>
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f5f7fa",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0 12px",
              maxWidth: 600,
              flex: 1,
              margin: "0 40px",
              height: 40,
            }}
          >
            <SearchOutlined style={{ color: "#999", marginRight: 8 }} />
            <Input
              placeholder="Tìm kiếm..."
              bordered={false}
              style={{ background: "transparent" }}
            />
            <FilterOutlined style={{ color: "#999", marginLeft: 8 }} />
          </div>

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
