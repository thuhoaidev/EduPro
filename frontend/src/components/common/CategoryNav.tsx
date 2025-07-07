import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../interfaces/Category.interface';
import styles from './CategoryNav.module.css';

interface CategoryNavProps {
  showAll?: boolean;
  className?: string;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ 
  showAll = true,
  className = ''
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getAllCategories({ page: 1, limit: 100 });
        if (response.success && response.data) {
          const activeCategories = response.data.filter(cat => cat.status === 'active');
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getLinkClassName = (isActive: boolean) => {
    return `${styles.categoryLink} ${isActive ? styles.active : styles.default}`;
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-4 ${className}`}>
        <Spin />
      </div>
    );
  }

  return (
    <nav className={`${styles.categoryNav} ${className}`}>
      {showAll && (
        <Link
          to="/courses"
          className={getLinkClassName(activeCategoryId === null)}
        >
          Tất cả
        </Link>
      )}
      
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`/courses?category=${category._id}`}
          className={getLinkClassName(activeCategoryId === category._id)}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
};

export default CategoryNav; 