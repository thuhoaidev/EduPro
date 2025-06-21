import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Input, Select, Card, Tag, Typography, Badge, message, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, CopyOutlined, FireOutlined, ClockCircleOutlined, GiftOutlined, StarOutlined } from '@ant-design/icons';

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
    isExpired: boolean;
    daysLeft: number;
}

const mockVouchers: Voucher[] = [
    {
        id: '1',
        code: 'WELCOME50',
        title: 'Giảm 50% cho người mới',
        description: 'Áp dụng cho tất cả khóa học, tối đa 500K',
        discount: 50,
        discountType: 'percentage',
        minAmount: 100000,
        maxDiscount: 500000,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        usageLimit: 1000,
        usedCount: 234,
        category: 'new-user',
        isActive: true,
        isHot: true,
        isNew: true,
        isExpired: false,
        daysLeft: 45
    },
    {
        id: '2',
        code: 'FLASH200K',
        title: 'Giảm 200K cho khóa học IT',
        description: 'Áp dụng cho khóa học Công nghệ thông tin',
        discount: 200000,
        discountType: 'fixed',
        minAmount: 500000,
        validFrom: '2024-01-01',
        validTo: '2024-06-30',
        usageLimit: 500,
        usedCount: 156,
        category: 'it-courses',
        isActive: true,
        isHot: true,
        isExpired: false,
        daysLeft: 12
    },
    {
        id: '3',
        code: 'SUMMER30',
        title: 'Giảm 30% mùa hè',
        description: 'Áp dụng cho tất cả khóa học',
        discount: 30,
        discountType: 'percentage',
        minAmount: 200000,
        maxDiscount: 300000,
        validFrom: '2024-06-01',
        validTo: '2024-08-31',
        usageLimit: 2000,
        usedCount: 892,
        category: 'seasonal',
        isActive: true,
        isExpired: false,
        daysLeft: 78
    },
    {
        id: '4',
        code: 'WEBDEV100K',
        title: 'Giảm 100K Web Development',
        description: 'Áp dụng cho khóa học Phát triển Web',
        discount: 100000,
        discountType: 'fixed',
        minAmount: 300000,
        validFrom: '2024-01-01',
        validTo: '2024-03-31',
        usageLimit: 300,
        usedCount: 298,
        category: 'web-dev',
        isActive: true,
        isExpired: true,
        daysLeft: -5
    },
    {
        id: '5',
        code: 'MOBILE25',
        title: 'Giảm 25% Mobile Development',
        description: 'Áp dụng cho khóa học Phát triển Mobile',
        discount: 25,
        discountType: 'percentage',
        minAmount: 400000,
        maxDiscount: 200000,
        validFrom: '2024-02-01',
        validTo: '2024-05-31',
        usageLimit: 800,
        usedCount: 445,
        category: 'mobile-dev',
        isActive: true,
        isExpired: false,
        daysLeft: 23
    },
    {
        id: '6',
        code: 'VIP500K',
        title: 'Giảm 500K cho VIP',
        description: 'Áp dụng cho khóa học cao cấp',
        discount: 500000,
        discountType: 'fixed',
        minAmount: 1000000,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        usageLimit: 100,
        usedCount: 23,
        category: 'vip',
        isActive: true,
        isNew: true,
        isExpired: false,
        daysLeft: 120
    }
];

const voucherCategories = ['Tất cả', 'Người mới', 'Khóa học IT', 'Theo mùa', 'Web Development', 'Mobile Development', 'VIP'];

const FilterSidebar = ({ setFilters }: { setFilters: (filters: {
    searchTerm: string;
    category: string;
    discountType: string;
}) => void }) => {
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
                        defaultValue="Tất cả"
                        className="w-full !mt-2"
                        onChange={value => setCategory(value)}
                    >
                        {voucherCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                    </Select>
                </div>
                <div>
                    <Text strong>Loại giảm giá</Text>
                    <Select
                        size="large"
                        defaultValue="all"
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

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success(`Đã sao chép mã ${code}!`);
    };

    const getCategoryName = (category: string) => {
        const categories: { [key: string]: string } = {
            'new-user': 'Người mới',
            'it-courses': 'Khóa học IT',
            'seasonal': 'Theo mùa',
            'web-dev': 'Web Development',
            'mobile-dev': 'Mobile Development',
            'vip': 'VIP'
        };
        return categories[category] || category;
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

    useEffect(() => {
        setVouchers(mockVouchers);
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
            const categoryMap: { [key: string]: string } = {
                'Người mới': 'new-user',
                'Khóa học IT': 'it-courses',
                'Theo mùa': 'seasonal',
                'Web Development': 'web-dev',
                'Mobile Development': 'mobile-dev',
                'VIP': 'vip'
            };
            const categoryValue = categoryMap[filters.category];
            if (categoryValue) {
                filtered = filtered.filter(voucher => voucher.category === categoryValue);
            }
        }

        // Filter by discount type
        if (filters.discountType !== 'all') {
            filtered = filtered.filter(voucher => voucher.discountType === filters.discountType);
        }

        setFilteredVouchers(filtered);
        setCurrentPage(1);
    }, [filters, vouchers]);

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
            <FilterSidebar setFilters={setFilters} />
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
                                    <VoucherCard key={voucher.id} voucher={voucher} />
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
