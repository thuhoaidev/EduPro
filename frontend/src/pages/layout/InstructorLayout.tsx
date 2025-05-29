// src/layouts/InstructorLayout.tsx
import {
  HomeOutlined,
  BookOutlined,
  PlusCircleOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
  DollarOutlined,
  CommentOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Avatar,
  Breadcrumb,
  Dropdown,
  Button,
  Space,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const InstructorLayout = () => {
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
      key: "/instructor",
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
      label: collapsed ? null : "Giảng viên",
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
            <p style={{ margin: 0, fontWeight: "bold" }}>Chào, Nguyễn Tien Nam</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Vai trò: Giảng viên</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>instructor@gmail.com</p>
          </div>
        }
      />
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Trang cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
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
            {!collapsed && <span style={{ fontSize: 20, fontWeight: 600 }}>FTECH Instructor</span>}
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

export default InstructorLayout;
