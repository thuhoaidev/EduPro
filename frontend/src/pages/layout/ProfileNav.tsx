import { Menu, Layout } from 'antd';
import { 
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const categories = [
  { 
    name: 'Thông tin cá nhân', 
    icon: <UserOutlined />,
    path: '/profile/edit'
  },
  { 
    name: 'Mật khẩu và bảo mật', 
    icon: <LockOutlined />,
    path: '/profile/change-password'
  },
];

const ProfileNav = () => {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
        onClick={(e) => handleMenuClick(categories[Number(e.key) - 1].path)}
      >
        {categories.map((category, index) => (
          <Menu.Item key={index + 1}>
            {category.icon} {category.name}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default ProfileNav;