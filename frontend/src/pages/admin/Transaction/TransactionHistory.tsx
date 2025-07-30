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
import styles from '../Users/UserPage.module.css';
import type { ColumnsType } from 'antd/es/table';

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
    <Card className={styles.filterCard} bordered={false}>
      <div className={styles.filterGroup}>
        <Input
          placeholder="Tìm ID đơn hàng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className={styles.filterInput}
          allowClear
        />
        <Input
          placeholder="Giá tối thiểu"
          type="number"
          value={minAmount ?? ''}
          onChange={e => setMinAmount(e.target.value ? +e.target.value : null)}
          className={styles.filterInput}
          prefix={<DollarOutlined />}
        />
        <Input
          placeholder="Giá tối đa"
          type="number"
          value={maxAmount ?? ''}
          onChange={e => setMaxAmount(e.target.value ? +e.target.value : null)}
          className={styles.filterInput}
          prefix={<DollarOutlined />}
        />
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) => setDateRange(dates)}
          className={styles.filterDateRange}
          format="DD/MM/YYYY"
          value={dateRange}
        />
        <Dropdown menu={sortMenu}>
          <Button className={styles.filterButton}>
            <FilterOutlined />
            Sắp xếp: {sortOrder === 'asc' ? 'Tăng' : sortOrder === 'desc' ? 'Giảm' : 'Không'}
            <CaretDownOutlined />
          </Button>
        </Dropdown>
      </div>
    </Card>
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
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <ShoppingCartOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng giao dịch" 
                value={transactionStats.total} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả đơn hàng</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <DollarOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng doanh thu" 
                value={transactionStats.totalAmount} 
                suffix="đ"
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tổng tiền</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Đã thanh toán" 
                value={transactionStats.paidCount} 
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">{paidPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#faad14' }}>
              <ClockCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Chờ thanh toán" 
                value={transactionStats.pendingCount} 
                valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#faad14' }} />
                <Text type="secondary">{pendingPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
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
      <div className={styles.userPageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Lịch sử giao dịch
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Quản lý và theo dõi tất cả giao dịch trong hệ thống
          </Paragraph>
        </div>
      </div>

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
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <BookOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách giao dịch
            </Title>
            <Badge count={data.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
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
          className={styles.userTable}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <EyeOutlined className={styles.modalIcon} />
            Chi tiết đơn hàng
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className={styles.userModal}
      >
        {selectedOrder && (
          <div>
            <div className={styles.userDetailHeaderBox}>
              <Title level={3} style={{ margin: 0 }}>
                Đơn hàng #{selectedOrder._id || selectedOrder.id}
              </Title>
              {getStatusTag(selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán')}
            </div>
            
            <Divider />
            
            <Card className={styles.userDetailCard} bordered={false}>
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <CreditCardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  <Text strong>Phương thức thanh toán:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedOrder.paymentMethod?.toUpperCase() || 'Không xác định'}
                  </Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  <Text strong>Ngày đặt hàng:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}
                  </Text>
                </div>
              </div>
            </Card>
            
            <Divider />
            
            <div className={styles.userDetailRow}>
              <div className={styles.userDetailLabel}>
                <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <Text strong>Thông tin người mua:</Text>
              </div>
              <div>
                <Text type="secondary">
                  {selectedOrder.fullName} • {selectedOrder.phone} • {selectedOrder.email}
                </Text>
              </div>
            </div>
            
            <Divider />
            
            <div className={styles.userDetailRow}>
              <div className={styles.userDetailLabel}>
                <ShoppingCartOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong>Chi tiết sản phẩm:</Text>
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionHistory;
