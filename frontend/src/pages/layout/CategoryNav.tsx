import React, { useEffect, useState } from 'react';
import { Menu, Layout, Spin } from 'antd';
import { 
  HomeOutlined,
  LaptopOutlined,
  PieChartOutlined,
  BarChartOutlined,
  BankOutlined,
  GlobalOutlined,
  BookOutlined 
} from '@ant-design/icons';
import { config } from '../../api/axios';

const { Sider } = Layout;

// Danh sách danh mục mặc định
const defaultCategories: Category[] = [
  { id: '1', name: 'Trang chủ', icon: <HomeOutlined /> },
  { id: '2', name: 'Công nghệ thông tin', icon: <LaptopOutlined /> },
  { id: '3', name: 'Phát triển web', icon: <PieChartOutlined /> },
  { id: '4', name: 'Phát triển mobile', icon: <BarChartOutlined /> },
  { id: '5', name: 'Kinh doanh', icon: <BankOutlined /> },
  { id: '6', name: 'Kỹ năng mềm', icon: <GlobalOutlined /> },
];

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
}

interface BackendCategory {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Map các loại danh mục với icon tương ứng
const categoryIconMap: { [key: string]: React.ReactNode } = {
  'Maketing': <LaptopOutlined />,
  'Công nghệ thông tin': <LaptopOutlined />,
  'Phát triển web': <PieChartOutlined />,
  'Phát triển mobile': <BarChartOutlined />,
  'Kinh doanh': <BankOutlined />,
  'Kỹ năng mềm': <GlobalOutlined />,
  'default': <BookOutlined />
};

// Chuyển đổi dữ liệu từ backend về định dạng cần thiết
const formatCategory = (category: BackendCategory): Category => {
  return {
    id: category._id,
    name: category.name,
    icon: categoryIconMap[category.name] || categoryIconMap['default'],
    description: category.description
  };
};

const AppSidebar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await config.get<BackendCategory[]>('/categories');
        const backendCategories = response.data.data; // Dữ liệu từ API có trong trường data
        
        // Chuyển đổi dữ liệu từ backend về định dạng cần thiết
        const formattedCategories = backendCategories.map(formatCategory);

        // Thêm danh mục mặc định vào đầu
        const allCategories = [
          { id: 'home', name: 'Trang chủ', icon: <HomeOutlined /> },
          ...formattedCategories
        ];

        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Spin spinning={loading}>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0 }}
        >
          {categories.map((category, index) => (
            <Menu.Item key={category.id}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {category.icon}
                <span>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{category.name}</span>
                 
                </span>
              </span>
            </Menu.Item>
          ))}
        </Menu>
      </Spin>
    </Sider>
  );
};

export default AppSidebar;