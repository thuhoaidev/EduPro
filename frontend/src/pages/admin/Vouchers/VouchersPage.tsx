import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Pagination,
  Popconfirm,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  message,
  Switch,
  Typography,
  Badge,
  Divider,
  Spin,
  DatePicker as AntdDatePicker,
} from 'antd';
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  TrophyOutlined,
  BookOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { motion } from 'framer-motion';

dayjs.extend(utc);
dayjs.extend(timezone);
import voucherService from '../../../services/voucher.service';
import type { Voucher, CreateVoucherData } from '../../../services/voucher.service';
import { getAllCategories } from '../../../services/categoryService';
import type { Category } from '../../../interfaces/Category.interface';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = AntdDatePicker;

// FilterSection component
interface FilterSectionProps {
  searchText: string;
  setSearchText: (value: string) => void;
  filterStatus: 'all' | 'active' | 'expired';
  setFilterStatus: (value: 'all' | 'active' | 'expired') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

const FilterSection = ({
  searchText,
  setSearchText,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
}: FilterSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px', 
          paddingBottom: '12px', 
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FilterOutlined style={{ color: '#667eea', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>Bộ lọc tìm kiếm</Text>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Tìm kiếm mã giảm giá..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ 
              minWidth: '250px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={value => setFilterStatus(value as 'all' | 'active' | 'expired')}
            style={{ 
              minWidth: '180px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "expired", label: "Đã hết hạn" },
            ]}
          />
          <Select
            value={sortOrder}
            onChange={value => setSortOrder(value as 'asc' | 'desc')}
            style={{ 
              minWidth: '180px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            options={[
              { value: "asc", label: "Giá trị tăng dần" },
              { value: "desc", label: "Giá trị giảm dần" },
            ]}
          />
        </div>
      </Card>
    </motion.div>
  );
};

// StatCards component
interface StatCardsProps {
  stats: {
    total: number;
    active: number;
    expired: number;
  };
}

const StatCards = ({ stats }: StatCardsProps) => {
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
  const expiredPercentage = stats.total > 0 ? (stats.expired / stats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng số mã</Text>} 
                  value={stats.total} 
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả mã giảm giá</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Đang hoạt động</Text>} 
                  value={stats.active} 
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{activePercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#ff4d4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CloseCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Đã hết hạn</Text>} 
                  value={stats.expired} 
                  valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{expiredPercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

const VouchersPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Voucher[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch data
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAll();
      if (response.success) {
        const vouchersWithNumber = response.data.map((voucher: Voucher, index: number) => ({
          ...voucher,
          number: index + 1,
        }));
        setData(vouchersWithNumber);
      } else {
        message.error('Lỗi khi lấy danh sách mã giảm giá');
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      message.error('Lỗi khi lấy danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    // Lấy danh mục khóa học
    const fetchCategories = async () => {
      const res = await getAllCategories();
      if (res.success) setCategories(res.data.filter(c => c.status === 'active'));
    };
    fetchCategories();
  }, []);

  const isVoucherActive = (voucher: Voucher) => {
    const now = dayjs.utc();
    const start = voucher.startDate ? dayjs.utc(voucher.startDate) : null;
    const end = voucher.endDate ? dayjs.utc(voucher.endDate) : null;
    
    // Kiểm tra startDate
    if (start && now.isBefore(start)) return false;
    // Kiểm tra endDate
    if (end && now.isAfter(end)) return false;
    // Kiểm tra usageLimit
    if (voucher.usedCount >= voucher.usageLimit) return false;
    
    return true;
  };

  // Lọc theo tìm kiếm và trạng thái
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchText.toLowerCase());
    const isActive = isVoucherActive(item);
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'expired' && !isActive);

    return matchesSearch && matchesStatus;
  });

  // Sắp xếp theo giá trị giảm tối đa
  const sortedData = [...filteredData].sort((a, b) =>
    sortOrder === 'asc'
      ? (a.maxDiscount || 0) - (b.maxDiscount || 0)
      : (b.maxDiscount || 0) - (a.maxDiscount || 0)
  ).map((item, index) => ({
    ...item,
    number: index + 1
  }));

  const showAddModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minOrderValue: 0,
      usageLimit: 1,
      usedCount: 0,
      categories: [],
      tags: [],
      startDate: dayjs(),
      endDate: null,
      type: 'default',
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Voucher) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      title: record.title,
      description: record.description,
      discountType: record.discountType,
      discountValue: record.discountValue,
      maxDiscount: record.maxDiscount,
      minOrderValue: record.minOrderValue,
      usageLimit: record.usageLimit,
      usedCount: record.usedCount,
      categories: record.categories || [],
      tags: record.tags || [],
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
      type: record.type || 'default',
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert ngày Việt Nam sang UTC
      const convertToUTC = (date: dayjs.Dayjs) => {
        // Nếu user chọn 2025-11-20, thì convert thành 2025-11-19T17:00:00.000Z (0h VN = 17h UTC ngày trước)
        return date.tz('Asia/Ho_Chi_Minh').startOf('day').utc().format();
      };
      
      const voucherData: CreateVoucherData = {
        code: values.code,
        title: values.title || '',
        description: values.description || '',
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount || 0,
        minOrderValue: values.minOrderValue || 0,
        usageLimit: values.usageLimit,
        usedCount: values.usedCount || 0,
        categories: values.categories || [],
        tags: values.tags || [],
        startDate: values.startDate ? convertToUTC(values.startDate) : convertToUTC(dayjs()),
        endDate: values.endDate ? convertToUTC(values.endDate) : undefined,
      };
      if (editingVoucher) {
        const response = await voucherService.update(editingVoucher.id, voucherData);
        if (response.success) {
          message.success('Cập nhật mã giảm giá thành công');
          fetchVouchers();
        } else {
          message.error('Lỗi khi cập nhật mã giảm giá');
        }
      } else {
        const response = await voucherService.create(voucherData);
        if (response.success) {
          message.success('Tạo mã giảm giá thành công');
          fetchVouchers();
        } else {
          message.error('Lỗi khi tạo mã giảm giá');
        }
      }
      setIsModalVisible(false);
      setEditingVoucher(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving voucher:', error);
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await voucherService.delete(id);
      if (response.success) {
        message.success('Đã xóa mã giảm giá');
        fetchVouchers();
      } else {
        message.error('Lỗi khi xóa mã giảm giá');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      message.error('Lỗi khi xóa mã giảm giá');
    }
  };

  // Calculate statistics
  const stats = {
    total: data.length,
    active: data.filter(c => isVoucherActive(c)).length,
    expired: data.filter(c => !isVoucherActive(c)).length,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus]);

  const showDetailModal = (record: Voucher) => {
    setSelectedVoucher(record);
    setIsDetailModalVisible(true);
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 70,
      align: 'center' as const,
      render: (number: number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      align: 'center' as const,
      render: (code: string, record: Voucher) => (
        <Button 
          type="link" 
          onClick={() => showDetailModal(record)}
          className="p-0 font-medium text-blue-600 hover:text-blue-800"
          style={{ fontSize: 14, wordBreak: 'break-all', whiteSpace: 'normal', padding: 0 }}
        >
          {code}
        </Button>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      align: 'left' as const,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 500 }}>{title}</span>
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 120,
      align: 'center' as const,
      render: (value: number, record: Voucher) =>
        <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 13 }}>
          {record.discountType === 'percentage'
            ? `${value}%`
            : `${value.toLocaleString('vi-VN')} VNĐ`}
        </span>,
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
      width: 120,
      align: 'center' as const,
      render: (max: number) => max ? `${max.toLocaleString('vi-VN')} VNĐ` : '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
      width: 100,
      align: 'center' as const,
      render: (limit: number, record: Voucher) => `${record.usedCount} / ${limit}`
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      align: 'center' as const,
      render: (_: void, record: Voucher) => {
        const isActive = isVoucherActive(record);
        const isOutOfUsage = record.usedCount >= record.usageLimit;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {isActive && !isOutOfUsage ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            )}
            <span style={{ fontSize: 13, color: isActive && !isOutOfUsage ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
              {isOutOfUsage ? 'Đã hết lượt' : (isActive ? 'Đang hoạt động' : 'Đã hết hạn')}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      width: 120,
      render: (_: void, record: Voucher) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              type="text"
              onClick={() => showDetailModal(record)}
              style={{ color: '#1677ff', fontSize: 16 }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showEditModal(record)}
              style={{ color: '#1677ff', fontSize: 16 }}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                type="text"
                danger
                style={{ fontSize: 16 }}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              padding: '80px 24px'
            }}
          >
            <Spin size="large" />
            <Text style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  Quản lý mã giảm giá
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Tạo và quản lý các mã giảm giá cho khóa học
                </Paragraph>
              </div>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={showAddModal}
                style={{ 
                  borderRadius: '8px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                size="large"
              >
                Tạo mã giảm giá
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <StatCards stats={stats} />

        {/* Filter Section */}
        <FilterSection
          searchText={searchText}
          setSearchText={setSearchText}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Vouchers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách mã giảm giá
                </Title>
                <Badge count={sortedData.length} showZero style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} của {sortedData.length} mã giảm giá
                </Text>
              </div>
            </div>
            
            <Table
              columns={columns}
              dataSource={sortedData}
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: sortedData.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mã giảm giá`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: 'small',
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 15);
                },
              }}
              rowKey="id"
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 1000 }}
              size="small"
            />
          </Card>
        </motion.div>

        {/* Add/Edit Modal */}
        <Modal
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EditOutlined style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div>
                <Text strong style={{ fontSize: '20px', color: '#1a1a1a' }}>
                  {editingVoucher ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {editingVoucher ? 'Cập nhật thông tin mã giảm giá' : 'Thêm mã giảm giá mới vào hệ thống'}
                  </Text>
                </div>
              </div>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingVoucher(null);
            form.resetFields();
          }}
          okText={editingVoucher ? 'Lưu thay đổi' : 'Tạo mã'}
          cancelText="Hủy"
          destroyOnHidden
          centered
          width={700}
          style={{ borderRadius: '20px' }}
          okButtonProps={{
            style: {
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
              fontWeight: '500'
            }
          }}
          cancelButtonProps={{
            style: {
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px'
            }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ padding: '20px 0' }}
            initialValues={{
              discountType: 'percentage',
              discountValue: 0,
              maxDiscount: 0,
              minOrderValue: 0,
              usageLimit: 1,
              usedCount: 0,
              categories: [],
              tags: [],
              courseId: 'all',
            }}
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Mã giảm giá</Text>}
                  name="code"
                  rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input 
                    placeholder="Nhập mã giảm giá" 
                    maxLength={20} 
                    disabled={!!editingVoucher} 
                    style={{ 
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Loại giảm giá</Text>}
                  name="discountType" 
                  rules={[{ required: true }]} 
                  style={{ marginBottom: '20px' }}
                >
                  <Select style={{ 
                    borderRadius: '10px', 
                    height: '44px',
                    border: '1px solid #d9d9d9',
                    fontSize: '14px'
                  }}>
                    <Option value="fixed">Số tiền (VNĐ)</Option>
                    <Option value="percentage">Phần trăm (%)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Tiêu đề</Text>}
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input 
                maxLength={100} 
                placeholder="Nhập tiêu đề cho mã giảm giá" 
                style={{ 
                  borderRadius: '10px',
                  height: '44px',
                  border: '1px solid #d9d9d9',
                  fontSize: '14px'
                }} 
              />
            </Form.Item>

            <Form.Item
              label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Mô tả</Text>}
              name="description"
              style={{ marginBottom: '20px' }}
            >
              <Input.TextArea 
                maxLength={200} 
                rows={3} 
                placeholder="Nhập mô tả chi tiết cho mã giảm giá..." 
                style={{ 
                  borderRadius: '10px',
                  border: '1px solid #d9d9d9',
                  fontSize: '14px',
                  resize: 'none'
                }} 
              />
            </Form.Item>

            <Form.Item
              label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Danh mục áp dụng</Text>}
              name="categories"
              style={{ marginBottom: '20px' }}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn danh mục áp dụng"
                style={{ 
                  borderRadius: '10px',
                  border: '1px solid #d9d9d9',
                  fontSize: '14px'
                }}
                options={[
                  { value: 'all', label: 'Tất cả danh mục' },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
              />
            </Form.Item>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Giá trị giảm</Text>}
                  name="discountValue"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị giảm' },
                    { type: 'number', min: 0, message: 'Giá trị không thể âm' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const type = getFieldValue('discountType');
                        if (type === 'percentage') {
                          if (value < 1) return Promise.reject('Phần trăm giảm phải lớn hơn hoặc bằng 1%');
                          if (value > 100) return Promise.reject('Phần trăm giảm không được vượt quá 100%');
                        } else if (type === 'fixed') {
                          if (value < 10000) return Promise.reject('Giá trị giảm phải lớn hơn hoặc bằng 10,000 VNĐ');
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <InputNumber<number>
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                    min={0}
                    placeholder="Nhập giá trị giảm"
                    formatter={(value) => {
                      if (value === null || value === undefined) return '';
                      const type = form.getFieldValue('discountType');
                      return type === 'percentage' ? `${value}%` : `${value} VNĐ`;
                    }}
                    parser={(value) => {
                      if (!value) return 0;
                      return Number(value.replace('%', '').replace(' VNĐ', '').replace(/,/g, ''));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Giảm tối đa</Text>}
                  name="maxDiscount"
                  rules={[
                    { type: 'number', min: 0, message: 'Giá trị không thể âm' },
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <InputNumber<number>
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                    min={0}
                    placeholder="Nhập giá trị giảm tối đa"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Đơn tối thiểu</Text>}
                  name="minOrderValue"
                  rules={[
                    { type: 'number', min: 0, message: 'Giá trị không thể âm' },
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <InputNumber
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                    min={0}
                    placeholder="Nhập đơn tối thiểu"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Số lượng</Text>}
                  name="usageLimit"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng' },
                    { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <InputNumber 
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }} 
                    min={1} 
                    placeholder="Nhập số lượng" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Loại voucher</Text>} 
                  name="type" 
                  rules={[{ required: true, message: 'Vui lòng chọn loại voucher!' }]} 
                  style={{ marginBottom: '20px' }}
                > 
                  <Select 
                    placeholder="Chọn loại voucher" 
                    style={{ 
                      borderRadius: '10px', 
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                  >
                    <Select.Option value="default">Mặc định</Select.Option>
                    <Select.Option value="new-user">Người dùng mới</Select.Option>
                    <Select.Option value="birthday">Sinh nhật</Select.Option>
                    <Select.Option value="first-order">Đơn hàng đầu tiên</Select.Option>
                    <Select.Option value="order-count">Theo số lượng đơn hàng</Select.Option>
                    <Select.Option value="order-value">Theo giá trị đơn hàng</Select.Option>
                    <Select.Option value="flash-sale">Khuyến mãi nhanh</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày tạo</Text>} 
                  name="startDate" 
                  rules={[{ required: true }]} 
                  style={{ marginBottom: '20px' }}
                >
                  <DatePicker
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                    disabled
                    format="DD/MM/YYYY"
                    placeholder="Ngày tạo"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày hết hạn</Text>} 
                  name="endDate" 
                  style={{ marginBottom: '20px' }}
                >
                  <DatePicker 
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      height: '44px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }} 
                    format="DD/MM/YYYY" 
                    placeholder="Chọn ngày hết hạn (Không bắt buộc)"
                    disabledDate={current => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Tags</Text>} 
                  name="tags" 
                  style={{ marginBottom: '20px' }}
                >
                  <Select
                    mode="tags"
                    style={{ 
                      width: '100%',
                      borderRadius: '10px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px'
                    }}
                    placeholder="Thêm tags (nhấn Enter để thêm)"
                    tokenSeparators={[',']}
                  >
                    <Select.Option value="new-user">Người dùng mới</Select.Option>
                    <Select.Option value="birthday">Sinh nhật</Select.Option>
                    <Select.Option value="first-order">Đơn hàng đầu tiên</Select.Option>
                    <Select.Option value="order-count">Theo số lượng đơn hàng</Select.Option>
                    <Select.Option value="order-value">Theo giá trị đơn hàng</Select.Option>
                    <Select.Option value="flash-sale">Khuyến mãi nhanh</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EyeOutlined style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div>
                <Text strong style={{ fontSize: '20px', color: '#1a1a1a' }}>
                  Chi tiết mã giảm giá
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Xem thông tin chi tiết mã giảm giá
                  </Text>
                </div>
              </div>
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            setSelectedVoucher(null);
          }}
          footer={null}
          width={600}
          centered
          style={{ borderRadius: '20px' }}
        >
          {selectedVoucher && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ padding: '16px 0' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '20px',
                backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <Title level={3} style={{ margin: 0, color: '#1a1a1a', fontSize: '24px' }}>
                    {selectedVoucher.code}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px', marginTop: '8px', display: 'block' }}>
                    {selectedVoucher.title}
                  </Text>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {isVoucherActive(selectedVoucher) ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  )}
                  <span style={{ 
                    fontSize: '14px', 
                    color: isVoucherActive(selectedVoucher) ? '#52c41a' : '#ff4d4f', 
                    fontWeight: '600' 
                  }}>
                    {isVoucherActive(selectedVoucher) ? 'Đang hoạt động' : 'Đã hết hạn'}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '20px',
                marginBottom: '24px'
              }}>
                <Card 
                  style={{ 
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    boxShadow: 'none'
                  }} 
                  bordered={false}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Thông tin giảm giá</Text>
                  </div>
                  
                  <div style={{ paddingLeft: '44px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Loại giảm giá:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                          {selectedVoucher.discountType === 'fixed' ? '💵 Số tiền cố định' : '🎯 Phần trăm'}
                        </Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Giá trị giảm:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontWeight: '600', color: '#1677ff', fontSize: '16px' }}>
                          {selectedVoucher.discountType === 'percentage'
                            ? `${selectedVoucher.discountValue}%`
                            : `${selectedVoucher.discountValue.toLocaleString('vi-VN')} VNĐ`}
                        </Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Giảm tối đa:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {selectedVoucher.maxDiscount ? `${selectedVoucher.maxDiscount.toLocaleString('vi-VN')} VNĐ` : 'Không giới hạn'}
                        </Text>
                      </div>
                    </div>
                    
                    <div>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Đơn tối thiểu:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {selectedVoucher.minOrderValue && selectedVoucher.minOrderValue > 0
                            ? `${selectedVoucher.minOrderValue.toLocaleString('vi-VN')} VNĐ`
                            : '0 VNĐ'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card 
                  style={{ 
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    boxShadow: 'none'
                  }} 
                  bordered={false}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#52c41a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BookOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Thông tin sử dụng</Text>
                  </div>
                  
                  <div style={{ paddingLeft: '44px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Đã sử dụng / Số lượng:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                          <span style={{ color: '#ff4d4f' }}>{selectedVoucher.usedCount}</span> / <span style={{ color: '#52c41a' }}>{selectedVoucher.usageLimit}</span>
                        </Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Loại voucher:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {selectedVoucher.type || 'default'}
                        </Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Ngày bắt đầu:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {dayjs(selectedVoucher.startDate).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    </div>
                    
                    <div>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Ngày kết thúc:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {selectedVoucher.endDate ? dayjs(selectedVoucher.endDate).format('DD/MM/YYYY') : 'Không giới hạn'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card 
                style={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  boxShadow: 'none',
                  marginBottom: '24px'
                }} 
                bordered={false}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#722ed1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOutlined style={{ color: 'white', fontSize: '16px' }} />
                  </div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Thông tin bổ sung</Text>
                </div>
                
                <div style={{ paddingLeft: '44px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Mô tả:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px' }}>
                        {selectedVoucher.description || 'Không có mô tả'}
                      </Text>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Danh mục áp dụng:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '14px' }}>
                        {selectedVoucher.categories && selectedVoucher.categories.length > 0
                          ? selectedVoucher.categories
                              .map(cid => {
                                if (cid === 'all') return 'Tất cả danh mục';
                                const cat = categories.find(c => c._id === cid);
                                return cat ? cat.name : cid;
                              })
                              .join(', ')
                          : 'Tất cả danh mục'}
                      </Text>
                    </div>
                  </div>
                  
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Tags:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {selectedVoucher.tags && selectedVoucher.tags.length > 0
                        ? selectedVoucher.tags.map((tag, index) => (
                            <Tag 
                              key={index} 
                              color="blue" 
                              style={{ 
                                marginRight: '8px', 
                                marginBottom: '8px',
                                borderRadius: '6px',
                                padding: '4px 8px'
                              }}
                            >
                              {tag}
                            </Tag>
                          ))
                        : <Text type="secondary" style={{ fontSize: '14px' }}>Không có tags</Text>}
                    </div>
                  </div>
                </div>
              </Card>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px', 
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Button 
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    showEditModal(selectedVoucher);
                  }}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    fontSize: '14px'
                  }}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => setIsDetailModalVisible(false)}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    fontSize: '14px'
                  }}
                >
                  Đóng
                </Button>
              </div>
            </motion.div>
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default VouchersPage;
