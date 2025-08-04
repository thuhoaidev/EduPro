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
  Alert,
  Modal
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
import './VouchersPage.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
    type?: string; // Thêm trường type để phân biệt loại voucher
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
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherDisplay | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                const response = await voucherService.getAvailable();
                
                const transformedVouchers: VoucherDisplay[] = response.data.map((voucher: Voucher) => {
                    const now = dayjs.utc();
                    const start = voucher.startDate ? dayjs.utc(voucher.startDate) : null;
                    const end = voucher.endDate ? dayjs.utc(voucher.endDate) : null;
                    
                    // Tính daysLeft dựa trên endDate
                    let daysLeft = 0;
                    if (end) {
                        daysLeft = Math.ceil(end.diff(now, 'day'));
                    }
                    
                    // Kiểm tra trạng thái voucher (đồng bộ với backend)
                    const isActive = !(start && now.isBefore(start)) && 
                                   !(end && now.isAfter(end)) && 
                                   !(voucher.usedCount >= voucher.usageLimit);
                    
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
                        isActive: isActive,
                        isExpired: !isActive,
                        daysLeft: Math.max(0, daysLeft),
                        status: isActive ? 'available' : 'unavailable',
                        statusMessage: isActive ? 'Có thể sử dụng' : 'Không thể sử dụng',
                        type: voucher.type
                    };
                });
                
                const conditionalTypes = ["new-user", "birthday", "first-order", "order-count", "order-value", "flash-sale"];
                const filteredVouchers = transformedVouchers.filter(voucher => {
                    // Chỉ hiển thị voucher đang hoạt động
                    if (!voucher.isActive) return false;
                    
                    if (conditionalTypes.includes(voucher.type)) {
                        // Voucher có điều kiện: chỉ hiển thị nếu còn lượt sử dụng
                        return voucher.usedCount < voucher.usageLimit;
                    }
                    // Voucher không điều kiện: luôn hiển thị nếu đang hoạt động
                    return true;
                });
                
                // Sắp xếp: voucher còn nhiều ngày lên trên
                const sortedVouchers = filteredVouchers.sort((a, b) => {
                    return b.daysLeft - a.daysLeft;
                });
                setVouchers(sortedVouchers);
                setFilteredVouchers(sortedVouchers);
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
            <div className="vouchers-loading">
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
            <div className="vouchers-hero py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="vouchers-hero-content flex flex-col items-center gap-4">
                            <GiftOutlined className="hero-icon text-6xl text-yellow-400" />
                            <h1 className="hero-title text-5xl font-extrabold">Mã giảm giá</h1>
                            <Paragraph className="text-white text-lg md:text-xl max-w-3xl mx-auto mt-2">
                                Khám phá ưu đãi hấp dẫn, tiết kiệm chi phí cho khóa học của bạn!
                            </Paragraph>
                            <div className="max-w-2xl w-full mx-auto mt-6">
                                <SearchBar
                                    placeholder="Tìm kiếm mã giảm giá..."
                                    defaultValue={searchTerm}
                                    onSearch={handleSearch}
                                    className="rounded-full shadow-lg"
                                />
                            </div>
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

                {error && <Alert message="Lỗi" description={error} type="error" showIcon className="mb-6" />}
                
                {!loading && !error && filteredVouchers.length === 0 && (
                    <div className="vouchers-empty">
                        <Empty
                            description={
                                <div className="flex flex-col items-center">
                                    <GiftOutlined className="text-5xl text-gray-300 mb-2" />
                                    <span className="text-gray-400 text-lg font-medium">
                                        {searchTerm
                                            ? `Không tìm thấy mã giảm giá nào cho "${searchTerm}"`
                                            : "Không có mã giảm giá nào trong danh mục này."}
                                    </span>
                                </div>
                            }
                        />
                    </div>
                )}

                {/* Vouchers Grid */}
                <Row gutter={[24, 24]}>
                    <AnimatePresence mode="wait">
                        {filteredVouchers.map((voucher, idx) => (
                            <Col xs={24} sm={12} md={8} lg={8} key={voucher.id}>
                                <motion.div
                                    className={`voucher-card ${voucher.type === 'vip' ? 'vip' : ''} ${voucher.type === 'flash-sale' ? 'flash-sale' : ''}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => { setSelectedVoucher(voucher); setIsModalOpen(true); }}
                                >
                                    {/* Header */}
                                    <div className="voucher-header">
                                        <GiftOutlined className="voucher-icon" />
                                        <span className="voucher-title">{voucher.title}</span>
                                        {voucher.type === 'vip' && (
                                            <span className="voucher-badge vip">
                                                <CrownOutlined />
                                                VIP
                                            </span>
                                        )}
                                        {voucher.type === 'flash-sale' && (
                                            <span className="voucher-badge flash-sale">
                                                <ThunderboltOutlined />
                                                FLASH
                                            </span>
                                        )}
                                    </div>

                                    {/* Discount */}
                                    <div className="voucher-discount">
                                        <span className="discount-amount">
                                            {voucher.discountType === 'percentage' ? `${voucher.discount}%` : `${voucher.discount.toLocaleString()}₫`}
                                        </span>
                                        <span className="discount-type">
                                            {voucher.discountType === 'percentage' ? 'Giảm giá' : 'Giảm tiền mặt'}
                                        </span>
                                    </div>

                                    {/* Code Section */}
                                    <div className="voucher-code-section">
                                        <div className="voucher-code">
                                            <span>{voucher.code}</span>
                                            <Tooltip title="Sao chép mã">
                                                <button 
                                                    className="copy-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(voucher.code);
                                                        message.success('Đã sao chép mã!');
                                                    }}
                                                >
                                                    <CopyOutlined />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="voucher-details">
                                        <div className="detail-item">
                                            <DollarOutlined className="detail-icon" />
                                            <span>Áp dụng cho đơn từ {voucher.minAmount.toLocaleString()}₫</span>
                                        </div>
                                        {voucher.maxDiscount && (
                                            <div className="detail-item">
                                                <PercentageOutlined className="detail-icon" />
                                                <span>Tối đa {voucher.maxDiscount.toLocaleString()}₫</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <ClockCircleOutlined className="detail-icon" />
                                            <span>Còn {voucher.daysLeft} ngày</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="voucher-footer">
                                        <div className="usage-info">
                                            <span>Sử dụng:</span>
                                            <Progress 
                                                percent={Math.round((voucher.usedCount / voucher.usageLimit) * 100)} 
                                                size="small" 
                                                className="usage-progress"
                                                strokeColor={{
                                                    '0%': '#667eea',
                                                    '100%': '#764ba2',
                                                }}
                                            />
                                            <span>{voucher.usedCount}/{voucher.usageLimit}</span>
                                        </div>
                                        <div className="expiry-info">
                                            {voucher.daysLeft} ngày
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                        <span className={`status-badge ${voucher.isExpired ? 'expired' : voucher.usedCount >= voucher.usageLimit ? 'out-of-stock' : 'available'}`}>
                                            {voucher.isExpired ? 'Hết hạn' : voucher.usedCount >= voucher.usageLimit ? 'Hết lượt' : 'Khả dụng'}
                                        </span>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </AnimatePresence>
                </Row>
            </div>

            {/* Modal chi tiết voucher */}
            <Modal
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              title={
                <div className="flex items-center gap-3">
                                     <GiftOutlined className="text-2xl text-blue-500" />
                                     <span className="text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                     {selectedVoucher?.title || 'Chi tiết mã giảm giá'}
                   </span>
                </div>
              }
              centered
            >
              {selectedVoucher && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Mã:</span>
                    <Tooltip title="Sao chép mã">
                      <span
                        className="ml-2 font-mono bg-blue-50 px-3 py-1 rounded-lg text-lg text-blue-700 tracking-widest cursor-pointer select-all hover:bg-blue-100 transition"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedVoucher.code);
                          message.success('Đã sao chép mã!');
                        }}
                      >
                        {selectedVoucher.code}
                      </span>
                    </Tooltip>
                    <Button
                      shape="circle"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedVoucher.code);
                        message.success('Đã sao chép mã!');
                      }}
                    />
                  </div>
                  <Divider />
                  <div>
                    <span className="ml-2 text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block py-2">
                      {selectedVoucher.description || 'Không có mô tả.'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-semibold">Giảm giá:</span>
                      <span className="ml-2 text-blue-600 font-bold text-lg">
                        {selectedVoucher.discountType === 'percentage'
                          ? `${selectedVoucher.discount}%`
                          : `${selectedVoucher.discount.toLocaleString()}₫`}
                      </span>
                    </div>
                    {selectedVoucher.maxDiscount && (
                      <div>
                        <span className="font-semibold">Tối đa:</span>
                        <span className="ml-2">{selectedVoucher.maxDiscount.toLocaleString()}₫</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Áp dụng cho đơn từ:</span>
                    <span className="ml-2">{selectedVoucher.minAmount.toLocaleString()}₫</span>
                  </div>
                  <Divider />
                  <div className="flex gap-4 flex-wrap">
                    <div>
                      <span className="font-semibold">Hiệu lực:</span>
                      <span className="ml-2">
                        {dayjs(selectedVoucher.validFrom).format('DD/MM/YYYY')} - {dayjs(selectedVoucher.validTo).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${selectedVoucher.isExpired ? 'bg-gray-400' : 'bg-green-500'}`}>
                        {selectedVoucher.isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Số lượt sử dụng:</span>
                    <span className="ml-2">{selectedVoucher.usedCount}/{selectedVoucher.usageLimit}</span>
                  </div>
                </div>
              )}
            </Modal>
        </Content>
    );
};

export default VouchersPage;

