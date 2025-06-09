import React, { useEffect, useState } from 'react';
import { Menu, Layout, Spin, message } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { config } from '../../api/axios'; // Đảm bảo đường dẫn đúng với project của bạn

const { Sider } = Layout;

interface Category {
  _id: string;
  name: string;
  description?: string;
}

const AppSidebar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await config.get('/admin/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      {loading ? (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <Menu
          mode="inline"
          defaultSelectedKeys={['home']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            Trang chủ
          </Menu.Item>

          {categories.map((category) => (
            <Menu.Item key={category._id} icon={<FolderOutlined />}>
              {category.name}
            </Menu.Item>
          ))}
        </Menu>
      )}
    </Sider>
  );
};

export default AppSidebar;
