import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, message, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, CopyOutlined, FireOutlined, ClockCircleOutlined, GiftOutlined, StarOutlined, CrownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../interfaces/Category.interface';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

interface Voucher {
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
    isHot?: boolean;
    isNew?: boolean;
    isVipOnly?: boolean;
    isExpired: boolean;
    daysLeft: number;
}

const voucherCategories = ['Tất cả', 'Người mới', 'Khóa học IT', 'Theo mùa', 'Web Development', 'Mobile Development', 'VIP'];

const FilterSidebar = ({ setFilters, categories }: {
    setFilters: (filters: {
        searchTerm: string;
        category: string;
        discountType: string;
    }) => void,
    categories: Category[]
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Tất cả');
    const [discountType, setDiscountType] = useState('all');

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ searchTerm, category, discountType });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, category, discountType, setFilters]);

    return (
        <Sider width={280} className="bg-white p-6" theme="light" style={{
            position: 'sticky',
            top: 68,
            height: 'calc(100vh - 68px)',
            overflowY: 'auto'
        }}>
            <Title level={4} className="!mb-6"><FilterOutlined className="mr-2" />Bộ lọc mã giảm giá</Title>
            
            <div className="space-y-6">
                <div>
                    <Text strong>Tìm kiếm</Text>
                    <Input
                        size="large"
                        placeholder="Tên hoặc mã voucher..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="!mt-2"
                    />
                </div>
                <div>
                    <Text strong>Danh mục</Text>
                    <Select
                        size="large"
                        value={category}
                        className="w-full !mt-2"
                        onChange={value => setCategory(value)}
                    >
                        <Option key="all" value="Tất cả">Tất cả</Option>
                        <Option key="isNew" value="isNew">Mới</Option>
                        <Option key="isHot" value="isHot">HOT</Option>
                        <Option key="isVipOnly" value="isVipOnly">VIP Only</Option>
                        {categories.map(cat => (
                            <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Text strong>Loại giảm giá</Text>
                    <Select
                        size="large"
                        value={discountType}
                        className="w-full !mt-2"
                        onChange={value => setDiscountType(value)}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="percentage">Giảm theo phần trăm</Option>
                        <Option value="fixed">Giảm cố định</Option>
                    </Select>
                </div>
            </div>
        </Sider>
    );
};

const VoucherCard = ({ voucher, categories }: { voucher: Voucher, categories: Category[] }) => {
    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success(`Đã sao chép mã ${code}!`);
    };

    const getCategoryName = (categoryId: string) => {
        if (!categoryId || categoryId === 'Tất cả') return 'Tất cả';
        const cat = categories.find(c => c._id === categoryId);
        return cat ? cat.name : 'Tất cả';
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'new-user': 'blue',
            'it-courses': 'green',
            'seasonal': 'orange',
            'web-dev': 'purple',
            'mobile-dev': 'cyan',
            'vip': 'gold'
        };
        return colors[category] || 'default';
    };

    const formatDiscount = (voucher: Voucher) => {
        if (voucher.discountType === 'percentage') {
            return `${voucher.discount}%`;
        }
        return `${voucher.discount.toLocaleString()}đ`;
    };

    return (
        <motion.div
            className="h-full"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className={`h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    voucher.isExpired ? 'opacity-60' : ''
                }`}
                styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 } }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag color={getCategoryColor(voucher.category)}>
                                {getCategoryName(voucher.category)}
                            </Tag>
                            {voucher.isHot && (
                                <Badge count={<FireOutlined style={{ color: '#ff4d4f' }} />} />
                            )}
                            {voucher.isNew && (
                                <Badge count={<StarOutlined style={{ color: '#faad14' }} />} />
                            )}
                            {voucher.isVipOnly && (
                                <span className="vip-glow" title="VIP Only">VIP</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {voucher.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {voucher.description}
                        </p>
                    </div>
                </div>

                {/* Discount Display */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatDiscount(voucher)}
                    </div>
                    <div className="text-white text-sm opacity-90">
                        Giảm giá
                    </div>
                </div>

                {/* Code Section */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <code className="text-lg font-mono font-bold text-gray-800">
                            {voucher.code}
                        </code>
                        <motion.button
                            onClick={() => copyToClipboard(voucher.code)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <CopyOutlined />
                        </motion.button>
                    </div>
                </div>

                <div className="flex-grow space-y-4 flex flex-col">
                    {/* Details */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Điều kiện:</span>
                            <span className="font-medium">Từ {voucher.minAmount.toLocaleString()}đ</span>
                        </div>
                        {voucher.maxDiscount && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Tối đa:</span>
                                <span className="font-medium">{voucher.maxDiscount.toLocaleString()}đ</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Đã sử dụng:</span>
                            <span className="font-medium">{voucher.usedCount}/{voucher.usageLimit}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-0">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Tiến độ sử dụng</span>
                            <span>{Math.round((voucher.usedCount / voucher.usageLimit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Expiry Info */}
                <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        <ClockCircleOutlined />
                        <span>
                            {voucher.isExpired 
                                ? 'Đã hết hạn' 
                                : `Còn ${voucher.daysLeft} ngày`
                            }
                        </span>
                    </div>
                    {voucher.isExpired && (
                        <Tag color="red">Hết hạn</Tag>
                    )}
                </div>

                {/* Action Button */}
                <motion.button
                    className={`w-full mt-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        voucher.isExpired
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                    disabled={voucher.isExpired}
                    whileHover={!voucher.isExpired ? { scale: 1.02 } : {}}
                    whileTap={!voucher.isExpired ? { scale: 0.98 } : {}}
                >
                    {voucher.isExpired ? 'Đã hết hạn' : 'Sử dụng ngay'}
                </motion.button>
            </Card>
        </motion.div>
    );
};

const VouchersPage = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'Tất cả',
        discountType: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const vouchersPerPage = 6;
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        // Fetch vouchers from backend
        axios.get('/api/vouchers').then(res => {
            if (res.data && res.data.data) {
                const mapped = res.data.data.map((v: any) => ({
                    id: v.id || v._id,
                    code: v.code,
                    title: v.title,
                    description: v.description,
                    discount: v.discountValue,
                    discountType: v.discountType,
                    minAmount: v.minOrderValue,
                    maxDiscount: v.maxDiscount,
                    validFrom: v.startDate,
                    validTo: v.endDate,
                    usageLimit: v.usageLimit,
                    usedCount: v.usedCount,
                    category: v.categories && v.categories.length > 0 ? v.categories[0] : 'Tất cả',
                    isActive: !v.endDate || new Date(v.endDate) > new Date(),
                    isHot: v.isHot,
                    isNew: v.isNew,
                    isVipOnly: v.isVipOnly,
                    isExpired: v.endDate ? new Date(v.endDate) < new Date() : false,
                    daysLeft: v.endDate ? Math.max(0, Math.ceil((new Date(v.endDate).getTime() - Date.now()) / (1000*60*60*24))) : 999
                }));
                setVouchers(mapped);
            }
        }).catch(() => {
            setVouchers([]);
        });
        // Lấy danh mục thật
        getAllCategories().then(res => {
            if (res.success) setCategories(res.data.filter(c => c.status === 'active'));
        });
    }, []);

    useEffect(() => {
        let filtered = vouchers;

        // Filter by search term
        if (filters.searchTerm) {
            filtered = filtered.filter(voucher =>
                voucher.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                voucher.code.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                voucher.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filters.category !== 'Tất cả') {
            if (filters.category === 'isNew') {
                filtered = filtered.filter(voucher => voucher.isNew);
            } else if (filters.category === 'isHot') {
                filtered = filtered.filter(voucher => voucher.isHot);
            } else if (filters.category === 'isVipOnly') {
                filtered = filtered.filter(voucher => voucher.isVipOnly);
            } else {
                filtered = filtered.filter(voucher => voucher.category === filters.category);
            }
        }

        // Filter by discount type
        if (filters.discountType !== 'all') {
            filtered = filtered.filter(voucher => voucher.discountType === filters.discountType);
        }

        setFilteredVouchers(filtered);
        setCurrentPage(1);
    }, [filters, vouchers, categories]);

    const paginatedVouchers = filteredVouchers.slice((currentPage - 1) * vouchersPerPage, currentPage * vouchersPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <Layout>
            <FilterSidebar setFilters={setFilters} categories={categories} />
            <Content className="p-8 bg-gray-50 min-h-screen">
                <motion.div
                    className="w-full"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Vouchers Grid */}
                    {filteredVouchers.length > 0 ? (
                        <>
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                            >
                                {paginatedVouchers.map((voucher) => (
                                    <VoucherCard key={voucher.id} voucher={voucher} categories={categories} />
                                ))}
                            </motion.div>
                            <motion.div className="text-center mt-8" variants={cardVariants}>
                                <Pagination
                                    current={currentPage}
                                    total={filteredVouchers.length}
                                    pageSize={vouchersPerPage}
                                    onChange={page => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </motion.div>
                        </>
                    ) : (
                        <motion.div 
                            className="text-center py-12"
                            variants={cardVariants}
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GiftOutlined className="text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Không tìm thấy mã giảm giá
                            </h3>
                            <p className="text-gray-600">
                                Thử thay đổi từ khóa tìm kiếm hoặc danh mục khác
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </Content>
        </Layout>
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
