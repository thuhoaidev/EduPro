import React, { useEffect, useState } from 'react';
import { Layout, Spin, Typography } from 'antd';
import { motion } from 'framer-motion';
import { 
  CodeOutlined,
  GlobalOutlined,
  MobileOutlined,
  AreaChartOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudOutlined,
  RocketOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import { config } from '../../api/axios';

const { Sider } = Layout;
const { Text } = Typography;

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
  courseCount?: number;
}

interface BackendCategory {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: BackendCategory[];
  message: string;
}

// Bộ icon được chỉ định cho các danh mục cụ thể
const specificIconMap: { [key: string]: React.ReactNode } = {
  'Marketing': <ThunderboltOutlined />,
  'Công nghệ thông tin': <CodeOutlined />,
  'Phát triển web': <GlobalOutlined />,
  'Phát triển mobile': <MobileOutlined />,
  'Kinh doanh': <AreaChartOutlined />,
  'Kỹ năng mềm': <MessageOutlined />,
};

// Danh sách icon dự phòng cho các danh mục mới
const fallbackIcons: React.ReactNode[] = [
  <DatabaseOutlined />,
  <CloudOutlined />,
  <RocketOutlined />,
  <LaptopOutlined />,
];

// Chuyển đổi dữ liệu từ backend và gán icon
const formatCategory = (category: BackendCategory, index: number): Category => {
  const icon = specificIconMap[category.name] || fallbackIcons[index % fallbackIcons.length];
  return {
    id: category._id,
    name: category.name,
    icon: icon,
    description: category.description,
    courseCount: Math.floor(Math.random() * 50) + 5, // Mock course count
  };
};

const AppSidebar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy danh mục active
        const response = await config.get<ApiResponse>('/categories/status/active');
        const backendCategories = response.data.data;
        
        // Chuyển đổi dữ liệu từ backend về định dạng cần thiết
        const formattedCategories = backendCategories.map((cat, index) => formatCategory(cat, index));

        setCategories(formattedCategories);

        if (formattedCategories.length > 0) {
          setSelectedKey(formattedCategories[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        const fallbackCategories: Category[] = [
          { id: 'tech', name: 'Công nghệ thông tin', icon: <CodeOutlined />, courseCount: 25 },
          { id: 'web', name: 'Phát triển web', icon: <GlobalOutlined />, courseCount: 18 },
          { id: 'mobile', name: 'Phát triển mobile', icon: <MobileOutlined />, courseCount: 12 },
          { id: 'business', name: 'Kinh doanh', icon: <AreaChartOutlined />, courseCount: 15 },
          { id: 'soft-skills', name: 'Kỹ năng mềm', icon: <MessageOutlined />, courseCount: 8 },
        ];
        setCategories(fallbackCategories);
        if (fallbackCategories.length > 0) {
          setSelectedKey(fallbackCategories[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    // Add navigation logic here
    console.log('Selected category:', key);
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
        <Spin spinning={loading} size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
            {categories.map((category, index) => {
              const isSelected = selectedKey === category.id;
              return (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
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
                  onClick={() => handleMenuClick({ key: category.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease-in-out',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    border: isSelected ? '1px solid #e0e0e0' : '1px solid transparent',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  }}
                >
                  <motion.span 
                    style={{ 
                      fontSize: '20px', 
                      color: isSelected ? '#1677ff' : '#4a5568',
                      background: isSelected ? '#e6f4ff' : '#eef2f7',
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
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
                    {category.icon}
                  </motion.span>
                  <div style={{ marginLeft: '14px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600,
                      color: '#1a202c',
                    }}>
                      {category.name}
                    </div>
                    {category.courseCount && category.courseCount > 0 && (
                      <Text type="secondary" style={{ fontSize: '12px', fontWeight: 400 }}>
                        {category.courseCount} khóa học
                      </Text>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Spin>
      </Sider>
    </motion.div>
  );
};

export default AppSidebar;