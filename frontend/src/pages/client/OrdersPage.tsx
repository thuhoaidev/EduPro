import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Divider, 
  message, 
  Empty, 
  Badge, 
  Tag, 
  Spin,
  Pagination,
  Select,
  Space,
  Modal,
  Input,
  Statistic
} from 'antd';
import { 
  ShoppingOutlined, 
  EyeOutlined, 
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  StarFilled,
  UserOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import type { Order } from '../../services/orderService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'paid':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'refunded':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'paid':
        return 'Đã thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'paid':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      case 'refunded':
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    
    if (methodLower.includes('zalopay') || methodLower.includes('zalo')) {
      return (
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
          alt="ZaloPay"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    if (methodLower.includes('momo') || methodLower.includes('momo')) {
      return (
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
          alt="MoMo"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    if (methodLower.includes('vnpay') || methodLower.includes('vnpay')) {
      return (
        <img 
          src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
          alt="VNPay"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    if (methodLower.includes('bank') || methodLower.includes('transfer')) {
      return <BankOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
    }
    
    if (methodLower.includes('card') || methodLower.includes('credit')) {
      return <CreditCardOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
    }
    
    if (methodLower.includes('wallet') || methodLower.includes('balance')) {
      return <WalletOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />;
    }
    
    // Default icon
    return <DollarOutlined style={{ color: '#722ed1', fontSize: '20px' }} />;
  };

  const getPaymentMethodText = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    
    if (methodLower.includes('zalopay') || methodLower.includes('zalo')) {
      return 'ZaloPay';
    }
    
    if (methodLower.includes('momo') || methodLower.includes('momo')) {
      return 'MoMo';
    }
    
    if (methodLower.includes('vnpay') || methodLower.includes('vnpay')) {
      return 'VNPay';
    }
    
    if (methodLower.includes('bank') || methodLower.includes('transfer')) {
      return 'Chuyển khoản';
    }
    
    if (methodLower.includes('card') || methodLower.includes('credit')) {
      return 'Thẻ tín dụng';
    }
    
    if (methodLower.includes('wallet') || methodLower.includes('balance')) {
      return 'Ví điện tử';
    }
    
    return method?.toUpperCase() || '---';
  };

  const fetchOrders = async () => {
    if (!token) {
      message.error('Vui lòng đăng nhập để xem đơn hàng');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.getUserOrders(
        token, 
        currentPage, 
        pageSize, 
        statusFilter
      );
      
      setOrders(response.orders);
      setTotal(response.pagination.total);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      message.error(error.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, statusFilter, token]);

  // Thêm useEffect để refresh orders khi component mount
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token) return;

    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn hàng',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await orderService.cancelOrder(orderId, token);
          message.success('Hủy đơn hàng thành công');
          fetchOrders();
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi hủy đơn hàng');
        }
      }
    });
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.finalAmount, 0);
  const paidOrders = orders.filter(order => order.status === 'paid').length;

  if (loading && orders.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#718096' }}>
            Đang tải danh sách đơn hàng...
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orderSearch ? orders.filter(order => order.id.includes(orderSearch)) : orders;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '32px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
              backgroundSize: '30px 30px',
              animation: 'float 8s ease-in-out infinite'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '24px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                }}>
                  <ShoppingOutlined style={{ fontSize: '36px', color: 'white' }} />
                </div>
                <div>
                  <Title level={1} style={{ 
                    margin: 0, 
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '32px'
                  }}>
                    Đơn hàng của tôi
                  </Title>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '16px',
                    display: 'block',
                    marginTop: '8px'
                  }}>
                    Quản lý và theo dõi tất cả đơn hàng của bạn
                  </Text>
                </div>
              </div>

              {/* Statistics Row */}
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <Card style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Statistic
                      title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng đơn hàng</Text>}
                      value={totalOrders}
                      prefix={<FileTextOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
                      valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Statistic
                      title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>Đã thanh toán</Text>}
                      value={paidOrders}
                      prefix={<CheckCircleOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
                      valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Statistic
                      title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng chi tiêu</Text>}
                      value={formatCurrency(totalAmount)}
                      prefix={<DollarOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
                      valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>

          {/* Search and Filter Section */}
          <Card style={{
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            marginBottom: '24px'
          }}>
            <Row gutter={[24, 16]} align="middle">
              <Col xs={24} md={12}>
            <Input.Search
                  placeholder="Tìm kiếm theo mã đơn hàng..."
              allowClear
              onSearch={value => setOrderSearch(value)}
                  prefix={<SearchOutlined style={{ color: '#667eea' }} />}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  allowClear
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  style={{
                    width: '100%',
                    borderRadius: '12px'
                  }}
                >
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="paid">Đã thanh toán</Option>
                  <Option value="cancelled">Đã hủy</Option>
                  <Option value="refunded">Đã hoàn tiền</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card style={{
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text style={{ color: '#718096', fontSize: '16px' }}>
                    {orderSearch ? 'Không tìm thấy đơn hàng nào' : 'Bạn chưa có đơn hàng nào'}
                  </Text>
                }
              >
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/courses')}
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  Khám phá khóa học
                </Button>
              </Empty>
            </Card>
          ) : (
            <div style={{ marginBottom: '32px' }}>
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ marginBottom: '20px' }}
                  >
                    <Card 
                      style={{
                        borderRadius: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            padding: '8px 16px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}>
                            <Text code style={{ fontSize: '14px', fontWeight: 600 }}>
                              {order.id}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarOutlined style={{ color: '#667eea' }} />
                            <Text style={{ color: '#718096', fontSize: '14px' }}>
                              {formatDate(order.createdAt)}
                          </Text>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Tag
                            color={getStatusColor(order.status)}
                            icon={getStatusIcon(order.status)}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 16px',
                              fontWeight: 600,
                              fontSize: '14px',
                              border: 'none'
                            }}
                          >
                            {getStatusText(order.status)}
                          </Tag>
                          <Button 
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(order)}
                            style={{
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                            }}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div style={{ marginBottom: '20px' }}>
                        {order.items.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '16px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <img 
                              src={item.courseId.thumbnail} 
                              alt={item.courseId.title}
                              style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                                                         <div style={{ flex: 1 }}>
                               <Text strong style={{ 
                                 fontSize: '16px',
                                 color: '#1a202c',
                                 display: 'block',
                                 marginBottom: '8px'
                               }}>
                                {item.courseId.title}
                              </Text>
                               
                               {/* Instructor Info */}
                               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                 {(item.courseId as any)?.author?.avatar ? (
                                   <img 
                                     src={(item.courseId as any)?.author?.avatar} 
                                     alt="Instructor"
                                     style={{
                                       width: '20px',
                                       height: '20px',
                                       borderRadius: '50%',
                                       marginRight: '8px',
                                       objectFit: 'cover'
                                     }}
                                   />
                                 ) : (
                                   <div style={{
                                     width: '20px',
                                     height: '20px',
                                     borderRadius: '50%',
                                     marginRight: '8px',
                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     color: 'white',
                                     fontSize: '10px',
                                     fontWeight: 'bold'
                                   }}>
                                     {(item.courseId as any)?.author?.name?.charAt(0) || 'E'}
                                   </div>
                                 )}
                                 <Text style={{ 
                                   fontSize: '14px',
                                   color: '#718096'
                                 }}>
                                   {(item.courseId as any)?.author?.name || 'EduPro'}
                                 </Text>
                               </div>
                               
                               {/* Course Stats */}
                               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                 {/* Rating */}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <StarFilled style={{ color: '#fbbf24', fontSize: '14px' }} />
                                   <Text style={{ fontSize: '12px', color: '#718096' }}>
                                     {(item.courseId as any)?.rating > 0 ? (item.courseId as any)?.rating?.toFixed(1) : 'Chưa có đánh giá'}
                                   </Text>
                                 </div>
                                 
                                 {/* Duration */}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <PlayCircleOutlined style={{ color: '#667eea', fontSize: '14px' }} />
                                   <Text style={{ fontSize: '12px', color: '#718096' }}>
                                     {(item.courseId as any)?.duration !== '0 phút' ? (item.courseId as any)?.duration : 'Chưa có nội dung'}
                                   </Text>
                                 </div>
                                 
                                 {/* Students */}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <UserOutlined style={{ color: '#10b981', fontSize: '14px' }} />
                                   <Text style={{ fontSize: '12px', color: '#718096' }}>
                                     {(item.courseId as any)?.students > 0 ? (item.courseId as any)?.students?.toLocaleString() : 'Chưa có học viên'}
                              </Text>
                            </div>
                               </div>
                             </div>
                            <Text strong style={{ 
                              color: '#e53e3e',
                              fontSize: '18px',
                              fontWeight: 700
                            }}>
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <Divider style={{ margin: '20px 0' }} />
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {getPaymentMethodIcon(order.paymentMethod)}
                             <Text style={{ fontSize: '16px', color: '#4a5568' }}>
                               <Text strong>{getPaymentMethodText(order.paymentMethod)}</Text>
                             </Text>
                           </div>
                          {order.voucher && (
                            <Tag color="blue" style={{ borderRadius: '8px', padding: '4px 12px' }}>
                              Voucher: {order.voucher.code}
                            </Tag>
                          )}
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          {order.discountAmount > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <Text style={{ color: '#718096' }}>Giảm giá: </Text>
                              <Text style={{ color: '#38a169', fontWeight: 600 }}>
                                -{formatCurrency(order.discountAmount)}
                              </Text>
                            </div>
                          )}
                          <div>
                            <Text style={{ fontSize: '18px', color: '#4a5568' }}>Tổng cộng: </Text>
                            <Text style={{ 
                              fontSize: '24px',
                              color: '#e53e3e',
                              fontWeight: 800
                            }}>
                              {formatCurrency(order.finalAmount)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {total > pageSize && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginTop: '32px'
                }}>
                  <Card style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}>
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} đơn hàng`
                    }
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                      style={{ padding: '8px' }}
                  />
                  </Card>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Order Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileTextOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <span>Chi tiết đơn hàng</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
          style={{ top: 20 }}
          bodyStyle={{ padding: '24px' }}
        >
          {selectedOrder && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Text strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>
                        Mã đơn hàng
                      </Text>
                      <Text code style={{ fontSize: '16px', fontWeight: 600 }}>
                        {selectedOrder.id}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Text strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>
                        Ngày đặt
                      </Text>
                      <Text style={{ fontSize: '16px' }}>
                        {formatDate(selectedOrder.createdAt)}
                      </Text>
                </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                                             <Text strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>
                         Phương thức thanh toán
                       </Text>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                         <Text style={{ fontSize: '16px' }}>
                           {getPaymentMethodText(selectedOrder.paymentMethod)}
                         </Text>
                </div>
                </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Text strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>
                        Trạng thái
                      </Text>
                      <Tag
                        color={getStatusColor(selectedOrder.status)}
                        icon={getStatusIcon(selectedOrder.status)}
                        style={{
                          borderRadius: '8px',
                          padding: '6px 16px',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}
                      >
                        {getStatusText(selectedOrder.status)}
                      </Tag>
                  </div>
                  </Col>
                </Row>
                  </div>

              {/* Customer Information */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                  Thông tin khách hàng
                </Title>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Row gutter={[16, 12]}>
                    <Col xs={24} sm={8}>
                      <Text strong style={{ color: '#4a5568' }}>Họ tên:</Text>
                      <br />
                      <Text>{selectedOrder.fullName || '---'}</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong style={{ color: '#4a5568' }}>Số điện thoại:</Text>
                      <br />
                      <Text>{selectedOrder.phone || '---'}</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong style={{ color: '#4a5568' }}>Email:</Text>
                      <br />
                      <Text>{selectedOrder.email || '---'}</Text>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                    Địa chỉ giao hàng
                  </Title>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                      {selectedOrder.shippingAddress.fullName}
                    </Text>
                    <Text style={{ display: 'block', marginBottom: '4px' }}>
                      {selectedOrder.shippingAddress.phone}
                    </Text>
                    <Text style={{ color: '#4a5568' }}>
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                    </Text>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                  Chi tiết sản phẩm
                </Title>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '16px',
                      marginBottom: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <img 
                        src={item.courseId.thumbnail} 
                        alt={item.courseId.title}
                        style={{
                          width: '100px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                                             <div style={{ flex: 1 }}>
                         <Text strong style={{ 
                           fontSize: '16px',
                           color: '#1a202c',
                           display: 'block',
                           marginBottom: '8px'
                         }}>
                          {item.courseId.title}
                        </Text>
                         
                         {/* Instructor Info */}
                         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                           {(item.courseId as any)?.author?.avatar ? (
                             <img 
                               src={(item.courseId as any)?.author?.avatar} 
                               alt="Instructor"
                               style={{
                                 width: '20px',
                                 height: '20px',
                                 borderRadius: '50%',
                                 marginRight: '8px',
                                 objectFit: 'cover'
                               }}
                             />
                           ) : (
                             <div style={{
                               width: '20px',
                               height: '20px',
                               borderRadius: '50%',
                               marginRight: '8px',
                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               color: 'white',
                               fontSize: '10px',
                               fontWeight: 'bold'
                             }}>
                               {(item.courseId as any)?.author?.name?.charAt(0) || 'E'}
                             </div>
                           )}
                           <Text style={{ 
                             fontSize: '14px',
                             color: '#718096'
                           }}>
                             {(item.courseId as any)?.author?.name || 'EduPro'}
                           </Text>
                         </div>
                         
                         {/* Course Stats */}
                         <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                           {/* Rating */}
                           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <StarFilled style={{ color: '#fbbf24', fontSize: '14px' }} />
                             <Text style={{ fontSize: '12px', color: '#718096' }}>
                               {(item.courseId as any)?.rating > 0 ? (item.courseId as any)?.rating?.toFixed(1) : 'Chưa có đánh giá'}
                             </Text>
                           </div>
                           
                           {/* Duration */}
                           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <PlayCircleOutlined style={{ color: '#667eea', fontSize: '14px' }} />
                             <Text style={{ fontSize: '12px', color: '#718096' }}>
                               {(item.courseId as any)?.duration !== '0 phút' ? (item.courseId as any)?.duration : 'Chưa có nội dung'}
                             </Text>
                           </div>
                           
                           {/* Students */}
                           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <UserOutlined style={{ color: '#10b981', fontSize: '14px' }} />
                             <Text style={{ fontSize: '12px', color: '#718096' }}>
                               {(item.courseId as any)?.students > 0 ? (item.courseId as any)?.students?.toLocaleString() : 'Chưa có học viên'}
                        </Text>
                      </div>
                         </div>
                       </div>
                      <Text strong style={{ 
                        color: '#e53e3e',
                        fontSize: '18px',
                        fontWeight: 700
                      }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                  Tổng kết đơn hàng
                </Title>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrder.discountAmount > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <Text style={{ fontSize: '16px', color: '#4a5568' }}>Giảm giá:</Text>
                      <Text style={{ 
                        fontSize: '16px',
                        color: '#38a169',
                        fontWeight: 600
                      }}>
                        -{formatCurrency(selectedOrder.discountAmount)}
                      </Text>
                  </div>
                )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '2px solid #e2e8f0',
                    paddingTop: '16px'
                  }}>
                    <Text strong style={{ fontSize: '20px', color: '#2d3748' }}>
                      Tổng cộng:
                    </Text>
                    <Text strong style={{ 
                      fontSize: '24px',
                      color: '#e53e3e',
                      fontWeight: 800
                    }}>
                    {formatCurrency(selectedOrder.finalAmount)}
                  </Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        .ant-card {
          transition: all 0.3s ease;
        }
        
        .ant-input:focus,
        .ant-input-focused {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        .ant-input:hover {
          border-color: #667eea !important;
        }
        
        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #667eea !important;
        }
        
        .ant-select-focused .ant-select-selector {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        @media (max-width: 768px) {
          .ant-card {
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage; 