import {
  UserOutlined,
  HomeOutlined,
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
} from "@ant-design/icons";
import { Layout, Menu, Input, Avatar, Space, Dropdown, Breadcrumb, Button } from "antd";
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
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      return {
        key: url,
        title: <a href={url}>{name.replace(/-/g, ' ')}</a>,
      };
    });

  const finalBreadcrumbItems = [
    {
      title: <HomeOutlined />,
      key: "/",
      href: "/admin",
    },
    ...breadcrumbItems,
  ];

  // Cập nhật hàm renderLabel để kiểm soát hiển thị khi collapsed
  const renderLabel = (title: string, caption?: string) => {
    if (collapsed) {
      return title; // Khi collapsed, chỉ trả về chuỗi title để Ant Design tự ẩn
    }
    return (
      <div style={{ fontSize: "15px", display: "flex", flexDirection: "column" }}>
        <span>{title}</span>
        {caption && (
          <span style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>
            {caption}
          </span>
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
          label: renderLabel("Điều khiển"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Khóa Học",
      children: [
        {
          key: "course",
          icon: <ShopOutlined />,
          label: renderLabel("Khóa học"),
          children: [
            {
              key: "/admin/course/Learning-Path",
              label: "Danh mục khóa học",
            },
            {
              key: "/admin/course/list",
              label: "Danh sách khóa học",
            },
            {
              key: "/admin/course/add",
              label: "Tạo khóa học",
            },
          ],
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Mã Giảm Giá",
      children: [
        {
          key: "/admin/coupons",
          icon: <TagsOutlined />,
          label: renderLabel("Quản lý mã giảm giá"),
        },
      ],
    },
    {
      type: "group",
      label: "", 
      children: [
        {
          key: "/admin/history",
          icon: <HistoryOutlined />,
          label: renderLabel("Lịch sử giao dịch"),
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "User",
      children: [
        {
          key: "user",
          icon: <UserOutlined />,
          label: renderLabel("Quản lý tài khoản"),
          children: [
            {
              key: "/admin/users/student",
              label: "Học viên",
            },
            {
              key: "/admin/users/admin",
              label: "Quản trị",
            },
          ],
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Review_comments",
      children: [
        {
          key: "review",
          icon: <CommentOutlined />,
          label: renderLabel("Bình luận và đánh giá"),
          children: [
            {
              key: "/admin/reviews/rating",
              label: "Đánh giá",
            },
            {
              key: "/admin/reviews/comment",
              label: "Bình luận",
            },
          ],
        },
      ],
    },
    {
      type: "group",
      label: collapsed ? null : "Quản Lí Carousel",
      children: [
        {
          key: "/admin/carousel",
          icon: <PictureOutlined />,
          label: renderLabel("Carousel"),
        },
      ],
    },
  ];

  const profileMenu = (
    <Menu>
      <Menu.ItemGroup title={
        <div style={{ padding: '8px 12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Xin chào, Dương Đức Phương</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Vai trò admin</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>admin@gmail.com</p>
        </div>
      }>
        <Menu.Item key="search-profile">
          <Input placeholder="Tìm kiếm" prefix={<SearchOutlined style={{ color: '#999' }} />} bordered={false} style={{ width: '100%' }} />
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
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        collapsedWidth={80}
        trigger={null} // <--- QUAN TRỌNG: Xóa nút trigger mặc định ở cuối Sider
        style={{
          background: "#fff",
          paddingTop: 0,
          overflowY: "hidden",
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

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
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
          {/* LOGO FTECH VÀ NÚT MENU Ở ĐẦU HEADER */}
          <Space size="middle" style={{ minWidth: collapsed ? 80 : 200, transition: 'min-width 0.2s', justifyContent: 'flex-start' }}>
            <Avatar
              size={40}
              src="https://i.imgur.com/xsKJ4Eh.png"
              style={{
                background: "linear-gradient(to bottom, #00C6FF, #00FF99)",
              }}
            />
            {/* Tên FTECH, chỉ hiển thị khi Sider không bị collapsed */}
            {!collapsed && (
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>FTECH</span>
            )}
            {/* Nút bật/tắt Sider, đặt ngay sau logo và tên */}
             <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#444" }} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ width: 40, height: 40, marginLeft: 'auto' }} // Đẩy nút menu sang phải trong Space
            />
          </Space>


          {/* Thanh tìm kiếm */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f5f7fa",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0 12px",
              flex: 1,
              maxWidth: 600,
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

          {/* Dropdown Profile */}
          <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f5f7fa",
                padding: "4px 12px",
                borderRadius: "999px",
                gap: 10,
                cursor: 'pointer'
              }}
            >
              <Avatar
                size={36}
                src="https://i.imgur.com/xsKJ4Eh.png"
                style={{
                  background: "linear-gradient(to bottom, #00C6FF, #00FF99)",
                }}
              />
              <SettingOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: "20px",
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
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