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
  Input
} from 'antd';
import { 
  ShoppingOutlined, 
  EyeOutlined, 
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import type { Order } from '../../services/orderService';

const { Title, Text } = Typography;
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
        return 'processing';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'warning';
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">Đơn hàng của tôi</Title>
            </div>
            {/* Bỏ Select lọc trạng thái, thay bằng ô tìm kiếm */}
            <Input.Search
              placeholder="Nhập mã đơn hàng để tìm kiếm"
              allowClear
              onSearch={value => setOrderSearch(value)}
              style={{ width: 300 }}
            />
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card className="shadow-sm">
              <Empty
                description="Bạn chưa có đơn hàng nào"
                className="my-16"
              >
                <Button type="primary" onClick={() => navigate('/courses')}>
                  Mua khóa học ngay
                </Button>
              </Empty>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {(orderSearch ? orders.filter(order => order.id.includes(orderSearch)) : orders).map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-4"
                  >
                    <Card 
                      className="shadow-sm hover:shadow-md transition-shadow"
                      actions={[
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetail(order)}
                        >
                          Xem chi tiết
                        </Button>,
                      ].filter(Boolean)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Text type="secondary">
                            Mã đơn hàng: <Text code>{order.id}</Text>
                          </Text>
                        </div>
                        <div>
                          <Text strong>Phương thức thanh toán:</Text>
                          <Text> {order.paymentMethod?.toUpperCase() || '---'} </Text>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={item.courseId.thumbnail} 
                              alt={item.courseId.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <Text strong className="block">
                                {item.courseId.title}
                              </Text>
                              <Text type="secondary" className="text-sm">
                                Số lượng: {item.quantity}
                              </Text>
                            </div>
                            <Text strong className="text-red-500">
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </div>
                        ))}
                      </div>

                      <Divider className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {order.discountAmount > 0 && (
                            <div className="flex items-center gap-2">
                              <Text>Giảm giá:</Text>
                              <Text type="success">-{formatCurrency(order.discountAmount)}</Text>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Text strong>Tổng cộng:</Text>
                            <Text strong className="text-red-500 text-lg">
                              {formatCurrency(order.finalAmount)}
                            </Text>
                          </div>
                        </div>

                        {order.voucher && (
                          <div className="text-right">
                            <Tag color="blue">
                              Voucher: {order.voucher.code}
                            </Tag>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex justify-center mt-6">
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
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Order Detail Modal */}
        <Modal
          title="Chi tiết đơn hàng"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong>Mã đơn hàng:</Text>
                  <br />
                  <Text code>{selectedOrder.id}</Text>
                </div>
                <div>
                  <Text strong>Ngày đặt:</Text>
                  <br />
                  <Text>{formatDate(selectedOrder.createdAt)}</Text>
                </div>
                <div>
                  <Text strong>Phương thức thanh toán:</Text>
                  <Text> {selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : '---'} </Text>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <Text strong>Ghi chú:</Text>
                    <br />
                    <Text>{selectedOrder.notes}</Text>
                  </div>
                )}
                <div className="col-span-2">
                  <Text strong>Thông tin người đặt:</Text>
                  <div className="mt-1">
                    <Text>Họ tên: {selectedOrder.fullName || '---'}</Text><br />
                    <Text>Số điện thoại: {selectedOrder.phone || '---'}</Text><br />
                    <Text>Email: {selectedOrder.email || '---'}</Text>
                  </div>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div>
                  <Text strong>Địa chỉ giao hàng:</Text>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <Text>{selectedOrder.shippingAddress.fullName}</Text>
                    <br />
                    <Text>{selectedOrder.shippingAddress.phone}</Text>
                    <br />
                    <Text>
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                    </Text>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <Text strong>Ghi chú:</Text>
                  <br />
                  <Text>{selectedOrder.notes}</Text>
                </div>
              )}

              <Divider />

              <div>
                <Text strong>Chi tiết sản phẩm:</Text>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                      <img 
                        src={item.courseId.thumbnail} 
                        alt={item.courseId.title}
                        className="w-20 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <Text strong className="block">
                          {item.courseId.title}
                        </Text>
                        <Text type="secondary" className="text-sm">
                          Số lượng: {item.quantity}
                        </Text>
                      </div>
                      <Text strong className="text-red-500">
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              <div className="text-right space-y-2">
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <Text>Giảm giá:</Text>
                    <Text type="success">-{formatCurrency(selectedOrder.discountAmount)}</Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text strong>Tổng cộng:</Text>
                  <Text strong className="text-red-500 text-lg">
                    {formatCurrency(selectedOrder.finalAmount)}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage; 