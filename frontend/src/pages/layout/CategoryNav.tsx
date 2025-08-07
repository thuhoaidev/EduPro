import React, { useEffect, useState } from 'react';
import { Layout, Spin, Typography, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
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
  FireOutlined,
  StarOutlined,
  BookOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BulbOutlined,
  HeartOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { config } from '../../api/axios';
import './CategoryNav.css';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;
const { Text } = Typography;

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
  courseCount?: number;
  isPopular?: boolean;
  isNew?: boolean;
  color?: string;
}

interface BackendCategory {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  __v: number;
  courseCount?: number;
}

interface ApiResponse {
  success: boolean;
  data: BackendCategory[];
  message: string;
}

// Modern icon mapping with trending categories
const modernIconMap: { [key: string]: { icon: React.ReactNode; color: string; isPopular?: boolean; isNew?: boolean } } = {
  'Lập trình Web': { 
    icon: <CodeOutlined />, 
    color: '#3b82f6'
  },
  'Lập trình Backend': { 
    icon: <CloudOutlined />, 
    color: '#10b981'
  },
  'An ninh mạng': { 
    icon: <SafetyCertificateOutlined />, 
    color: '#ef4444'
  },
  'Trí tuệ nhân tạo & Deep Learning': { 
    icon: <RocketOutlined />, 
    color: '#f97316'
  },
  'Cơ sở dữ liệu': { 
    icon: <DatabaseOutlined />, 
    color: '#06b6d4'
  },
  'Khoa học máy tính': { 
    icon: <StarOutlined />, 
    color: '#8b5cf6' 
  },
  'Kỹ thuật phần mềm': { 
    icon: <SettingOutlined />, 
    color: '#7c3aed' 
  },
  'Phát triển Mobile': { 
    icon: <MobileOutlined />, 
    color: '#f59e0b'
  },
  'Digital Marketing': { 
    icon: <FireOutlined />, 
    color: '#dc2626'
  },
  'Kinh doanh': { 
    icon: <AreaChartOutlined />, 
    color: '#8b5cf6' 
  },
  'Kỹ năng mềm': { 
    icon: <MessageOutlined />, 
    color: '#ec4899' 
  },
  'Design & UI/UX': { 
    icon: <LaptopOutlined />, 
    color: '#84cc16' 
  },
  'Blockchain & Công nghệ Tài chính': { 
    icon: <ThunderboltOutlined />, 
    color: '#fbbf24'
  },
  'Công nghệ Phần mềm Nhúng & IoT': { 
    icon: <BulbOutlined />, 
    color: '#059669'
  },
  'Hệ thống thông tin': { 
    icon: <TeamOutlined />, 
    color: '#0891b2' 
  },
};

// Fallback icons for new categories
const fallbackIcons: { icon: React.ReactNode; color: string }[] = [
  { icon: <DatabaseOutlined />, color: '#06b6d4' },
  { icon: <CloudOutlined />, color: '#6366f1' },
  { icon: <RocketOutlined />, color: '#f97316' },
  { icon: <LaptopOutlined />, color: '#84cc16' },
  { icon: <FireOutlined />, color: '#dc2626' },
  { icon: <StarOutlined />, color: '#fbbf24' },
];

// Format category with modern styling
const formatCategory = (category: BackendCategory, index: number): Category => {
  const categoryInfo = modernIconMap[category.name] || fallbackIcons[index % fallbackIcons.length];
  return {
    id: category._id,
    name: category.name,
    icon: categoryInfo.icon,
    description: category.description,
    courseCount: category.courseCount || 0,
    isPopular: categoryInfo.isPopular,
    isNew: categoryInfo.isNew,
    color: categoryInfo.color,
  };
};

const AppSidebar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await config.get<ApiResponse>('/categories/status/active/count');
        const backendCategories = response.data.data;
        const formattedCategories = backendCategories.map((cat, index) => formatCategory(cat, index));

        setCategories(formattedCategories);
        if (formattedCategories.length > 0) {
          setSelectedKey(formattedCategories[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Modern fallback categories
        const fallbackCategories: Category[] = [
          { 
            id: 'web', 
            name: 'Lập trình Web', 
            icon: <CodeOutlined />, 
            courseCount: 6, 
            color: '#3b82f6'
          },
          { 
            id: 'backend', 
            name: 'Lập trình Backend', 
            icon: <CloudOutlined />, 
            courseCount: 1, 
            color: '#10b981'
          },
          { 
            id: 'security', 
            name: 'An ninh mạng', 
            icon: <SafetyCertificateOutlined />, 
            courseCount: 1, 
            color: '#ef4444'
          },
          { 
            id: 'ai-ml', 
            name: 'Trí tuệ nhân tạo & Deep Learning', 
            icon: <RocketOutlined />, 
            courseCount: 0, 
            color: '#f97316'
          },
          { 
            id: 'database', 
            name: 'Cơ sở dữ liệu', 
            icon: <DatabaseOutlined />, 
            courseCount: 0, 
            color: '#06b6d4'
          },
          { 
            id: 'cs', 
            name: 'Khoa học máy tính', 
            icon: <StarOutlined />, 
            courseCount: 0,
            color: '#8b5cf6'
          },
          { 
            id: 'software-eng', 
            name: 'Kỹ thuật phần mềm', 
            icon: <SettingOutlined />, 
            courseCount: 0,
            color: '#7c3aed'
          },
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
    navigate(`/courses?category=${key}`);
  };

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="category-nav-container"
    >
      <Sider 
        width={280} 
        className="category-sidebar"
      >
        

        <Spin spinning={loading} size="small" className="category-spinner">
          <div className="categories-list">
            <AnimatePresence>
              {categories.map((category, index) => {
                const isSelected = selectedKey === category.id;
                const isHovered = hoveredKey === category.id;
                
                return (
                  <motion.div 
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05,
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
                    onHoverStart={() => setHoveredKey(category.id)}
                    onHoverEnd={() => setHoveredKey(null)}
                    onClick={() => handleMenuClick({ key: category.id })}
                    className={`category-item ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{
                      '--category-color': category.color || '#6b7280'
                    } as React.CSSProperties}
                  >
                    <div className="category-icon-wrapper">
                      <motion.div 
                        className="category-icon"
                        whileHover={{ 
                          rotate: 5,
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                        style={{ color: category.color }}
                      >
                        {category.icon}
                      </motion.div>
                      
                      {/* Badges for popular and new categories - Removed */}
                      <div className="category-badges">
                        {/* Badges removed as requested */}
                      </div>
                    </div>

                    <div className="category-content">
                      <div className="category-name">
                        {category.name}
                      </div>
                      {category.courseCount && category.courseCount > 0 && (
                        <Text className="course-count">
                          {category.courseCount} khóa học
                        </Text>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div 
                        className="selection-indicator"
                        layoutId="selectionIndicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Spin>

        {/* Footer section */}
      </Sider>
    </motion.div>
  );
};

export default AppSidebar;