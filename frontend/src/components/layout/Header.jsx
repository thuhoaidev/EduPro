import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  MenuOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { ROLES, ROLE_NAMES } from '../../constants/roles';

const { Header: AntHeader } = Layout;

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/user/profile'),
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng điều khiển',
      onClick: () => {
        switch (user?.role) {
          case ROLES.ADMIN:
            navigate('/admin');
            break;
          case ROLES.INSTRUCTOR:
            navigate('/instructor');
            break;
          case ROLES.STUDENT:
            navigate('/user/dashboard');
            break;
          default:
            navigate('/');
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: <Link to="/courses">Khóa học</Link>,
    },
    {
      key: 'about',
      icon: <TeamOutlined />,
      label: <Link to="/about">Giới thiệu</Link>,
    },
  ];

  return (
    <AntHeader className="bg-white shadow-sm px-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-blue-600">
        EDUPRO
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <Menu
          mode="horizontal"
          items={menuItems}
          className="border-0"
        />

        {isAuthenticated ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="flex items-center cursor-pointer">
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <span className="ml-2 hidden lg:inline">
                {user?.name || 'Người dùng'}
              </span>
              <span className="ml-2 text-gray-500 hidden lg:inline">
                ({ROLE_NAMES[user?.role]})
              </span>
            </div>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-2">
            <Button type="link" onClick={() => navigate('/auth/login')}>
              Đăng nhập
            </Button>
            <Button type="primary" onClick={() => navigate('/auth/register')}>
              Đăng ký
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        className="md:hidden"
        onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
      />

      {/* Mobile Menu */}
      {mobileMenuVisible && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg md:hidden">
          <Menu
            mode="vertical"
            items={[
              ...menuItems,
              ...(isAuthenticated
                ? userMenuItems
                : [
                    {
                      key: 'login',
                      label: 'Đăng nhập',
                      onClick: () => navigate('/auth/login'),
                    },
                    {
                      key: 'register',
                      label: 'Đăng ký',
                      onClick: () => navigate('/auth/register'),
                    },
                  ]),
            ]}
          />
        </div>
      )}
    </AntHeader>
  );
};

export default Header; 