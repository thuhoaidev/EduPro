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
}

interface ApiResponse {
  success: boolean;
  data: BackendCategory[];
  message: string;
}

// Modern icon mapping with trending categories
const modernIconMap: { [key: string]: { icon: React.ReactNode; color: string; isPopular?: boolean; isNew?: boolean } } = {
  'Công nghệ thông tin': { 
    icon: <CodeOutlined />, 
    color: '#3b82f6',
    isPopular: true 
  },
  'Phát triển web': { 
    icon: <GlobalOutlined />, 
    color: '#10b981',
    isPopular: true 
  },
  'Phát triển mobile': { 
    icon: <MobileOutlined />, 
    color: '#f59e0b',
    isPopular: true 
  },
  'Kinh doanh': { 
    icon: <AreaChartOutlined />, 
    color: '#8b5cf6' 
  },
  'Kỹ năng mềm': { 
    icon: <MessageOutlined />, 
    color: '#ec4899' 
  },
  'Marketing': { 
    icon: <ThunderboltOutlined />, 
    color: '#ef4444',
    isPopular: true 
  },
  'Data Science': { 
    icon: <DatabaseOutlined />, 
    color: '#06b6d4',
    isNew: true 
  },
  'Cloud Computing': { 
    icon: <CloudOutlined />, 
    color: '#6366f1',
    isNew: true 
  },
  'AI & Machine Learning': { 
    icon: <RocketOutlined />, 
    color: '#f97316',
    isNew: true 
  },
  'Design & UI/UX': { 
    icon: <LaptopOutlined />, 
    color: '#84cc16' 
  },
  'Digital Marketing': { 
    icon: <FireOutlined />, 
    color: '#dc2626',
    isPopular: true 
  },
  'Project Management': { 
    icon: <SettingOutlined />, 
    color: '#7c3aed' 
  },
  'Cybersecurity': { 
    icon: <SafetyCertificateOutlined />, 
    color: '#059669',
    isNew: true 
  },
  'Leadership': { 
    icon: <TrophyOutlined />, 
    color: '#d97706' 
  },
  'Communication': { 
    icon: <TeamOutlined />, 
    color: '#0891b2' 
  },
  'Innovation': { 
    icon: <BulbOutlined />, 
    color: '#be185d' 
  },
  'Health & Wellness': { 
    icon: <HeartOutlined />, 
    color: '#e11d48' 
  },
  'Education': { 
    icon: <BookOutlined />, 
    color: '#2563eb' 
  },
  'Video Production': { 
    icon: <VideoCameraOutlined />, 
    color: '#7c2d12' 
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
    courseCount: Math.floor(Math.random() * 50) + 5,
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
        const response = await config.get<ApiResponse>('/categories/status/active');
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
            id: 'tech', 
            name: 'Công nghệ thông tin', 
            icon: <CodeOutlined />, 
            courseCount: 25, 
            isPopular: true,
            color: '#3b82f6'
          },
          { 
            id: 'web', 
            name: 'Phát triển web', 
            icon: <GlobalOutlined />, 
            courseCount: 18, 
            isPopular: true,
            color: '#10b981'
          },
          { 
            id: 'mobile', 
            name: 'Phát triển mobile', 
            icon: <MobileOutlined />, 
            courseCount: 12, 
            isPopular: true,
            color: '#f59e0b'
          },
          { 
            id: 'ai-ml', 
            name: 'AI & Machine Learning', 
            icon: <RocketOutlined />, 
            courseCount: 8, 
            isNew: true,
            color: '#f97316'
          },
          { 
            id: 'business', 
            name: 'Kinh doanh', 
            icon: <AreaChartOutlined />, 
            courseCount: 15,
            color: '#8b5cf6'
          },
          { 
            id: 'marketing', 
            name: 'Digital Marketing', 
            icon: <FireOutlined />, 
            courseCount: 20, 
            isPopular: true,
            color: '#dc2626'
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
                      
                      {/* Badges for popular and new categories */}
                      <div className="category-badges">
                        {category.isPopular && (
                          <Badge 
                            count="Hot" 
                            className="popular-badge"
                            style={{ backgroundColor: '#ef4444' }}
                          />
                        )}
                        {category.isNew && (
                          <Badge 
                            count="New" 
                            className="new-badge"
                            style={{ backgroundColor: '#10b981' }}
                          />
                        )}
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