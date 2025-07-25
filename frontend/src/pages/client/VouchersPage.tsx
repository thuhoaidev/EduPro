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
import dayjs from 'dayjs';

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
                    const now = new Date();
                    let daysLeft = 0;
                    // Xác định loại voucher
                    if (voucher.type === 'new-user') {
                        const createdAt = new Date(voucher.createdAt);
                        daysLeft = 7 - Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    } else if (voucher.type === 'birthday') {
                        const createdAt = new Date(voucher.createdAt);
                        const anniversaryThisYear = new Date(now.getFullYear(), createdAt.getMonth(), createdAt.getDate());
                        let diffDays = Math.floor((now.getTime() - anniversaryThisYear.getTime()) / (1000 * 60 * 60 * 24));
                        if (diffDays < 0) diffDays = 0; // Nếu chưa đến ngày kỷ niệm năm nay
                        daysLeft = 30 - diffDays;
                    } else if (["first-order", "order-count", "order-value"].includes(voucher.type)) {
                        // Tạm thời dùng createdAt, nếu backend trả về ngày đủ điều kiện thì thay thế
                        const createdAt = new Date(voucher.createdAt);
                        daysLeft = 30 - Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    } else {
                        const endDate = new Date(voucher.endDate || '');
                        daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
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
                        statusMessage: voucher.statusMessage || '',
                        type: voucher.type
                    };
                });
                
                const conditionalTypes = ["new-user", "birthday", "first-order", "order-count", "order-value", "flash-sale"];
                const filteredVouchers = transformedVouchers.filter(voucher => {
                  if (conditionalTypes.includes(voucher.type)) {
                    // Ẩn voucher có điều kiện nếu hết lượt
                    return voucher.usedCount < voucher.usageLimit;
                  }
                  // Voucher không điều kiện luôn hiển thị, kể cả khi hết lượt
                  return true;
                });
                // Sắp xếp: voucher còn lượt lên trên, hết lượt xuống dưới
                const sortedVouchers = filteredVouchers.sort((a, b) => {
                  const aOut = a.usedCount >= a.usageLimit;
                  const bOut = b.usedCount >= b.usageLimit;
                  if (aOut === bOut) return 0;
                  return aOut ? 1 : -1;
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
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-inner py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex flex-col items-center gap-4">
                            <GiftOutlined className="text-6xl text-yellow-400 drop-shadow-lg animate-bounce" />
                            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Mã giảm giá</h1>
                            <Paragraph className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto mt-2">
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

                {/* Filters */}
              

                {error && <Alert message="Lỗi" description={error} type="error" showIcon className="mb-6" />}
                
                {!loading && !error && filteredVouchers.length === 0 && (
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
                        className="my-20"
                    />
                )}

                {/* Vouchers Grid */}
                <Row gutter={[24, 24]}>
                    <AnimatePresence mode="wait">
                        {filteredVouchers.map((voucher, idx) => (
                            <Col xs={24} sm={12} md={8} lg={8} key={voucher.id}>
                                <motion.div
                                    className={`bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border-2 ${voucher.type === 'vip' ? 'border-yellow-400 animate-pulse' : 'border-transparent'} group`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                                    whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(59,130,246,0.12)" }}
                                    onClick={() => { setSelectedVoucher(voucher); setIsModalOpen(true); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <GiftOutlined className="text-3xl text-pink-500 drop-shadow" />
                                        <span className="font-bold text-xl text-gray-900">{voucher.title}</span>
                                        {voucher.type === 'vip' && <span className="vip-glow ml-2">VIP</span>}
                                        {voucher.type === 'flash-sale' && <ThunderboltOutlined className="text-yellow-400 animate-bounce ml-2" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-extrabold text-gradient bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                                            {voucher.discountType === 'percentage' ? `${voucher.discount}%` : `${voucher.discount.toLocaleString()}₫`}
                                        </span>
                                        <span className="text-gray-500 text-sm">{voucher.discountType === 'percentage' ? 'Giảm' : 'Tiền mặt'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-mono text-blue-600">{voucher.code}</span>
                                        <Tooltip title="Sao chép mã">
                                            <Button shape="circle" icon={<CopyOutlined />} onClick={() => navigator.clipboard.writeText(voucher.code)} />
                                        </Tooltip>
                                    </div>
                                    {/* ... các thông tin khác ... */}
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
                  <GiftOutlined className="text-2xl text-pink-500" />
                  <span className="text-xl font-bold text-gradient bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
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

