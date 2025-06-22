import React, { useState, useEffect } from 'react';
import { Layout, Typography } from 'antd';
import { motion } from 'framer-motion';
import { 
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Text } = Typography;

interface ProfileMenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  path: string;
}

const profileMenuItems: ProfileMenuItem[] = [
  { 
    id: 'profile',
    name: 'Thông tin cá nhân', 
    icon: <UserOutlined />,
    description: 'Cập nhật thông tin cá nhân',
    path: '/profile/edit'
  },
  { 
    id: 'password',
    name: 'Đổi mật khẩu', 
    icon: <LockOutlined />,
    description: 'Bảo mật tài khoản',
    path: '/profile/change-password'
  },
];

const ProfileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>('profile');

  useEffect(() => {
    // Xác định menu item hiện tại dựa trên path
    const currentPath = location.pathname;
    const currentItem = profileMenuItems.find(item => item.path === currentPath);
    if (currentItem) {
      setSelectedKey(currentItem.id);
    }
  }, [location.pathname]);

  const handleMenuClick = (item: ProfileMenuItem) => {
    setSelectedKey(item.id);
    navigate(item.path);
  };

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Sider 
        width={280} 
        style={{ 
          background: '#f7f9fc', 
          borderRight: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          padding: '8px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            onClick={() => navigate('/profile')}
            style={{
              padding: '16px 12px',
              marginBottom: '8px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease-in-out'
            }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={{ fontSize: '24px', marginBottom: '8px' }}
            >
              <UserOutlined />
            </motion.div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              Tài khoản cá nhân
            </div>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Quản lý thông tin và bảo mật
            </Text>
          </motion.div>

          {/* Menu Items */}
          {profileMenuItems.map((item, index) => {
            const isSelected = selectedKey === item.id;
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: (index + 1) * 0.1,
                  ease: 'easeOut'
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                onClick={() => handleMenuClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease-in-out',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #e0e0e0' : '1px solid transparent',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  marginBottom: '4px'
                }}
              >
                <motion.span 
                  style={{ 
                    fontSize: '20px', 
                    color: isSelected ? '#1677ff' : '#4a5568',
                    background: isSelected ? '#e6f4ff' : '#eef2f7',
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease-in-out',
                  }}
                  whileHover={{ 
                    rotate: 5,
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {item.icon}
                </motion.span>
                <div style={{ marginLeft: '16px', flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: '#1a202c',
                    marginBottom: '2px'
                  }}>
                    {item.name}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', fontWeight: 400 }}>
                    {item.description}
                  </Text>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#1677ff',
                      marginLeft: '8px'
                    }}
                  />
                )}
              </motion.div>
            )
          })}

          {/* Footer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            style={{
              padding: '12px',
              marginTop: '16px',
              borderRadius: '10px',
              background: 'rgba(24, 144, 255, 0.05)',
              border: '1px solid rgba(24, 144, 255, 0.1)',
              textAlign: 'center'
            }}
          >
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
              🔒 Dữ liệu của bạn được bảo mật
            </Text>
          </motion.div>
        </div>
      </Sider>
    </motion.div>
  );
};

export default ProfileNav;