import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Dropdown,
  Menu,
  Pagination,
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Badge,
  Tooltip,
  Divider,
  Spin,
  DatePicker,
  Space,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  CaretDownOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  BookOutlined,
  FilterOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

dayjs.locale('vi');

interface Transaction {
  key: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  courseName: string;
  transactionDate: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount?: number;
  voucher?: string;
  number?: number;
}

// FilterSection component
interface FilterSectionProps {
  searchText: string;
  setSearchText: (value: string) => void;
  minAmount: number | null;
  setMinAmount: (value: number | null) => void;
  maxAmount: number | null;
  setMaxAmount: (value: number | null) => void;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (value: 'asc' | 'desc' | null) => void;
  dateRange: any;
  setDateRange: (dates: any) => void;
}

const FilterSection = ({
  searchText,
  setSearchText,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  sortOrder,
  setSortOrder,
  dateRange,
  setDateRange,
}: FilterSectionProps) => {
  const sortMenu = {
    items: [
      { key: 'asc', label: 'Giá tăng dần' },
      { key: 'desc', label: 'Giá giảm dần' },
    ],
    onClick: ({ key }: { key: string }) => setSortOrder(key as 'asc' | 'desc'),
  };

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
            placeholder="Tìm ID đơn hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ 
              minWidth: '200px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            allowClear
          />
          <Input
            placeholder="Giá tối thiểu"
            type="number"
            value={minAmount ?? ''}
            onChange={e => setMinAmount(e.target.value ? +e.target.value : null)}
            style={{ 
              minWidth: '150px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            prefix={<DollarOutlined />}
          />
          <Input
            placeholder="Giá tối đa"
            type="number"
            value={maxAmount ?? ''}
            onChange={e => setMaxAmount(e.target.value ? +e.target.value : null)}
            style={{ 
              minWidth: '150px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            prefix={<DollarOutlined />}
          />
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => setDateRange(dates)}
            style={{ 
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            format="DD/MM/YYYY"
            value={dateRange}
          />
          <Dropdown menu={sortMenu}>
            <Button 
              style={{ 
                borderRadius: '8px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FilterOutlined />
              Sắp xếp: {sortOrder === 'asc' ? 'Tăng' : sortOrder === 'desc' ? 'Giảm' : 'Không'}
              <CaretDownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Card>
    </motion.div>
  );
};

// StatCards component
interface StatCardsProps {
  transactionStats: {
    total: number;
    totalAmount: number;
    paidCount: number;
    pendingCount: number;
  };
}

const StatCards = ({ transactionStats }: StatCardsProps) => {
  const paidPercentage = transactionStats.total > 0 ? (transactionStats.paidCount / transactionStats.total) * 100 : 0;
  const pendingPercentage = transactionStats.total > 0 ? (transactionStats.pendingCount / transactionStats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }} justify="center">
        <Col xs={24} sm={12} md={6}>
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
                <ShoppingCartOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng giao dịch</Text>} 
                  value={transactionStats.total} 
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả đơn hàng</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
                <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng doanh thu</Text>} 
                  value={transactionStats.totalAmount} 
                  suffix="đ"
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tổng tiền</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Đã thanh toán</Text>} 
                  value={transactionStats.paidCount} 
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{paidPercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
                backgroundColor: '#faad14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic 
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Chờ thanh toán</Text>} 
                  value={transactionStats.pendingCount} 
                  valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#faad14' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{pendingPercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

const TransactionHistory = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [ordersRaw, setOrdersRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [dateRange, setDateRange] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    totalAmount: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  const fetchOrders = useCallback(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        console.log('TransactionHistory userRole:', userRole);
        const endpoint = userRole === 'admin'
          ? 'http://localhost:5000/api/orders/all?page=1&pageSize=100'
          : 'http://localhost:5000/api/orders?page=1&pageSize=100';
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orders = res.data.data?.orders || res.data.orders || res.data.data || [];
        setOrdersRaw(orders);

        const formatted = orders.map((order: any, idx: number): Transaction => ({
          key: (order._id || order.id || '') + '_' + idx,
          orderId: order._id || order.id || '',
          buyerName: order.fullName,
          buyerEmail: order.email,
          courseName: (order.items || []).map((i: any) => i.courseId?.title || 'Không rõ').join(', '),
          transactionDate: dayjs(order.createdAt).format('HH:mm DD/MM/YYYY'),
          status: order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                  order.paymentStatus === 'pending' ? 'Chưa thanh toán' : order.paymentStatus,
          paymentMethod: order.paymentMethod || '',
          totalAmount: order.totalAmount ?? 0,
          discountAmount: order.discountAmount ?? 0,
          finalAmount: order.finalAmount ?? order.totalAmount ?? 0,
          voucher: order.voucherId?.title || order.voucherId?.code || order.voucherId || '',
        number: idx + 1,
        }));

      setAllData(formatted);
        setData(formatted);

      // Calculate stats
      const stats = {
        total: formatted.length,
        totalAmount: formatted.reduce((sum, item) => sum + item.totalAmount, 0),
        paidCount: formatted.filter(item => item.status === 'Đã thanh toán').length,
        pendingCount: formatted.filter(item => item.status === 'Chưa thanh toán').length,
      };
      setTransactionStats(stats);
      } catch (err) {
        setData([]);
      setAllData([]);
      } finally {
        setLoading(false);
      }
  }, []);

  // Initial fetch and realtime updates
  useEffect(() => {
    fetchOrders();
    
    // Set up realtime updates every 2 minutes instead of 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter data when search or filters change
  useEffect(() => {
    let filtered = allData.filter(item => 
      item.orderId.toLowerCase().includes(searchText.toLowerCase())
    );

    if (minAmount !== null) {
      filtered = filtered.filter(item => item.totalAmount >= minAmount);
    }

    if (maxAmount !== null) {
      filtered = filtered.filter(item => item.totalAmount <= maxAmount);
    }

    // Sort data
    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sortOrder === 'desc') {
      filtered = [...filtered].sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setData(filtered);
  }, [searchText, minAmount, maxAmount, sortOrder, allData]);

  const handleShowDetail = (id: string) => {
    const order = ordersRaw.find(o => o._id === id || o.id === id);
    setSelectedOrder(order || null);
    setModalVisible(true);
  };

  const getStatusTag = (status: string) => {
    return status === 'Đã thanh toán' ? (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Đã thanh toán
      </Tag>
    ) : (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        Chưa thanh toán
      </Tag>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'vnpay':
        return <CreditCardOutlined style={{ color: '#1890ff' }} />;
      case 'momo':
        return <CreditCardOutlined style={{ color: '#eb2f96' }} />;
      case 'zalopay':
        return <CreditCardOutlined style={{ color: '#52c41a' }} />;
      default:
        return <CreditCardOutlined style={{ color: '#666' }} />;
    }
  };

    const columns: ColumnsType<Transaction> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 60,
      align: 'center' as const,
      render: (number: number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Giao dịch',
      key: 'transaction',
      width: 280,
      render: (_, record: Transaction) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            backgroundColor: '#f6ffed', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #b7eb8f'
          }}>
            <ShoppingCartOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          </div>
        <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              {record.orderId}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.buyerName} • {record.buyerEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      align: 'center' as const,
      render: (method: string) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {getPaymentMethodIcon(method)}
          <Text style={{ fontSize: '12px' }}>{method.toUpperCase()}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center' as const,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 110,
      align: 'right' as const,
      render: (amount?: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {amount?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center' as const,
      render: (_, record: Transaction) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleShowDetail(record.orderId);
            }}
          >
          Chi tiết
        </Button>
        </Tooltip>
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
                  Lịch sử giao dịch
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Quản lý và theo dõi tất cả giao dịch trong hệ thống
                </Paragraph>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <StatCards transactionStats={transactionStats} />

        {/* Filter Section */}
        <FilterSection
          searchText={searchText}
          setSearchText={setSearchText}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Transactions Table */}
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
                  Danh sách giao dịch
                </Title>
                <Badge count={data.length} showZero style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, data.length)} của {data.length} giao dịch
                </Text>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: data.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: 'small',
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 15);
                },
              }}
              rowKey="key"
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <EyeOutlined style={{ color: '#667eea', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
              Chi tiết đơn hàng
            </Text>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ borderRadius: '16px' }}
      >
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <Title level={3} style={{ margin: 0 }}>
                Đơn hàng #{selectedOrder._id || selectedOrder.id}
              </Title>
              {getStatusTag(selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán')}
            </div>
            
            <Divider />
            
            <Card 
              style={{ 
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                marginBottom: '20px'
              }} 
              bordered={false}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <CreditCardOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Phương thức thanh toán:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      {selectedOrder.paymentMethod?.toUpperCase() || 'Không xác định'}
                    </Text>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày đặt hàng:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      {dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
            
            <Divider />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 0'
            }}>
              <UserOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
              <div>
                <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Thông tin người mua:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {selectedOrder.fullName} • {selectedOrder.phone} • {selectedOrder.email}
                  </Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 0'
            }}>
              <ShoppingCartOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
              <div>
                <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Chi tiết sản phẩm:</Text>
              </div>
            </div>
            
            <div style={{ marginTop: '12px' }}>
              {(selectedOrder.items || []).map((item: any, index: number) => (
                <div
                  key={item._id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0'
                  }}
              >
                <img
                  src={item.courseId?.thumbnail || '/default-course.png'}
                  alt={item.courseId?.title}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      marginRight: '16px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                      {item.courseId?.title || 'Không xác định'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Số lượng: {item.quantity || 1}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                      {item.price?.toLocaleString('vi-VN')} đ
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            
            <Divider />
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '8px' }}>
                <Text>Tổng tiền: </Text>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ
                </Text>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Text>Giảm giá: </Text>
                  <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                    -{selectedOrder.discountAmount?.toLocaleString('vi-VN')} đ
                  </Text>
                </div>
              )}
              <div>
                <Text strong>Thực trả: </Text>
                <Text strong style={{ fontSize: '20px', color: '#52c41a' }}>
                  {(selectedOrder.finalAmount || selectedOrder.totalAmount)?.toLocaleString('vi-VN')} đ
                </Text>
              </div>
            </div>
          </motion.div>
        )}
      </Modal>
    </motion.div>
  );
};

export default TransactionHistory;
