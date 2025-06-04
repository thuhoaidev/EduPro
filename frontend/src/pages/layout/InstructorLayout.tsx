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
} from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./InstructorLayout.module.css";

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
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
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
