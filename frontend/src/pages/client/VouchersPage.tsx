import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Input, 
  Select, 
  Card, 
  Tag, 
  Typography, 
  Badge, 
  message, 
  Pagination, 
  Button,
  Row,
  Col,
  Divider,
  Space,
  Tooltip,
  Progress,
  Empty,
  Spin,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  CopyOutlined, 
  FireOutlined, 
  ClockCircleOutlined, 
  GiftOutlined, 
  StarOutlined, 
  CrownOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import voucherService from '../../services/voucher.service';
import type { Voucher } from '../../services/voucher.service';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../interfaces/Category.interface';
import SearchBar from '../../components/common/SearchBar';
import VoucherCard from '../../components/voucher/VoucherCard';
import styles from '../../components/common/CategoryNav.module.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;

interface VoucherDisplay {
    id: string;
    code: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minAmount: number;
    maxDiscount?: number;
    validFrom: string;
    validTo: string;
    usageLimit: number;
    usedCount: number;
    category: string;
    isActive: boolean;
    isExpired: boolean;
    daysLeft: number;
    status: 'available' | 'unavailable';
    statusMessage: string;
}

const VoucherCategoryNav = ({ categories, activeCategory, onChange }: { categories: Category[], activeCategory: string, onChange: (cat: string) => void }) => {
  const navItems = [
    { label: 'Tất cả', value: 'Tất cả' },
    ...categories.map(cat => ({ label: cat.name, value: cat._id }))
  ];
  return (
    <nav className={styles.categoryNav} style={{ marginBottom: 16 }}>
      {navItems.map(item => (
        <button
          key={item.value}
          className={`${styles.categoryLink} ${activeCategory === item.value ? styles.active : styles.default}`}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

const DiscountTypeNav = ({ activeType, onChange }: { activeType: string, onChange: (type: string) => void }) => {
  const navItems = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Giảm theo phần trăm', value: 'percentage' },
    { label: 'Giảm cố định', value: 'fixed' }
  ];
  return (
    <nav className={styles.categoryNav} style={{ marginBottom: 0, marginTop: 8 }}>
      {navItems.map(item => (
        <button
          key={item.value}
          className={`${styles.categoryLink} ${activeType === item.value ? styles.active : styles.default}`}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

const VouchersPage = () => {
    const [vouchers, setVouchers] = useState<VoucherDisplay[]>([]);
    const [filteredVouchers, setFilteredVouchers] = useState<VoucherDisplay[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchTerm = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || 'Tất cả';
    const discountTypeFilter = searchParams.get('discountType') || 'all';

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                const response = await voucherService.getAvailable();
                
                const transformedVouchers: VoucherDisplay[] = response.data.map((voucher: Voucher) => {
                    const now = new Date();
                    const endDate = new Date(voucher.endDate || '');
                    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return {
                        id: voucher.id,
                        code: voucher.code,
                        title: voucher.title,
                        description: voucher.description || '',
                        discount: voucher.discountValue,
                        discountType: voucher.discountType,
                        minAmount: voucher.minOrderValue,
                        maxDiscount: voucher.maxDiscount,
                        validFrom: voucher.startDate,
                        validTo: voucher.endDate || '',
                        usageLimit: voucher.usageLimit,
                        usedCount: voucher.usedCount,
                        category: voucher.categories?.[0] || 'Tất cả',
                        isActive: voucher.isValid || false,
                        isExpired: daysLeft < 0,
                        daysLeft: Math.max(0, daysLeft),
                        status: voucher.status || 'available',
                        statusMessage: voucher.statusMessage || ''
                    };
                });
                
                setVouchers(transformedVouchers);
                setFilteredVouchers(transformedVouchers);
            } catch (error) {
                console.error('Error fetching vouchers:', error);
                setError('Không thể tải danh sách voucher. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchVouchers();
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = vouchers;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(voucher =>
                voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter && categoryFilter !== 'Tất cả') {
            filtered = filtered.filter(voucher => voucher.category === categoryFilter);
        }

        // Discount type filter
        if (discountTypeFilter && discountTypeFilter !== 'all') {
            filtered = filtered.filter(voucher => voucher.discountType === discountTypeFilter);
        }

        setFilteredVouchers(filtered);
    }, [searchTerm, categoryFilter, discountTypeFilter, vouchers]);

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value.trim()) {
            params.set('search', value.trim());
        } else {
            params.delete('search');
        }
        navigate(`/vouchers?${params.toString()}`);
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category !== 'Tất cả') {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        navigate(`/vouchers?${params.toString()}`);
    };

    const handleDiscountTypeChange = (discountType: string) => {
        const params = new URLSearchParams(searchParams);
        if (discountType !== 'all') {
            params.set('discountType', discountType);
        } else {
            params.delete('discountType');
        }
        navigate(`/vouchers?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-600">Đang tải voucher...</div>
                </div>
            </div>
        );
    }

    return (
        <Content>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 shadow-inner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Mã giảm giá</h1>
                        <Paragraph className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto mt-4">
                            Khám phá các ưu đãi hấp dẫn và tiết kiệm chi phí cho khóa học của bạn.
                        </Paragraph>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-8">
                            <SearchBar
                                placeholder="Tìm kiếm mã giảm giá..."
                                defaultValue={searchTerm}
                                onSearch={handleSearch}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Show search results info */}
                {searchTerm && (
                    <div className="mb-6 text-center">
                        <Text className="text-lg">
                            Kết quả tìm kiếm cho: <span className="font-semibold text-purple-600">"{searchTerm}"</span>
                        </Text>
                        <Text className="block text-slate-500 mt-1">
                            Tìm thấy {filteredVouchers.length} mã giảm giá
                        </Text>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <Title level={3} className="!mb-4 text-center sm:text-left">Bộ lọc mã giảm giá</Title>
                    <VoucherCategoryNav 
                      categories={categories} 
                      activeCategory={categoryFilter} 
                      onChange={handleCategoryChange} 
                    />
                    <Row gutter={[16, 16]} className="items-end">
                        <Col xs={24} sm={12} md={8} style={{ display: 'none' }}>
                            {/* Đã thay filter danh mục bằng nav, ẩn Select cũ */}
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div>
                                <Text strong className="text-gray-700 mb-2 block">Loại giảm giá</Text>
                                <DiscountTypeNav activeType={discountTypeFilter} onChange={handleDiscountTypeChange} />
                            </div>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <InfoCircleOutlined className="text-blue-500" />
                                    <Text strong className="text-gray-700">Mẹo sử dụng</Text>
                                </div>
                                <Text className="text-sm text-gray-600">
                                    • Sao chép mã và sử dụng khi thanh toán<br/>
                                    • Mỗi voucher chỉ sử dụng được 1 lần<br/>
                                    • Kiểm tra điều kiện sử dụng trước khi áp dụng
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </div>

                {error && <Alert message="Lỗi" description={error} type="error" showIcon className="mb-6" />}
                
                {!loading && !error && filteredVouchers.length === 0 && (
                    <Empty 
                        description={
                            searchTerm 
                                ? `Không tìm thấy mã giảm giá nào cho "${searchTerm}"` 
                                : "Không có mã giảm giá nào trong danh mục này."
                        }
                        className="my-16"
                    />
                )}

                {/* Vouchers Grid */}
                <Row gutter={[24, 24]}>
                    <AnimatePresence mode="wait">
                        {filteredVouchers.map((voucher, idx) => (
                            <Col xs={24} sm={12} md={8} lg={8} key={voucher.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                                >
                                    <VoucherCard voucher={voucher} categories={categories} />
                                </motion.div>
                            </Col>
                        ))}
                    </AnimatePresence>
                </Row>
            </div>
        </Content>
    );
};

export default VouchersPage;

<style>
{`
  .vip-glow {
    display: inline-block;
    color: #fff700;
    font-weight: bold;
    font-size: 18px;
    letter-spacing: 1px;
    text-shadow:
      0 0 6px #fff700,
      0 0 12px #fff700,
      0 0 18px #fff700,
      0 0 24px #fff700;
    background: linear-gradient(90deg, #fff700 60%, #fff 100%);
    border-radius: 4px;
    padding: 0 6px;
    margin-left: 4px;
  }
`}
</style>

