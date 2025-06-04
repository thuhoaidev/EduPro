import {
  HomeOutlined,
  FileSearchOutlined,
  CommentOutlined,
  WarningOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Breadcrumb,
} from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./ModeratorLayout.module.css";

const { Header, Sider, Content } = Layout;

const ModeratorLayout = () => {
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
          label: renderLabel("Duyệt bài viết blog"),
        },
        {
          key: "/moderator/comments",
          icon: <CommentOutlined />,
          label: renderLabel("Duyệt bình luận & đánh giá"),
        },
        {
          key: "/moderator/reports",
          icon: <WarningOutlined />,
          label: renderLabel("Xử lý báo cáo"),
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
          label: renderLabel("Thống kê vi phạm"),
        },
      ],
    },
  ];

  const profileMenu = (
    <Menu>
      <Menu.ItemGroup
        title={
          <div style={{ padding: "8px 12px" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>Xin chào, Mai Thi Hoai Thu</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Vai trò: người kiểm duyệt</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>kiemduyet@fpt.edu.vn</p>
          </div>
        }
      >
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="setting" icon={<UserOutlined />}>
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
          onClick={({ key }) => nav(key)}
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
          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
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
