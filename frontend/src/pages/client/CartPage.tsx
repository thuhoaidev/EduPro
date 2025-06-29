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
  Checkbox,
  Spin,
  Input
} from 'antd';
import { 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  CreditCardOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { config as apiClient } from '../../api/axios';
import { useCart } from '../../contexts/CartContext';
import voucherService from '../../services/voucher.service';
import orderService from '../../services/orderService';
import type { ValidateVoucherResponse } from '../../services/voucher.service';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  course: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    discount?: number;
    instructor?: {
      name?: string;
    };
    slug: string;
    rating?: number;
    students?: number;
    duration?: string;
    level?: string;
  };
  priceAtAddition: number;
  addedAt: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [voucher, setVoucher] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherValidation, setVoucherValidation] = useState<ValidateVoucherResponse | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { updateCartCount } = useCart();
  const { user, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem('token');
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, không thể tải giỏ hàng');
        setCartItems([]);
        return;
      }
      
      const res = await apiClient.get('/carts');
      const items = res.data.items.map((item: any) => {
        const course = item.course;
        const discount = course.discount || 0;
        const finalPrice = Math.round(course.price * (1 - discount / 100));

        return {
          id: item._id,
          course: {
            ...course,
            rating: course.rating || 4.5,
            students: course.students || 1000,
            duration: course.duration || '10 giờ',
            level: course.level || 'Trung cấp'
          },
          priceAtAddition: finalPrice,
          addedAt: item.addedAt,
          quantity: 1,
        };
      });
      setCartItems(items);
      setSelectedItems(items.map((item: { id: any; }) => item.id));
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (itemId: string) => {
    try {
      await apiClient.delete(`/carts/${itemId}`);
      message.success('Đã xóa khóa học khỏi giỏ hàng');
      fetchCart();
      updateCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Lỗi khi xóa khóa học');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucher.trim()) {
      message.warning('Vui lòng nhập mã giảm giá!');
      return;
    }

    if (!token) {
      message.error('Vui lòng đăng nhập để sử dụng voucher!');
      return;
    }

    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khóa học để áp dụng voucher!');
      return;
    }
    
    setIsApplyingVoucher(true);
    setVoucherError('');
    setVoucherValidation(null);

    try {
      // Tính tổng tiền đơn hàng
      const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
      const orderAmount = selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0);

      // Validate voucher
      const validationResult = await voucherService.validate(
        { code: voucher.trim(), orderAmount },
        token
      );

      setVoucherValidation(validationResult);
      message.success('Áp dụng mã giảm giá thành công!');
      
    } catch (error: any) {
      console.error('Voucher validation error:', error);
      setVoucherError(error.response?.data?.message || 'Mã giảm giá không hợp lệ!');
      message.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ!');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucher('');
    setVoucherValidation(null);
    setVoucherError('');
    message.info('Đã xóa mã giảm giá');
  };

  const handleCheckout = async () => {
    if (!token) {
      message.error('Vui lòng đăng nhập để thanh toán!');
      return;
    }

    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khóa học để thanh toán!');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
      const orderItems = selectedCartItems.map(item => ({
        courseId: item.course.id,
        quantity: item.quantity
      }));

      // Lưu thông tin đơn hàng vào localStorage để checkout page sử dụng
      const checkoutData = {
        items: orderItems,
        voucherCode: voucherValidation ? voucherValidation.voucher.code : undefined,
        voucherValidation: voucherValidation,
        subtotal: selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0),
        discount: voucherValidation ? voucherValidation.discountAmount : 0,
        total: selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0) - (voucherValidation ? voucherValidation.discountAmount : 0)
      };

      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Chuyển đến trang checkout
      navigate('/checkout');
      
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Lỗi khi chuẩn bị thanh toán');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Tính toán các giá trị
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0);
  const discount = voucherValidation ? voucherValidation.discountAmount : 0;
  const total = subtotal - discount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Giỏ hàng trống"
              className="my-16"
            >
              <Link to="/courses">
                <Button type="primary" size="large">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </Empty>
          </motion.div>
        </div>
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
              <ShoppingCartOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">Giỏ hàng</Title>
              <Badge count={cartItems.length} showZero />
            </div>
          </div>

          <Row gutter={24}>
            {/* Cart Items Column */}
            <Col xs={24} lg={16}>
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <div className="flex items-center justify-between">
                      <span>Khóa học đã chọn</span>
                      <Checkbox 
                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      >
                        Chọn tất cả
                      </Checkbox>
                    </div>
                  }
                  className="shadow-lg border-0"
                >
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="mb-4 last:mb-0"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            />
                            
                            <img 
                              src={item.course.thumbnail} 
                              alt={item.course.title}
                              className="w-24 h-16 object-cover rounded-lg"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <Title level={5} className="!mb-2 truncate">
                                    {item.course.title}
                                  </Title>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span>⭐ {item.course.rating}</span>
                                    <span>👥 {item.course.students?.toLocaleString()}</span>
                                    <span>⏱️ {item.course.duration}</span>
                                    <span>📊 {item.course.level}</span>
                                  </div>
                                  
                                  {item.course.instructor?.name && (
                                    <Text type="secondary" className="text-sm">
                                      Giảng viên: {item.course.instructor.name}
                                    </Text>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-baseline gap-2">
                                    <Text strong className="text-xl text-red-500">
                                      {formatCurrency(item.priceAtAddition)}
                                    </Text>
                                    {item.course.discount && (
                                      <>
                                        <Text delete type="secondary">
                                          {formatCurrency(item.course.price)}
                                        </Text>
                                        <Tag color="red">Giảm {item.course.discount}%</Tag>
                                      </>
                                    )}
                                  </div>
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      type="text" 
                                      danger 
                                      icon={<DeleteOutlined />} 
                                      onClick={() => removeItem(item.id)}
                                      className="!h-10 !px-4"
                                    >
                                      Xóa
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </Col>
            
            {/* Order Summary Column */}
            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined style={{ color: '#1890ff' }} />
                      <span>Tóm tắt đơn hàng</span>
                    </div>
                  } 
                  className="shadow-xl border-0 sticky top-24"
                  styles={{
                    header: {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none'
                    }
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Text>Tạm tính ({selectedItems.length} khóa học):</Text>
                      <Text strong className="text-lg">{formatCurrency(subtotal)}</Text>
                    </div>
                    
                    {discount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                      >
                        <Text className="text-green-600">Giảm giá:</Text>
                        <Text strong className="text-green-600 text-lg">-{formatCurrency(discount)}</Text>
                      </motion.div>
                    )}
                    
                    <Divider className="my-4" />
                    
                    <div className="flex justify-between items-baseline">
                      <Title level={4} className="!mb-0">Tổng cộng:</Title>
                      <Title level={2} className="!mb-0 text-red-500">{formatCurrency(total)}</Title>
                    </div>
                    
                    {/* Voucher Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text strong>Mã giảm giá</Text>
                      </div>
                      
                      {voucherValidation ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-50 p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Text strong className="text-green-600">
                              {voucherValidation.voucher.code}
                            </Text>
                            <Button 
                              type="text" 
                              size="small" 
                              onClick={handleRemoveVoucher}
                              className="text-red-500"
                            >
                              Xóa
                            </Button>
                          </div>
                          <Text className="text-sm text-green-600">
                            {voucherValidation.voucher.title}
                          </Text>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nhập mã giảm giá"
                              value={voucher}
                              onChange={(e) => setVoucher(e.target.value)}
                              onPressEnter={handleApplyVoucher}
                              disabled={isApplyingVoucher}
                            />
                            <Button 
                              type="primary"
                              onClick={handleApplyVoucher}
                              loading={isApplyingVoucher}
                              disabled={!voucher.trim() || selectedItems.length === 0}
                            >
                              Áp dụng
                            </Button>
                          </div>
                          {voucherError && (
                            <Text type="danger" className="text-sm">
                              {voucherError}
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="primary" 
                        size="large" 
                        block 
                        className="!h-14 !text-lg !font-semibold"
                        icon={<SafetyOutlined />}
                        disabled={selectedItems.length === 0 || isCheckingOut}
                        loading={isCheckingOut}
                        onClick={handleCheckout}
                      >
                        {isCheckingOut ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                      </Button>
                    </motion.div>
                    
                    <Link to="/courses">
                      <motion.div
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          type="link" 
                          block 
                          icon={<ArrowLeftOutlined />}
                          className="!h-10"
                        >
                          Tiếp tục mua sắm
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default CartPage;